package com.techxodia.schoolkiosk.data

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

/**
 * Robust High-Availability Kiosk API Client
 * 
 * Directly connects to the school cloud verification service on Vercel:
 * https://web-admin-tau-three.vercel.app/api/attendance/verify
 * 
 * Features:
 * - True biometric verification: accurately identifies enrolled individuals or returns unrecognized
 * - "Not you?" cancellation fail-safe support
 * - Backup 4-digit PIN verification support
 */
class SupabaseKioskClient(private val context: Context) {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    private var activeConfig: KioskConfig = loadFallbackConfig()

    init {
        initClient(activeConfig)
    }

    fun initClient(config: KioskConfig) {
        this.activeConfig = config
    }

    fun loadFallbackConfig(): KioskConfig {
        val prefs = context.getSharedPreferences("kiosk_prefs", Context.MODE_PRIVATE)
        val savedGateCode = prefs.getString("selected_gate_code", null)

        if (!savedGateCode.isNullOrBlank()) {
            val matchingGate = KioskConfig.PRESET_GATES.find { it.gateCode == savedGateCode }
            if (matchingGate != null) return matchingGate
        }

        return try {
            context.assets.open("kiosk_setup.json").use { stream ->
                val reader = InputStreamReader(stream)
                json.decodeFromString<KioskConfig>(reader.readText())
            }
        } catch (e: Exception) {
            KioskConfig.PRESET_GATES.first()
        }
    }

    fun saveSelectedGate(config: KioskConfig) {
        this.activeConfig = config
        val prefs = context.getSharedPreferences("kiosk_prefs", Context.MODE_PRIVATE)
        prefs.edit()
            .putString("selected_gate_code", config.gateCode)
            .putString("device_name", config.deviceName)
            .putString("location_tag", config.locationTag)
            .apply()
    }

    /**
     * Executes attendance verification via Cloud API.
     * Accurately distinguishes between enrolled users and unknown faces.
     */
    suspend fun verifyAndLogAttendance(
        embedding: FloatArray,
        threshold: Double = 0.68
    ): Result<AttendanceVerificationResult> = withContext(Dispatchers.IO) {
        try {
            val base = if (activeConfig.supabaseUrl.endsWith("/")) activeConfig.supabaseUrl else "${activeConfig.supabaseUrl}/"
            val endpoint = "${base}api/attendance/verify"

            val payload = buildJsonObject {
                put("device_token", activeConfig.deviceToken)
                put("kiosk_id", activeConfig.kioskId)
                put("gate_name", activeConfig.deviceName)
                put("location_tag", activeConfig.locationTag)
                put("threshold", threshold)
                putJsonArray("face_vector") {
                    embedding.forEach { add(JsonPrimitive(it)) }
                }
            }.toString()

            val url = URL(endpoint)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 5000
                readTimeout = 5000
                doOutput = true
                doInput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
            }

            connection.outputStream.use { os ->
                OutputStreamWriter(os, "UTF-8").use { writer ->
                    writer.write(payload)
                    writer.flush()
                }
            }

            val responseCode = connection.responseCode
            if (responseCode in 200..299) {
                val responseText = connection.inputStream.bufferedReader().use { it.readText() }
                val parsed = json.decodeFromString<AttendanceVerificationResult>(responseText)
                return@withContext Result.success(parsed)
            } else {
                val errText = try { connection.errorStream?.bufferedReader()?.use { it.readText() } } catch (e: Exception) { null }
                Log.w("KioskApiClient", "Server returned HTTP $responseCode: $errText")
            }
        } catch (e: Exception) {
            Log.e("KioskApiClient", "Network verification request failed: ${e.message}")
        }

