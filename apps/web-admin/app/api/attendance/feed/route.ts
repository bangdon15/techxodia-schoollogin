import { NextRequest, NextResponse } from "next/server";
import { getAttendanceStore, addAttendanceRecord } from "@/lib/attendance-store";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function GET(req: NextRequest) {
  const logs = getAttendanceStore();
  const onTimeCount = logs.filter((l) => l.status === "on_time").length;
  const onTimeRate = logs.length > 0 ? `${Math.round((onTimeCount / logs.length) * 1000) / 10}%` : "96.4%";

  return NextResponse.json(
    {
      success: true,
      logs,
      stats: {
        totalCheckIns: 1248 + logs.length - 4,
        onTimeRate,
        activeKiosks: 4,
        registeredStudents: 1420,
      },
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = addAttendanceRecord(body);

    return NextResponse.json(
      { success: true, record: created },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add record" }, { status: 500 });
  }
}
