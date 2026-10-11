import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { findUserByPin } from "@/lib/biometric-registry";
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
 * Called when:
 * 1. User taps "Not you?" or "Enter PIN" after face verification fails or misidentifies.
 * 2. User enters 4-digit backup PIN or scans digital QR pass.
 */
export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Kiosk-Token",
  };

  try {
    const body = await req.json().catch(() => ({}));
    const {
      student_or_emp_id,
      pin,
      direction = "time_in",
      override_reason,
      location_tag,
      kiosk_id,
      timestamp = new Date().toISOString(),
      admin_override = false,
    } = body;

    // Determine current shift time status (On Time before 08:30 AM)
    const now = new Date();
    const hour = now.getUTCHours() + 8; // UTC+8 Manila
    const minute = now.getUTCMinutes();
    const isLate = hour > 8 || (hour === 8 && minute > 30);
    const status = isLate ? "late" : "on_time";

    const gateLocation = location_tag || "North Campus Turnstiles";

    // 1. If 4-digit PIN provided, find user in biometric registry
    if (pin) {
      const matchedUser = findUserByPin(pin, student_or_emp_id);
      if (matchedUser) {
        const attendanceId = `att-pin-${Date.now()}`;
        const record = addAttendanceRecord({
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
          override_reason: override_reason || "PIN Fail-Safe Override",
        });

        return NextResponse.json(
          {
            success: true,
            matched: true,
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
            message: `Backup PIN verified. Welcome, ${matchedUser.first_name} ${matchedUser.last_name}!`,
          },
          { headers }
        );
      }
    }

    // 2. Direct student ID match if PIN not supplied or custom override
    if (student_or_emp_id) {
      const registryUser = findUserByPin("", student_or_emp_id);
      const displayName = registryUser
        ? `${registryUser.first_name} ${registryUser.last_name}`
        : student_or_emp_id.startsWith("EMP")
        ? "Faculty Member"
        : "Student Member";

      const attendanceId = `att-manual-${Date.now()}`;
      addAttendanceRecord({
        id: attendanceId,
        timestamp,
        student_id: student_or_emp_id,
        student_no: student_or_emp_id,
        full_name: displayName,
        name: displayName,
        grade_section: registryUser?.grade_section || "General Class",
        grade: registryUser?.grade_section || "General Class",
        avatar_url: registryUser?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&auto=format&fit=crop&q=80",
        location_tag: gateLocation,
        kiosk: gateLocation,
        direction: direction as any,
        status,
        confidence_score: 1.0,
        confidence: "100%",
        verification_method: admin_override ? "admin_override" : "backup_pin",
        override_reason: override_reason || "Manual Fail-Safe Override",
      });

      return NextResponse.json(
        {
          success: true,
          matched: true,
          attendance_id: attendanceId,
          student_or_emp_id,
          first_name: registryUser?.first_name || displayName,
          last_name: registryUser?.last_name || "",
          grade_section: registryUser?.grade_section || "General Class",
          avatar_url: registryUser?.avatar_url || "",
          direction,
          status,
          verification_method: admin_override ? "admin_override" : "backup_pin",
          timestamp,
          message: `Attendance logged successfully for ${displayName}`,
        },
        { headers }
      );
    }

    return NextResponse.json(
      {
        success: false,
        matched: false,
        error: "Invalid 4-digit PIN or ID. Please re-enter or see front desk.",
        message: "PIN not recognized. Please retry.",
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
