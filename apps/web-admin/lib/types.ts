export type UserRole = "super_admin" | "school_admin" | "staff" | "student";
export type AttendanceDirection = "time_in" | "time_out";
export type AttendanceStatus = "on_time" | "late" | "excused";

export interface TenantThemeConfig {
  primary: string;
  secondary: string;
  surface: string;
  accent: string;
  bg: string;
  bgStyle: "midnight" | "mesh" | "oled" | "light" | "custom_wallpaper";
  bgImageUrl?: string;
  fontFamily?: string;
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
  grade_section?: string;
  avatar_url?: string;
  emergency_contact?: string;
  is_active: boolean;
  has_biometrics?: boolean;
  created_at: string;
}

export interface AttendanceLog {
  id: string;
  tenant_id: string;
  user_id: string;
  kiosk_id: string;
  timestamp: string;
  confidence_score: number;
  direction: AttendanceDirection;
  status: AttendanceStatus;
  user?: UserProfile;
  kiosk?: KioskDevice;
}
