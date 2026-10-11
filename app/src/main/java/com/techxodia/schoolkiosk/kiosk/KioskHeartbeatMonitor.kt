package com.techxodia.schoolkiosk.kiosk

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import android.util.Log
import com.techxodia.schoolkiosk.data.supabase.SupabaseService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.system.measureTimeMillis

/**
 * Periodically dispatches in-memory kiosk telemetry directly to Supabase.
 * Strictly adheres to zero disk caching; failures are transient in RAM.
 */
class KioskHeartbeatMonitor(
    private val context: Context,
    private val supabaseService: SupabaseService,
    private val scope: CoroutineScope
) {

    private var heartbeatJob: Job? = null
    var isCameraHealthy: Boolean = true

    fun start(intervalSeconds: Long = 60L) {
        stop()
        heartbeatJob = scope.launch(Dispatchers.IO) {
            Log.i(TAG, "Starting periodic kiosk heartbeat loop ($intervalSeconds s)")
            while (isActive) {
                try {
                    val batteryInfo = getBatteryStatus()
                    val latencyMs = measureNetworkLatency()
                    val cameraStatus = if (isCameraHealthy) "OK" else "ERROR"

                    supabaseService.sendHeartbeat(
                        batteryLevel = batteryInfo.first,
                        isCharging = batteryInfo.second,
                        cameraStatus = cameraStatus,
                        latencyMs = latencyMs
                    )
                } catch (e: Exception) {
                    Log.w(TAG, "Heartbeat dispatch failed: ${e.message}")
                }
                delay(intervalSeconds * 1000L)
            }
        }
    }

    fun stop() {
        heartbeatJob?.cancel()
        heartbeatJob = null
    }

    private fun getBatteryStatus(): Pair<Int, Boolean> {
        val batteryIntent = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val level = batteryIntent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = batteryIntent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        val batteryPct = if (level >= 0 && scale > 0) (level * 100 / scale) else 100

        val status = batteryIntent?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
        val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                status == BatteryManager.BATTERY_STATUS_FULL

        return Pair(batteryPct, isCharging)
    }

    private suspend fun measureNetworkLatency(): Long {
        return try {
            measureTimeMillis {
                // Quick lightweight ping
                val socket = java.net.Socket()
                val socketAddress = java.net.InetSocketAddress("8.8.8.8", 53)
                socket.connect(socketAddress, 1500)
                socket.close()
            }
        } catch (e: Exception) {
            -1L
        }
    }

    companion object {
        private const val TAG = "KioskHeartbeatMonitor"
    }
}
