package com.techxodia.schoolkiosk.kiosk

import android.app.admin.DeviceAdminReceiver
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.UserManager
import android.util.Log
import android.widget.Toast

/**
 * DeviceAdminReceiver responsible for dedicated enterprise Kiosk provisioning.
 * Enables single-app Lock Task mode, locks system navigation, and suppresses system dialogs.
 */
class KioskDeviceAdminReceiver : DeviceAdminReceiver() {

    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        Log.i(TAG, "Device Admin Enabled for School Kiosk")
        configureKioskPolicies(context)
    }

    override fun onProfileProvisioningComplete(context: Context, intent: Intent) {
        super.onProfileProvisioningComplete(context, intent)
        Log.i(TAG, "Device Owner Provisioning Complete")
        configureKioskPolicies(context)
    }

    private fun configureKioskPolicies(context: Context) {
        val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager ?: return
        val adminComponent = ComponentName(context, KioskDeviceAdminReceiver::class.java)

        if (dpm.isDeviceOwnerApp(context.packageName)) {
            // 1. Whitelist this application for seamless Lock Task Mode (no user confirmation dialog)
            dpm.setLockTaskPackages(adminComponent, arrayOf(context.packageName))

            // 2. Lock down task features (suppress home/overview/notifications)
            dpm.setLockTaskFeatures(
                adminComponent,
                DevicePolicyManager.LOCK_TASK_FEATURE_NONE or
                        DevicePolicyManager.LOCK_TASK_FEATURE_SYSTEM_INFO
            )

            // 3. Disable keyguard / lockscreen
            dpm.setKeyguardDisabled(adminComponent, true)

            // 4. Disable status bar pull-down / notification shade
            dpm.setStatusBarDisabled(adminComponent, true)

            // 5. User restrictions (prevent student tampering)
            dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_SAFE_BOOT)
            dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_FACTORY_RESET)
            dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_SYSTEM_ERROR_DIALOGS)
            dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_CONFIG_DATE_TIME)
            dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_ADD_USER)
            dpm.addUserRestriction(adminComponent, UserManager.DISALLOW_MOUNT_PHYSICAL_MEDIA)

            // 6. Stay awake indefinitely when plugged into AC power
            dpm.setGlobalSetting(
                adminComponent,
                android.provider.Settings.Global.STAY_ON_WHILE_PLUGGED_IN,
                (android.os.BatteryManager.BATTERY_PLUGGED_AC or
                        android.os.BatteryManager.BATTERY_PLUGGED_USB or
                        android.os.BatteryManager.BATTERY_PLUGGED_WIRELESS).toString()
            )

            Log.i(TAG, "Kiosk security policies applied successfully: LockTask, NoKeyguard, NoStatusBar")
        } else {
            Log.w(TAG, "App is not Device Owner. Run 'dpm set-device-owner' via ADB for dedicated kiosk mode.")
        }
    }

    companion object {
        private const val TAG = "KioskDeviceAdmin"

        fun getComponentName(context: Context): ComponentName {
            return ComponentName(context, KioskDeviceAdminReceiver::class.java)
        }
    }
}
