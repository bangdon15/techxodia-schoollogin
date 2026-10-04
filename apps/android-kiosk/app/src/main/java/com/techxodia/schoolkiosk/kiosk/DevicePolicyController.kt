package com.techxodia.schoolkiosk.kiosk

import android.app.Activity
import android.content.Context
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class DevicePolicyController(private val activity: Activity) {

    fun enterKioskMode() {
        // Keep screen on
        activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Immersive Sticky System Bars Hiding
        WindowCompat.setDecorFitsSystemWindows(activity.window, false)
        val insetsController = WindowCompat.getInsetsController(activity.window, activity.window.decorView)
        insetsController.hide(WindowInsetsCompat.Type.systemBars())
        insetsController.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        try {
            activity.startLockTask()
        } catch (e: Exception) {
            // Screen pinning fallback if not device owner
        }
    }

    fun exitKioskMode() {
        try {
            activity.stopLockTask()
            activity.window.clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
            val insetsController = WindowCompat.getInsetsController(activity.window, activity.window.decorView)
            insetsController.show(WindowInsetsCompat.Type.systemBars())
        } catch (e: Exception) {}
    }
}
