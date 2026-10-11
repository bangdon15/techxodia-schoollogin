import { NextRequest, NextResponse } from "next/server";
import { findUserByQrToken } from "@/lib/biometric-registry";
import { addAttendanceRecord } from "@/lib/attendance-store";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Kiosk-Token",
    },
  });
}

/**
 * High-Speed Digital QR Code Pass Attendance Endpoint
 * 
 * Verifies school ID card / mobile wallet QR codes scanned at the kiosk terminal.
 */
export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Kiosk-Token",
  };

  try {
    const body = await req.json().catch(() => ({}));
    const {
      qr_payload,
      direction = "time_in",
      location_tag,
      kiosk_id,
      timestamp = new Date().toISOString(),
    } = body;

    if (!qr_payload) {
      return NextResponse.json(
        { success: false, error: "Missing qr_payload" },
        { status: 400, headers }
      );
    }

    const matchedUser = findUserByQrToken(qr_payload);
    if (!matchedUser) {
      return NextResponse.json(
        {
          success: false,
          matched: false,
          error: "Unrecognized QR code or inactive pass",
          message: "Digital Pass not found in school registry. Please contact administration.",
        },
        { status: 404, headers }
      );
    }

    // Determine shift status
    const now = new Date();
    const hour = now.getUTCHours() + 8; // UTC+8 Manila
    const minute = now.getUTCMinutes();
    const isLate = hour > 8 || (hour === 8 && minute > 30);
    const status = isLate ? "late" : "on_time";
    const gateLocation = location_tag || "North Campus Turnstiles";

    const attendanceId = `att-qr-${Date.now()}`;
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
      verification_method: "backup_pin", // QR digital pass fallback
      override_reason: "Digital Pass QR Scan",
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
        message: `Digital Pass verified! Welcome, ${matchedUser.first_name} ${matchedUser.last_name}!`,
      },
      { headers }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process QR code pass" },
      { status: 500, headers }
    );
  }
}
