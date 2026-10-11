package com.techxodia.schoolkiosk.kiosk

import android.app.Activity
import android.app.ActivityManager
import android.app.admin.DevicePolicyManager
import android.content.Context
import android.util.Log
import android.view.View
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

/**
 * Manages runtime Kiosk mode operations:
 * - Window immersive sticky mode (hiding system status & nav bars)
 * - Screen awake lock
 * - Lock Task Mode (single-app pinning)
 */
class KioskManager(private val context: Context) {

    private val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager
    private val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager

    /**
     * Puts the current activity into hardened Kiosk Mode.
     */
    fun enterKioskMode(activity: Activity) {
        // 1. Keep display awake at all times during kiosk operation
        activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // 2. Hide Status Bar and Navigation Bar (Immersive Sticky Mode)
        WindowCompat.setDecorFitsSystemWindows(activity.window, false)
        val insetsController = WindowCompat.getInsetsController(activity.window, activity.window.decorView)
        insetsController.hide(WindowInsetsCompat.Type.systemBars())
        insetsController.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        // 3. Initiate Lock Task Mode
        try {
            if (isLockTaskPermitted()) {
                activity.startLockTask()
                Log.i(TAG, "Hardware Lock Task Mode started seamlessly without confirmation dialog.")
            } else {
                Log.w(TAG, "Lock task not pre-whitelisted by Device Owner. Starting basic screen pinning.")
                activity.startLockTask()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start lock task mode", e)
        }
    }

    /**
     * Gracefully exits Lock Task mode (for authorized administrator maintenance).
     */
    fun exitKioskMode(activity: Activity) {
        try {
            activity.stopLockTask()
            activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            val insetsController = WindowCompat.getInsetsController(activity.window, activity.window.decorView)
            insetsController.show(WindowInsetsCompat.Type.systemBars())
            Log.i(TAG, "Exited Kiosk Lock Task Mode.")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping lock task mode", e)
        }
    }

    fun isLockTaskPermitted(): Boolean {
        return dpm?.isLockTaskPermitted(context.packageName) == true
    }

    fun isDeviceOwner(): Boolean {
        return dpm?.isDeviceOwnerApp(context.packageName) == true
    }

    fun isLockTaskModeActive(): Boolean {
        return activityManager?.lockTaskModeState != ActivityManager.LOCK_TASK_MODE_NONE
    }

    companion object {
        private const val TAG = "KioskManager"
    }
}
