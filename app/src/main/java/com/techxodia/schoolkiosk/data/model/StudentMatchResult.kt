package com.techxodia.schoolkiosk.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class StudentMatchResult(
    @SerialName("student_id")
    val studentId: String,

    @SerialName("student_no")
    val studentNo: String,

    @SerialName("full_name")
    val fullName: String,

    @SerialName("avatar_url")
    val avatarUrl: String? = null,

    @SerialName("grade_section")
    val gradeSection: String? = null,

    @SerialName("confidence_score")
    val confidenceScore: Double,

    @SerialName("attendance_timestamp")
    val attendanceTimestamp: String? = null,

    @SerialName("matched")
    val matched: Boolean = true,

    @SerialName("message")
    val message: String? = null
)
