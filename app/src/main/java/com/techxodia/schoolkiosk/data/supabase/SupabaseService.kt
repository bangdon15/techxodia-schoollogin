package com.techxodia.schoolkiosk.data.supabase

import android.content.Context
import android.util.Log
import com.techxodia.schoolkiosk.data.model.KioskHeartbeat
import com.techxodia.schoolkiosk.data.model.StudentMatchResult
import com.techxodia.schoolkiosk.data.model.TenantConfig
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.postgrest.postgrest
import io.github.jan.supabase.postgrest.rpc
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeout
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import java.io.InputStreamReader
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class SupabaseService(private val context: Context) {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    private var activeConfig: TenantConfig = loadFallbackConfig()
    private var client: SupabaseClient? = null

    init {
        initClient(activeConfig)
    }

    private fun initClient(config: TenantConfig) {
        this.activeConfig = config
        try {
            if (config.supabaseUrl.isNotBlank() && config.supabaseDeviceKey.isNotBlank()) {
                client = createSupabaseClient(
                    supabaseUrl = config.supabaseUrl,
                    supabaseKey = config.supabaseDeviceKey
                ) {
                    install(Postgrest)
                }
                Log.i(TAG, "SupabaseClient initialized for tenant: ${config.schoolName}")
            } else {
                Log.w(TAG, "Supabase credentials missing in config. Running in dry-run/offline mode.")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing Supabase client", e)
            client = null
        }
    }

    /**
     * Loads compile-time embedded fallback configuration from assets/tenant_config.json
     */
    fun loadFallbackConfig(): TenantConfig {
        return try {
            context.assets.open("tenant_config.json").use { stream ->
                val reader = InputStreamReader(stream)
                val content = reader.readText()
                json.decodeFromString<TenantConfig>(content)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to read assets/tenant_config.json, using hardcoded defaults", e)
            TenantConfig()
        }
    }

    /**
     * Fetches dynamic tenant branding and configuration from Supabase at runtime.
     * Falls back seamlessly to embedded config if network is unreachable.
     */
    suspend fun fetchDynamicTenantConfig(kioskLocationId: String): TenantConfig = withContext(Dispatchers.IO) {
        val currentClient = client ?: return@withContext activeConfig
        try {
            withTimeout(4000) {
                // Query public tenant_branding table for this kiosk
                val result = currentClient.postgrest["tenant_branding"]
                    .select {
                        filter {
                            eq("kiosk_location_id", kioskLocationId)
                        }
                    }
                    .decodeSingleOrNull<TenantConfig>()

                if (result != null) {
                    Log.i(TAG, "Successfully loaded dynamic tenant config: ${result.schoolName}")
                    activeConfig = result
                    initClient(result)
                    result
                } else {
                    Log.w(TAG, "No remote config found for kiosk $kioskLocationId, using fallback.")
                    activeConfig
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Network timeout or failure loading remote config. Using fallback: ${e.message}")
            activeConfig
        }
    }

    /**
     * Executes atomic RPC `match_student_face` with the 512-dim embedding vector.
     * Zero local caching: Result is processed in memory and discarded.
     */
    suspend fun matchStudentFace(
        embedding: FloatArray,
        threshold: Double = activeConfig.cosineSimilarityThreshold,
        kioskId: String = activeConfig.kioskLocationId
    ): Result<StudentMatchResult> = withContext(Dispatchers.IO) {
        val currentClient = client ?: return@withContext Result.failure(
            IllegalStateException("Supabase client is not configured or offline")
        )

        try {
            withTimeout(3500) {
                // Format the 512-dim embedding as a JSON array
                val params = buildJsonObject {
                    putJsonArray("p_embedding") {
                        embedding.forEach { add(it) }
                    }
                    put("p_threshold", threshold)
                    put("p_kiosk_id", kioskId)
                }

                val response = currentClient.postgrest.rpc(
                    function = "match_student_face",
                    parameters = params
                ).decodeAs<StudentMatchResult>()

                Result.success(response)
            }
        } catch (e: Exception) {
            Log.e(TAG, "matchStudentFace RPC failed or timed out", e)
            Result.failure(e)
        }
    }

    /**
     * Transmits in-memory kiosk telemetry directly to Supabase kiosk_devices table.
     */
    suspend fun sendHeartbeat(
        batteryLevel: Int,
        isCharging: Boolean,
        cameraStatus: String,
        latencyMs: Long
    ): Boolean = withContext(Dispatchers.IO) {
        val currentClient = client ?: return@withContext false
        try {
            val nowIso = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }.format(Date())

            val heartbeat = KioskHeartbeat(
                kioskId = activeConfig.kioskLocationId,
                batteryLevel = batteryLevel,
                isCharging = isCharging,
                networkLatencyMs = latencyMs,
                cameraStatus = cameraStatus,
                appVersion = "1.0.0",
                lastSeenAt = nowIso
            )

            currentClient.postgrest["kiosk_devices"].upsert(heartbeat) {
                onConflict = "kiosk_id"
            }
            true
        } catch (e: Exception) {
            Log.w(TAG, "Failed to send kiosk heartbeat: ${e.message}")
            false
        }
    }

    fun getActiveConfig(): TenantConfig = activeConfig

    companion object {
        private const val TAG = "SupabaseService"
    }
}
