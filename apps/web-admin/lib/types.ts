export type UserRole = "super_admin" | "school_admin" | "staff" | "student";
export type AttendanceDirection = "time_in" | "time_out";
export type AttendanceStatus = "on_time" | "late" | "excused" | "half_day" | "absent";
export type VerificationMethod = "face_biometric" | "backup_pin" | "admin_override" | "qr_badge";

export interface TenantThemeConfig {
  primary: string;
  secondary: string;
  surface: string;
  accent: string;
  bg: string;
  // Legacy / general fallback
  bgStyle: "midnight" | "mesh" | "oled" | "light" | "custom_wallpaper";
  bgImageUrl?: string;
  fontFamily?: string;

  // Granular Dashboard Background Customization
  dashboardBgType?: "midnight" | "mesh" | "grid" | "wallpaper" | "oled" | "aurora" | "light";
  dashboardBgImage?: string;
  dashboardBgOverlay?: number; // 0.1 to 0.95 dark overlay opacity
  dashboardBgBlur?: number; // 0 to 20 blur px

  // Granular Login Screen Background & Layout Customization
  loginLayout?: "center" | "split";
  loginBgType?: "midnight" | "mesh" | "grid" | "wallpaper" | "oled" | "aurora" | "light";
  loginBgImage?: string;
  loginBgOverlay?: number; // 0.1 to 0.95
  loginBgBlur?: number; // 0 to 20 blur px
  motto?: string;
}

export interface Tenant {
  id: string;
  school_name: string;
  slug: string;
  logo_url: string;
  theme_config: TenantThemeConfig;
  late_threshold_time: string;
  created_at: string;
}

export interface KioskDevice {
  id: string;
  tenant_id: string;
  device_name: string;
  device_token: string;
  location_tag: string;
  is_active: boolean;
  battery_level?: number;
  is_charging?: boolean;
  camera_status?: string;
  last_heartbeat_at?: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  tenant_id: string;
  role: UserRole;
  student_or_emp_id: string;
  first_name: string;
  last_name: string;
  grade_section?: string; // Also serves as Department for Faculty/Staff
  avatar_url?: string;
  email?: string;
  emergency_contact?: string;
  backup_pin?: string; // 4-digit manual fail-safe PIN
  is_active: boolean;
  has_biometrics?: boolean;
  created_at: string;
}

export interface AttendanceLog {
  id: string;
  tenant_id: string;
  user_id: string;
  kiosk_id?: string;
  timestamp: string;
  confidence_score: number;
  direction: AttendanceDirection;
  status: AttendanceStatus;
  verification_method?: VerificationMethod;
  override_reason?: string;
  user?: UserProfile;
  kiosk?: KioskDevice;
}

export interface DailyPayrollItem {
  date: string;
  student_or_emp_id: string;
  full_name: string;
  role: string;
  department: string;
  time_in: string | null;
  time_out: string | null;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  late_minutes: number;
  undertime_minutes: number;
  status: string;
  verification_method: VerificationMethod;
}

export interface EmployeePayrollSummary {
  student_or_emp_id: string;
  full_name: string;
  role: string;
  department: string;
  days_worked: number;
  total_hours: number;
  total_regular_hours: number;
  total_overtime_hours: number;
  total_late_minutes: number;
  net_payable_hours: number;
}
