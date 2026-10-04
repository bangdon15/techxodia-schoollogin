# Launches the Android Pixel Tablet Emulator and prepares Kiosk deployment
$env:JAVA_HOME = "C:\Users\Windows\.gradle\jdks\eclipse_adoptium-21-amd64-windows.2"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$env:ANDROID_HOME = "C:\Users\Windows\AppData\Local\Android\Sdk"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Techxodia School Kiosk - Android Tablet Launcher" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$emulatorPath = "$env:ANDROID_HOME\emulator\emulator.exe"
$adbPath = "$env:ANDROID_HOME\platform-tools\adb.exe"

if (Test-Path $emulatorPath) {
    Write-Host "Starting Pixel_Tablet AVD in background..." -ForegroundColor Yellow
    Start-Process -FilePath $emulatorPath -ArgumentList "-avd", "Pixel_Tablet", "-netdelay", "none", "-netspeed", "full"
    
    Write-Host "Waiting for device to boot..." -ForegroundColor Yellow
    & $adbPath wait-for-device
    & $adbPath wait-for-device shell 'while [[ -z $(getprop sys.boot_completed) ]]; do sleep 1; done;'
    Write-Host "Tablet booted successfully!" -ForegroundColor Green

    $apkPath = "D:\Techxodia-schoollogin\app-debug.apk"
    if (Test-Path $apkPath) {
        Write-Host "Installing $apkPath..." -ForegroundColor Yellow
        & $adbPath install -r $apkPath
        Write-Host "Launching Kiosk App..." -ForegroundColor Green
        & $adbPath shell am start -n com.techxodia.schoolkiosk/.MainActivity
    }
} else {
    Write-Host "Android Emulator binary not found at $emulatorPath." -ForegroundColor Red
}
