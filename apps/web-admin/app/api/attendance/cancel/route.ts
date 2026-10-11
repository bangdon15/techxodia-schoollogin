import { NextRequest, NextResponse } from "next/server";
import { cancelAttendanceRecord } from "@/lib/attendance-store";

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
 * Attendance Cancellation Endpoint
 * 
 * Called when a user taps "Not you?" on the kiosk terminal to reject a false-positive
 * or misrecognized identity before it permanently counts on the logs.
 */
export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Kiosk-Token",
  };

  try {
    const body = await req.json().catch(() => ({}));
    const { attendance_id, reason = "User tapped 'Not you?' fail-safe override", kiosk_id } = body;

    if (!attendance_id) {
      return NextResponse.json(
        { success: false, error: "Missing attendance_id" },
        { status: 400, headers }
      );
    }

    const removed = cancelAttendanceRecord(attendance_id, reason);

    return NextResponse.json(
      {
        success: true,
        canceled: removed,
        attendance_id,
        message: "Attendance entry cancelled. Please use 4-digit PIN or scan QR pass.",
      },
      { headers }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to cancel attendance log" },
      { status: 500, headers }
    );
  }
}
