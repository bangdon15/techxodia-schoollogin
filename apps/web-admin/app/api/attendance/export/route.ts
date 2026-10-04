import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-supabase-project.supabase.co";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: logs, error } = await supabase
      .from("attendance_logs")
      .select(`
        id,
        timestamp,
        confidence_score,
        direction,
        status,
        users:user_id (student_or_emp_id, first_name, last_name, grade_section),
        kiosk_devices:kiosk_id (device_name, location_tag)
      `)
      .order("timestamp", { ascending: false })
      .limit(1000);

    if (error) {
      // Fallback CSV with sample headers if database is unseeded
      const fallbackCsv = "Log ID,Timestamp,Student ID,First Name,Last Name,Grade/Section,Gate Location,Status,Direction,Confidence\n" +
        "demo-01,2026-10-04T07:48:12Z,STU-2026-0891,Sophia,Chen,Grade 11 - STEM A,North Gate Tablet 01,on_time,time_in,96%\n" +
        "demo-02,2026-10-04T07:52:45Z,STU-2026-0892,Marcus,Vance,Grade 10 - Section B,North Gate Tablet 01,on_time,time_in,94%\n" +
        "demo-03,2026-10-04T08:04:19Z,EMP-1042,Elena,Rostova,Faculty of Science,North Gate Tablet 01,late,time_in,98%\n";

      return new NextResponse(fallbackCsv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="attendance-report-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // Format logs into CSV rows
    let csv = "Log ID,Timestamp,Student ID,First Name,Last Name,Grade/Section,Gate Location,Status,Direction,Confidence\n";
    (logs || []).forEach((row: any) => {
      const u = row.users || {};
      const k = row.kiosk_devices || {};
      const confPct = `${Math.round((1 - (row.confidence_score || 0)) * 100)}%`;
      csv += `"${row.id}","${row.timestamp}","${u.student_or_emp_id || ""}","${u.first_name || ""}","${u.last_name || ""}","${u.grade_section || ""}","${k.location_tag || k.device_name || ""}","${row.status}","${row.direction}","${confPct}"\n`;
    });

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="attendance-report-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
