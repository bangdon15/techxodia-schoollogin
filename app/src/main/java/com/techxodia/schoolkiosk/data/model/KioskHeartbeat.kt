package com.techxodia.schoolkiosk.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class KioskHeartbeat(
    @SerialName("kiosk_id")
    val kioskId: String,

    @SerialName("battery_level")
    val batteryLevel: Int,

    @SerialName("is_charging")
    val isCharging: Boolean,

    @SerialName("network_latency_ms")
    val networkLatencyMs: Long,

    @SerialName("camera_status")
    val cameraStatus: String, // "OK", "DEGRADED", "ERROR"

    @SerialName("app_version")
    val appVersion: String = "1.0.0",

    @SerialName("last_seen_at")
    val lastSeenAt: String
)
