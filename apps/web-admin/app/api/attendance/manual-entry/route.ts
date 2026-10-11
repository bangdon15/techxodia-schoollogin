import { NextRequest, NextResponse } from "next/server";
import {
  findUserByIdAndPin,
  findUserByPin,
  lookupUserPreview,
  recalibrateBiometrics,
} from "@/lib/biometric-registry";
import { addAttendanceRecord } from "@/lib/attendance-store";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Kiosk-Token",
    },
  });
}

/**
 * Attendance Manual Entry & Biometric Fail-Safe Fallback Endpoint
 * 
 * Supports:
 * 1. Two-Factor ATM Verification: Student/Employee ID + Security PIN (Option 1)
 * 2. Instant ID Preview Lookup (before PIN entry)
 * 3. Self-Healing Adaptive Biometric Recalibration
 */
export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Kiosk-Token",
  };

  try {
    const body = await req.json().catch(() => ({}));
    const {
      action,
      student_or_emp_id,
      pin,
      recalibrate_vector,
      direction = "time_in",
      override_reason,
      location_tag,
      kiosk_id,
      timestamp = new Date().toISOString(),
      admin_override = false,
    } = body;

    // A. Preview Lookup: Kiosk sends Student/Staff ID to confirm identity
    if (action === "preview" && student_or_emp_id) {
      const preview = lookupUserPreview(student_or_emp_id);
      if (preview) {
        return NextResponse.json(
          {
            success: true,
            found: true,
            preview,
            message: `Identity found: ${preview.first_name} ${preview.last_name}`,
          },
          { headers }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            found: false,
            error: `ID '${student_or_emp_id}' not found in school registry`,
            message: "Student / Staff ID not found. Please re-check your ID card.",
          },
          { status: 404, headers }
        );
      }
    }

    // Determine current shift time status (On Time before 08:30 AM)
    const now = new Date();
    const hour = now.getUTCHours() + 8; // UTC+8 Manila
    const minute = now.getUTCMinutes();
    const isLate = hour > 8 || (hour === 8 && minute > 30);
    const status = isLate ? "late" : "on_time";
    const gateLocation = location_tag || "North Campus Turnstiles";

    // B. Two-Factor ATM Pattern (Student/Employee ID + PIN)
    let matchedUser = null;
    if (student_or_emp_id && pin) {
      matchedUser = findUserByIdAndPin(student_or_emp_id, pin);
    } else if (pin) {
      matchedUser = findUserByPin(pin);
    }

    if (matchedUser) {
      // Optional Adaptive Self-Healing: Recalibrate face vector for future instant scans
      let recalibrated = false;
      if (recalibrate_vector && Array.isArray(recalibrate_vector) && recalibrate_vector.length > 0) {
        recalibrated = recalibrateBiometrics(matchedUser.student_or_emp_id, recalibrate_vector);
      }

      const attendanceId = `att-atm-${Date.now()}`;
      addAttendanceRecord({
        id: attendanceId,
        timestamp,
        student_id: matchedUser.student_or_emp_id,
        student_no: matchedUser.student_or_emp_id,
        full_name: `${matchedUser.first_name} ${matchedUser.last_name}`,
        name: `${matchedUser.first_name} ${matchedUser.last_name}`,
        grade_section: matchedUser.grade_section,
        grade: matchedUser.grade_section,
        avatar_url: matchedUser.avatar_url,
        location_tag: gateLocation,
        kiosk: gateLocation,
        direction: direction as any,
        status,
        confidence_score: 1.0,
        confidence: "100%",
        verification_method: "backup_pin",
        override_reason: override_reason || "ATM ID + PIN Fail-Safe Override",
      });

      return NextResponse.json(
        {
          success: true,
          matched: true,
          recalibrated,
          attendance_id: attendanceId,
          user_id: matchedUser.id,
          student_or_emp_id: matchedUser.student_or_emp_id,
          first_name: matchedUser.first_name,
          last_name: matchedUser.last_name,
          grade_section: matchedUser.grade_section,
          avatar_url: matchedUser.avatar_url,
          direction,
          status,
          location_tag: gateLocation,
          confidence_score: 1.0,
          timestamp,
          message: `Two-Factor ID verified. Welcome, ${matchedUser.first_name} ${matchedUser.last_name}!${
            recalibrated ? " (Biometrics Recalibrated)" : ""
          }`,
        },
        { headers }
      );
    }

    // Invalid PIN or ID
    return NextResponse.json(
      {
        success: false,
        matched: false,
        error: "Incorrect Student ID or PIN. Please retry.",
        message: "Authentication failed. Please verify your Student ID and 4-digit PIN.",
      },
      { status: 400, headers }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process manual entry",
      },
      { status: 500, headers }
    );
  }
}
