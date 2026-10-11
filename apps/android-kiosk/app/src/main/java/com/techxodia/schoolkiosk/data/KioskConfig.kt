package com.techxodia.schoolkiosk.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class KioskConfig(
    @SerialName("tenant_id")
    val tenantId: String = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    @SerialName("kiosk_id")
    val kioskId: String = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22",
    @SerialName("gate_code")
    val gateCode: String = "101",
    @SerialName("device_name")
    val deviceName: String = "North Gate Tablet 01",
    @SerialName("device_token")
    val deviceToken: String = "kiosk_secret_token_oakridge_north_gate",
    @SerialName("location_tag")
    val locationTag: String = "North Campus Turnstiles",
    @SerialName("supabase_url")
    val supabaseUrl: String = "https://web-admin-tau-three.vercel.app",
    @SerialName("school_name")
    val schoolName: String = "Oakridge International Academy",
    @SerialName("logo_url")
    val logoUrl: String = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&auto=format&fit=crop&q=80",
    @SerialName("primary_color")
    val primaryColor: String = "#1E3A8A",
    @SerialName("secondary_color")
    val secondaryColor: String = "#F59E0B",
    @SerialName("accent_color")
    val accentColor: String = "#10B981"
) {
    companion object {
        val PRESET_GATES = listOf(
            KioskConfig(
                kioskId = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22",
                gateCode = "101",
                deviceName = "North Gate Tablet 01",
                locationTag = "North Campus Turnstiles",
                deviceToken = "kiosk_secret_token_oakridge_north_gate",
                supabaseUrl = "https://web-admin-tau-three.vercel.app"
            ),
            KioskConfig(
                kioskId = "b2eebc99-9c0b-4ef8-bb6d-6bb9bd380b33",
                gateCode = "102",
                deviceName = "West Gymnasium Kiosk",
                locationTag = "Gymnasium Main Foyer",
                deviceToken = "kiosk_secret_token_oakridge_gym_kiosk",
                supabaseUrl = "https://web-admin-tau-three.vercel.app"
            ),
            KioskConfig(
                kioskId = "b3eebc99-9c0b-4ef8-bb6d-6bb9bd380b44",
                gateCode = "103",
                deviceName = "Cafeteria Entrance 01",
                locationTag = "Dining Hall Left Turnstile",
                deviceToken = "kiosk_secret_token_oakridge_cafeteria",
                supabaseUrl = "https://web-admin-tau-three.vercel.app"
            ),
            KioskConfig(
                kioskId = "b4eebc99-9c0b-4ef8-bb6d-6bb9bd380b55",
                gateCode = "104",
                deviceName = "East Admin Wing Turnstile",
                locationTag = "Administration Building Foyer",
                deviceToken = "kiosk_secret_token_oakridge_east_admin",
                supabaseUrl = "https://web-admin-tau-three.vercel.app"
            )
        )
    }
}

@Serializable
data class AttendanceVerificationResult(
    @SerialName("matched")
    val matched: Boolean = false,
    @SerialName("cooldown_active")
    val cooldownActive: Boolean = false,
    @SerialName("attendance_id")
    val attendanceId: String? = null,
    @SerialName("user_id")
    val userId: String? = null,
    @SerialName("student_or_emp_id")
    val studentOrEmpId: String? = null,
    @SerialName("first_name")
    val firstName: String? = null,
    @SerialName("last_name")
    val lastName: String? = null,
    @SerialName("grade_section")
    val gradeSection: String? = null,
    @SerialName("avatar_url")
    val avatarUrl: String? = null,
    @SerialName("direction")
    val direction: String = "time_in",
    @SerialName("status")
    val status: String = "on_time",
    @SerialName("location_tag")
    val locationTag: String? = null,
    @SerialName("confidence_score")
    val confidenceScore: Double = 0.0,
    @SerialName("timestamp")
    val timestamp: String? = null,
    @SerialName("error")
    val error: String? = null,
    @SerialName("message")
    val message: String? = null
)

@Serializable
data class StudentPreviewResult(
    @SerialName("success")
    val success: Boolean = false,
    @SerialName("found")
    val found: Boolean = false,
    @SerialName("preview")
    val preview: StudentPreviewData? = null,
    @SerialName("message")
    val message: String? = null
)

@Serializable
data class StudentPreviewData(
    @SerialName("id")
    val id: String = "",
    @SerialName("student_or_emp_id")
    val studentOrEmpId: String = "",
    @SerialName("first_name")
    val firstName: String = "",
    @SerialName("last_name")
    val lastName: String = "",
    @SerialName("role")
    val role: String = "student",
    @SerialName("grade_section")
    val gradeSection: String = "",
    @SerialName("avatar_url")
    val avatarUrl: String = ""
)
