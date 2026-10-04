package com.techxodia.schoolkiosk.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class KioskConfig(
    @SerialName("tenant_id")
    val tenantId: String = "",
    @SerialName("kiosk_id")
    val kioskId: String = "",
    @SerialName("device_name")
    val deviceName: String = "Main Gate Kiosk",
    @SerialName("device_token")
    val deviceToken: String = "",
    @SerialName("location_tag")
    val locationTag: String = "Main Gate",
    @SerialName("supabase_url")
    val supabaseUrl: String = "",
    @SerialName("school_name")
    val schoolName: String = "Oakridge International Academy",
    @SerialName("logo_url")
    val logoUrl: String = "",
    @SerialName("primary_color")
    val primaryColor: String = "#1E3A8A",
    @SerialName("secondary_color")
    val secondaryColor: String = "#F59E0B",
    @SerialName("accent_color")
    val accentColor: String = "#10B981"
)

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
