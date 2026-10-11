export interface LiveAttendanceRecord {
  id: string;
  timestamp: string;
  student_id: string;
  student_no: string;
  full_name: string;
  name: string;
  grade_section: string;
  grade: string;
  avatar_url: string;
  location_tag: string;
  kiosk: string;
  direction: "time_in" | "time_out";
  status: "on_time" | "late" | "excused";
  confidence: string;
  confidence_score: number;
  verification_method: "face_biometric" | "backup_pin" | "admin_override";
  override_reason?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __TECHXODIA_ATTENDANCE_LOGS__: LiveAttendanceRecord[] | undefined;
}

const INITIAL_LOGS: LiveAttendanceRecord[] = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    student_id: "TEST1234",
    student_no: "TEST1234",
    full_name: "Brandon Jake A. Torres",
    name: "Brandon Jake A. Torres",
    grade_section: "Faculty • HR",
    grade: "Faculty • HR",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80",
    location_tag: "North Gate Tablet 01",
    kiosk: "North Gate Tablet 01",
    direction: "time_in",
    status: "late",
    confidence: "96%",
    confidence_score: 0.96,
    verification_method: "face_biometric",
  },
  {
    id: "log-2",
    timestamp: "2026-10-11T07:48:12Z",
    student_id: "STU-2026-0891",
    student_no: "STU-2026-0891",
    full_name: "Sophia Chen",
    name: "Sophia Chen",
    grade_section: "Grade 11 - STEM A",
    grade: "Grade 11 - STEM A",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80",
    location_tag: "North Gate Tablet 01",
    kiosk: "North Gate Tablet 01",
    direction: "time_in",
    status: "on_time",
    confidence: "96%",
    confidence_score: 0.96,
    verification_method: "face_biometric",
  },
  {
    id: "log-3",
    timestamp: "2026-10-11T07:52:45Z",
    student_id: "STU-2026-0892",
    student_no: "STU-2026-0892",
    full_name: "Marcus Vance",
    name: "Marcus Vance",
    grade_section: "Grade 10 - Section B",
    grade: "Grade 10 - Section B",
    avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=128&auto=format&fit=crop&q=80",
    location_tag: "West Gymnasium Entrance",
    kiosk: "West Gymnasium Kiosk",
    direction: "time_in",
    status: "on_time",
    confidence: "94%",
    confidence_score: 0.94,
    verification_method: "face_biometric",
  },
  {
    id: "log-4",
    timestamp: "2026-10-11T08:04:19Z",
    student_id: "EMP-1042",
    student_no: "EMP-1042",
    full_name: "Dr. Elena Rostova",
    name: "Dr. Elena Rostova",
    grade_section: "Faculty of Science",
    grade: "Faculty of Science",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&auto=format&fit=crop&q=80",
    location_tag: "North Gate Tablet 01",
    kiosk: "North Gate Tablet 01",
    direction: "time_in",
    status: "late",
    confidence: "98%",
    confidence_score: 0.98,
    verification_method: "face_biometric",
  },
];

export function getAttendanceStore(): LiveAttendanceRecord[] {
  if (!globalThis.__TECHXODIA_ATTENDANCE_LOGS__) {
    globalThis.__TECHXODIA_ATTENDANCE_LOGS__ = [...INITIAL_LOGS];
  }
  return globalThis.__TECHXODIA_ATTENDANCE_LOGS__;
}

export function addAttendanceRecord(record: Partial<LiveAttendanceRecord>): LiveAttendanceRecord {
  const store = getAttendanceStore();

  const newRecord: LiveAttendanceRecord = {
    id: record.id || `log-${Date.now()}`,
    timestamp: record.timestamp || new Date().toISOString(),
    student_id: record.student_id || record.student_no || "TEST1234",
    student_no: record.student_no || record.student_id || "TEST1234",
    full_name: record.full_name || record.name || "Brandon Jake A. Torres",
    name: record.name || record.full_name || "Brandon Jake A. Torres",
    grade_section: record.grade_section || record.grade || "Faculty • HR",
    grade: record.grade || record.grade_section || "Faculty • HR",
    avatar_url: record.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80",
    location_tag: record.location_tag || record.kiosk || "North Gate Tablet 01",
    kiosk: record.kiosk || record.location_tag || "North Gate Tablet 01",
    direction: record.direction || "time_in",
    status: record.status || "on_time",
    confidence: record.confidence || `${Math.round((record.confidence_score || 0.96) * 100)}%`,
    confidence_score: record.confidence_score || 0.96,
    verification_method: record.verification_method || "face_biometric",
    override_reason: record.override_reason,
  };

  // Add to top of list
  store.unshift(newRecord);

  // Keep last 100 records
  if (store.length > 100) {
    store.pop();
  }

  return newRecord;
}
