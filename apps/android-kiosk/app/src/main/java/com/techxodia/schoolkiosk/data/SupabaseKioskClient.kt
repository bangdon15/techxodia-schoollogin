package com.techxodia.schoolkiosk.data

import android.content.Context
import android.util.Log
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.rpc
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import java.io.InputStreamReader

class SupabaseKioskClient(private val context: Context) {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    private var activeConfig: KioskConfig = loadFallbackConfig()
    private var client: SupabaseClient? = null

    init {
        initClient(activeConfig)
    }

    fun initClient(config: KioskConfig) {
        this.activeConfig = config
        try {
            if (config.supabaseUrl.isNotBlank()) {
                client = createSupabaseClient(
                    supabaseUrl = config.supabaseUrl,
                    supabaseKey = config.deviceToken // Scoped Kiosk token
                ) {
                    install(Postgrest)
                }
            }
        } catch (e: Exception) {
            Log.e("SupabaseKioskClient", "Client init failed", e)
        }
    }

    fun loadFallbackConfig(): KioskConfig {
        return try {
            context.assets.open("kiosk_setup.json").use { stream ->
                val reader = InputStreamReader(stream)
                json.decodeFromString<KioskConfig>(reader.readText())
            }
        } catch (e: Exception) {
            KioskConfig()
        }
    }

    /**
     * Executes atomic RPC verify_and_log_attendance with 512-dim float embedding.
     */
    suspend fun verifyAndLogAttendance(
        embedding: FloatArray,
        threshold: Double = 0.38
    ): Result<AttendanceVerificationResult> = withContext(Dispatchers.IO) {
        val currentClient = client ?: return@withContext Result.failure(
            IllegalStateException("Supabase client offline or not paired")
        )

        try {
            withTimeout(3000) {
                val params = buildJsonObject {
                    put("p_device_token", activeConfig.deviceToken)
                    putJsonArray("p_face_vector") {
                        embedding.forEach { add(JsonPrimitive(it)) }
                    }
                    put("p_threshold", threshold)
                }

                val result = currentClient.postgrest.rpc(
                    function = "verify_and_log_attendance",
                    parameters = params
                ).decodeAs<AttendanceVerificationResult>()

                Result.success(result)
            }
        } catch (e: Exception) {
            Log.e("SupabaseKioskClient", "Attendance verification RPC failed", e)
            Result.failure(e)
        }
    }

    fun getActiveConfig(): KioskConfig = activeConfig
}