        // Safe failure mode: NEVER return another person's identity on error!
        val unrecognizedFallback = AttendanceVerificationResult(
            matched = false,
            message = "Face not recognized - Please retry or use backup PIN"
        )
        Result.success(unrecognizedFallback)
    }

    /**
     * Cancels an incorrectly identified attendance entry when user taps "Not you?".
     */
    suspend fun cancelAttendance(
        attendanceId: String,
        reason: String = "User tapped 'Not you' fail-safe button"
    ): Boolean = withContext(Dispatchers.IO) {
        if (attendanceId.isBlank()) return@withContext false
        try {
            val base = if (activeConfig.supabaseUrl.endsWith("/")) activeConfig.supabaseUrl else "${activeConfig.supabaseUrl}/"
            val endpoint = "${base}api/attendance/cancel"

            val payload = buildJsonObject {
                put("attendance_id", attendanceId)
                put("reason", reason)
                put("kiosk_id", activeConfig.kioskId)
            }.toString()

            val url = URL(endpoint)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 4000
                readTimeout = 4000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
            }

            connection.outputStream.use { os ->
                OutputStreamWriter(os, "UTF-8").use { writer ->
                    writer.write(payload)
                    writer.flush()
                }
            }

            return@withContext connection.responseCode in 200..299
        } catch (e: Exception) {
            Log.e("KioskApiClient", "Cancel attendance request failed: ${e.message}")
            return@withContext false
        }
    }

    /**
     * Looks up student/faculty profile preview using their Student or Employee ID.
     */
    suspend fun previewStudentId(
        studentOrEmpId: String
    ): Result<StudentPreviewResult> = withContext(Dispatchers.IO) {
        try {
            val base = if (activeConfig.supabaseUrl.endsWith("/")) activeConfig.supabaseUrl else "${activeConfig.supabaseUrl}/"
            val endpoint = "${base}api/attendance/manual-entry"

            val payload = buildJsonObject {
                put("action", "preview")
                put("student_or_emp_id", studentOrEmpId.trim())
            }.toString()

            val url = URL(endpoint)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 4000
                readTimeout = 4000
                doOutput = true
                doInput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
            }

            connection.outputStream.use { os ->
                OutputStreamWriter(os, "UTF-8").use { writer ->
                    writer.write(payload)
                    writer.flush()
                }
            }

            val responseCode = connection.responseCode
            if (responseCode in 200..299) {
                val responseText = connection.inputStream.bufferedReader().use { it.readText() }
                val parsed = json.decodeFromString<StudentPreviewResult>(responseText)
                return@withContext Result.success(parsed)
            } else {
                val errText = try { connection.errorStream?.bufferedReader()?.use { it.readText() } } catch (e: Exception) { null }
                Log.w("KioskApiClient", "ID preview lookup returned HTTP $responseCode: $errText")
            }
        } catch (e: Exception) {
            Log.e("KioskApiClient", "ID preview lookup error: ${e.message}")
        }

        Result.success(
            StudentPreviewResult(
                success = false,
                found = false,
                message = "ID not found in registry"
            )
        )
    }

    /**
     * Option 1 Two-Factor ATM Verification: Student/Employee ID + Security PIN.
     * Optionally recalibrates facial biometrics on the spot for seamless future scanning.
     */
    suspend fun verifyIdAndPin(
        studentOrEmpId: String,
        pin: String,
        recalibrationVector: FloatArray? = null
    ): Result<AttendanceVerificationResult> = withContext(Dispatchers.IO) {
        try {
            val base = if (activeConfig.supabaseUrl.endsWith("/")) activeConfig.supabaseUrl else "${activeConfig.supabaseUrl}/"
            val endpoint = "${base}api/attendance/manual-entry"

            val payload = buildJsonObject {
                put("action", "verify")
                put("student_or_emp_id", studentOrEmpId.trim())
                put("pin", pin.trim())
                put("location_tag", activeConfig.locationTag)
                put("kiosk_id", activeConfig.kioskId)
                put("direction", "time_in")
                if (recalibrationVector != null && recalibrationVector.isNotEmpty()) {
                    putJsonArray("recalibrate_vector") {
                        recalibrationVector.forEach { add(JsonPrimitive(it)) }
                    }
                }
            }.toString()

            val url = URL(endpoint)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 5000
                readTimeout = 5000
                doOutput = true
                doInput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
            }

            connection.outputStream.use { os ->
                OutputStreamWriter(os, "UTF-8").use { writer ->
                    writer.write(payload)
                    writer.flush()
                }
            }

            val responseCode = connection.responseCode
            if (responseCode in 200..299) {
                val responseText = connection.inputStream.bufferedReader().use { it.readText() }
                val parsed = json.decodeFromString<AttendanceVerificationResult>(responseText)
                return@withContext Result.success(parsed)
            } else {
                val errText = try { connection.errorStream?.bufferedReader()?.use { it.readText() } } catch (e: Exception) { null }
                Log.w("KioskApiClient", "ID + PIN verification returned HTTP $responseCode: $errText")
            }
        } catch (e: Exception) {
            Log.e("KioskApiClient", "ID + PIN verification network error: ${e.message}")
        }

        Result.success(
            AttendanceVerificationResult(
                matched = false,
                message = "Incorrect Student ID or PIN. Please re-check."
            )
        )
    }

    /**
     * Verifies Digital Attendance Pass QR Code.
     */
    suspend fun verifyQrPass(
        qrPayload: String
    ): Result<AttendanceVerificationResult> = withContext(Dispatchers.IO) {
        try {
            val base = if (activeConfig.supabaseUrl.endsWith("/")) activeConfig.supabaseUrl else "${activeConfig.supabaseUrl}/"
            val endpoint = "${base}api/attendance/qr-verify"

            val payload = buildJsonObject {
                put("qr_payload", qrPayload)
                put("location_tag", activeConfig.locationTag)
                put("kiosk_id", activeConfig.kioskId)
                put("direction", "time_in")
            }.toString()

            val url = URL(endpoint)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 4500
                readTimeout = 4500
                doOutput = true
                doInput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
            }

            connection.outputStream.use { os ->
                OutputStreamWriter(os, "UTF-8").use { writer ->
                    writer.write(payload)
                    writer.flush()
                }
            }

            val responseCode = connection.responseCode
            if (responseCode in 200..299) {
                val responseText = connection.inputStream.bufferedReader().use { it.readText() }
                val parsed = json.decodeFromString<AttendanceVerificationResult>(responseText)
                return@withContext Result.success(parsed)
            } else {
                val errText = try { connection.errorStream?.bufferedReader()?.use { it.readText() } } catch (e: Exception) { null }
                Log.w("KioskApiClient", "QR Pass verification returned HTTP $responseCode: $errText")
            }
        } catch (e: Exception) {
            Log.e("KioskApiClient", "QR Pass verification network error: ${e.message}")
        }

        Result.success(
            AttendanceVerificationResult(
                matched = false,
                message = "Digital Pass not found in school registry."
            )
        )
    }

    /**
     * Backward-compatible 4-digit PIN verification fallback.
     */
    suspend fun verifyPin(
        pin: String,
        studentOrEmpId: String? = null
    ): Result<AttendanceVerificationResult> = verifyIdAndPin(studentOrEmpId ?: "", pin)

    fun getActiveConfig(): KioskConfig = activeConfig
}
