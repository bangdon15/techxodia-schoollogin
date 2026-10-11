package com.techxodia.schoolkiosk.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TenantConfig(
    @SerialName("schoolName")
    val schoolName: String = "Oakridge International Academy",

    @SerialName("logoUrl")
    val logoUrl: String = "",

    @SerialName("primaryColor")
    val primaryColor: String = "#1E3A8A", // Deep Navy

    @SerialName("accentColor")
    val accentColor: String = "#F59E0B", // Warm Amber

    @SerialName("kioskLocationId")
    val kioskLocationId: String = "7f3b891e-4501-446f-87d2-7ec98234ab01",

    @SerialName("kioskName")
    val kioskName: String = "Main Gate Kiosk 01",

    @SerialName("supabaseUrl")
    val supabaseUrl: String = "https://your-project-ref.supabase.co",

    @SerialName("supabaseDeviceKey")
    val supabaseDeviceKey: String = "",

    @SerialName("cosineSimilarityThreshold")
    val cosineSimilarityThreshold: Double = 0.35,

    @SerialName("livenessRequired")
    val livenessRequired: Boolean = true,

    @SerialName("heartbeatIntervalSeconds")
    val heartbeatIntervalSeconds: Long = 60L
)
