import { NextRequest, NextResponse } from "next/server";
import { registerEnrolledUser } from "@/lib/biometric-registry";

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
 * Biometric Enrollment Endpoint
 * 
 * Enrolls a user with their extracted face vector into the biometric registry.
 */
export async function POST(req: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Kiosk-Token",
  };

  try {
    const body = await req.json().catch(() => ({}));
    const {
      user_id,
      student_or_emp_id,
      first_name,
      last_name,
      role = "student",
      grade_section,
      avatar_url,
      backup_pin = "1234",
      face_vector,
    } = body;

    if (!student_or_emp_id || !first_name || !last_name || !face_vector) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: student_or_emp_id, first_name, last_name, face_vector",
        },
        { status: 400, headers }
      );
    }

    const enrolled = registerEnrolledUser({
      id: user_id,
      student_or_emp_id,
      first_name,
      last_name,
      role,
      grade_section,
      avatar_url,
      backup_pin,
      face_vector,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully enrolled biometrics for ${enrolled.first_name} ${enrolled.last_name}!`,
        user: {
          id: enrolled.id,
          student_or_emp_id: enrolled.student_or_emp_id,
          name: `${enrolled.first_name} ${enrolled.last_name}`,
          backup_pin: enrolled.backup_pin,
        },
      },
      { headers }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to enroll biometrics" },
      { status: 500, headers }
    );
  }
}
