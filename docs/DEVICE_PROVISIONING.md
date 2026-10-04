# Android Kiosk Device Provisioning & Operational Hardening Guide

This document outlines the standard operating procedures for provisioning dedicated Android tablets into unattended School Attendance Kiosks with Single-App Lock Task Mode.

---

## 1. Prerequisites
* **Target Hardware:** Android Tablet (Android 8.0 / API 26 or higher, recommended Android 12+).
* **Hardware Features:** Front-facing HD camera, hardware acceleration (GPU/NPU enabled), stable Wi-Fi or Ethernet via USB-C docking station.
* **Tools Required:** Android SDK Platform-Tools (`adb`) or Enterprise EMM / Knox Mobile Enrollment / Android Zero-Touch portal.

---

## 2. Factory Reset & Device Owner Enrollment (ADB Method)

To enforce true **Single-App Lock Task Mode** without user escape dialogs, the kiosk app must be registered as the device's **Device Owner**. A device can only have one Device Owner, which must be configured before any personal accounts (e.g., Google accounts) are added.

### Step 2.1: Factory Reset Tablet
1. Navigate to **Settings > System > Reset options > Erase all data (factory reset)**.
2. Complete initial boot without adding a Google account, SIM PIN, or screen lock.
3. Enable **Developer Options**:
   - Go to **Settings > About tablet**.
   - Tap **Build Number** 7 times until Developer Mode is unlocked.
4. Enable **USB Debugging**:
   - Go to **Settings > System > Developer options** > Toggle **USB Debugging** ON.

### Step 2.2: Install APK and Set Device Owner
Connect the tablet to the deployment workstation via USB-C and run:

```bash
# Verify tablet connectivity
adb devices

# 1. Install production build of School Kiosk
adb install -r -g app-release.apk

# 2. Grant runtime permissions in advance (avoiding permission prompts on kiosk screen)
adb shell pm grant com.techxodia.schoolkiosk android.permission.CAMERA

# 3. Provision as Device Owner
adb shell dpm set-device-owner com.techxodia.schoolkiosk/.kiosk.KioskDeviceAdminReceiver

# Expected output:
# Success: Device owner set to package ComponentInfo{com.techxodia.schoolkiosk/com.techxodia.schoolkiosk.kiosk.KioskDeviceAdminReceiver}
```

---

## 3. QR Code Zero-Touch Enrollment (Bulk School Deployment)

For bulk provisioning (e.g., 50+ kiosks across school gates), use Android Enterprise Zero-Touch enrollment or Knox Mobile Enrollment (KME).

### QR Code Provisioning Payload
On the initial "Welcome" screen of a freshly factory-reset Android device, tap the screen 6 times in the same spot to activate the camera QR code reader. Scan the following JSON payload:

```json
{
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "com.techxodia.schoolkiosk/com.techxodia.schoolkiosk.kiosk.KioskDeviceAdminReceiver",
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://deploy.techxodia.com/kiosk/schoolkiosk-v1.0.apk",
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_CHECKSUM": "<SHA-256-HEX-OF-APK>",
  "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED": true,
  "android.app.extra.PROVISIONING_SKIP_ENCRYPTION": false,
  "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
    "kiosk_location_id": "7f3b891e-4501-446f-87d2-7ec98234ab01",
    "school_tenant_id": "oakridge-academy"
  }
}
```

---

## 4. Hardware Optimization & Power Management

Execute these commands via ADB or push them through your EMM policy:

### 4.1: Whitelist Battery Optimization (Doze Prevention)
Unattended kiosks must never enter deep sleep or throttle the camera analyzer:
```bash
adb shell dumpsys deviceidle whitelist +com.techxodia.schoolkiosk
```

### 4.2: Enable Hardware Accelerated GPU Layers
Ensure CameraX and TFLite leverage GPU delegates:
```bash
adb shell setprop debug.hwui.renderer skiagl
adb shell setprop debug.stagefright.ccodec 4
```

### 4.3: Prevent Screen Timeout When Plugged Into AC
```bash
adb shell settings put global stay_on_while_plugged_in 7
```

---

## 5. Security Lockdown Policies Enforced by KioskDeviceAdminReceiver

When initialized as Device Owner, `KioskDeviceAdminReceiver` automatically programmatically applies:

1. **`dpm.setLockTaskPackages()`**: Whitelists `com.techxodia.schoolkiosk` for silent locking without user escape.
2. **`dpm.setLockTaskFeatures()`**: Completely disables Home button, App Overview button, Notification Drawer, and Quick Settings tiles.
3. **`dpm.setKeyguardDisabled(true)`**: Disables Android lockscreen on boot.
4. **`dpm.setStatusBarDisabled(true)`**: Suppresses downward swipe gesture for notification panel.
5. **Tamper Proofing Restrictions**:
   - `UserManager.DISALLOW_SAFE_BOOT`: Blocks booting into Safe Mode.
   - `UserManager.DISALLOW_FACTORY_RESET`: Prevents unauthorized resetting via physical buttons.
   - `UserManager.DISALLOW_SYSTEM_ERROR_DIALOGS`: Suppresses OS crash dialogs from occluding the camera.
   - `UserManager.DISALLOW_ADD_USER`: Prevents switching to guest user profile.

---

## 6. Maintenance & Administrative Unlock Procedure

To exit Kiosk Mode for device maintenance or debugging:

```bash
# 1. Stop Lock Task Mode via ADB
adb shell am broadcast -a com.techxodia.schoolkiosk.ACTION_ADMIN_EXIT_KIOSK --es admin_pin "YOUR_SUPERVISOR_PIN"

# 2. Or remove Device Owner (requires factory reset or temporary test removal):
adb shell dpm remove-active-admin com.techxodia.schoolkiosk/.kiosk.KioskDeviceAdminReceiver
```
