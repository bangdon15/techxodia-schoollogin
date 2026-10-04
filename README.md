# Techxodia White-Label School Attendance & Identity System

A production-grade, white-label School Attendance & Identity System sharing a unified Supabase backend:
1. **Admin Web Portal (`apps/web-admin`)**: Next.js 14+ App Router, Tailwind CSS, Supabase SSR, Lucide Icons, featuring live attendance radar, webcam facial vector enrollment, kiosk QR provisioning, and dynamic CSS white-label branding.
2. **Android Time-In Kiosk (`apps/android-kiosk`)**: Unattended tablet application running in Android Lock Task Mode with CameraX, ML Kit Face Detection, TFLite 512D inference, and direct pgvector RPC verification with zero local storage.
3. **Shared Backend (`supabase/`)**: PostgreSQL schema with `pgcrypto`, `vector` (HNSW indexing), strict Row Level Security (RLS), atomic `verify_and_log_attendance` RPC, and Edge Functions.

---

## 📁 Monorepo Layout

```text
├── apps/
│   ├── web-admin/                               # Next.js 14+ App Router, Tailwind, Supabase SSR
│   │   ├── app/
│   │   │   ├── (auth)/login/page.tsx            # Administrator login portal
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx                   # Navbar + Sidebar wrapper
│   │   │   │   ├── page.tsx                     # Live Attendance Radar & KPI Metrics
│   │   │   │   ├── attendance/page.tsx          # Filterable attendance logs & CSV report export
│   │   │   │   ├── students/page.tsx            # Student/Staff directory & Face Enrollment modal
│   │   │   │   ├── kiosks/page.tsx              # Kiosk hardware status & QR Provisioning modal
│   │   │   │   └── settings/branding/page.tsx   # White-Label engine with live tablet preview
│   │   │   ├── api/
│   │   │   │   ├── extract-face/route.ts        # Face vector extraction endpoint
│   │   │   │   └── attendance/export/route.ts   # CSV export handler
│   │   │   ├── globals.css                      # Dynamic brand CSS variables (--brand-primary, etc.)
│   │   │   └── layout.tsx                       # Root layout with ThemeProvider
│   │   ├── components/
│   │   │   ├── ThemeProvider.tsx                # Runtime CSS variable injection & branding context
│   │   │   ├── Navbar.tsx                       # Header with school branding and live clock
│   │   │   ├── Sidebar.tsx                      # Navigation menu
│   │   │   ├── CameraEnrollmentModal.tsx        # Live webcam capture, alignment oval, and vector ingestion
│   │   │   └── KioskQrModal.tsx                 # Dynamic QR code & token generator for tablet pairing
│   │   └── lib/
│   │       ├── types.ts                         # Shared TypeScript definitions
│   │       ├── supabase/client.ts               # Supabase SSR client
│   │       └── face-extraction/extractor.ts     # Client helper for vector extraction
│   └── android-kiosk/                           # Dedicated Android Tablet App
│       ├── camera/
│       │   ├── FaceAnalyzer.kt                  # CameraX ImageAnalysis.Analyzer with ML Kit
│       │   ├── TFLiteEmbeddingEngine.kt         # MobileFaceNet 512D embedding with L2 normalization
│       │   └── LivenessValidator.kt             # Pose check (|Yaw| <= 15°, |Pitch| <= 15°) & eye-open check
│       ├── kiosk/
│       │   ├── LockTaskReceiver.kt              # DeviceAdminReceiver for single-app lockdown
│       │   └── DevicePolicyController.kt        # startLockTask(), immersive sticky window flags
│       ├── data/
│       │   ├── KioskConfig.kt                   # Kiosk configuration & verification models
│       │   └── SupabaseKioskClient.kt           # Calls verify_and_log_attendance RPC
│       └── ui/
│           ├── KioskMainActivity.kt             # Root Activity enforcing Lock Task
│           ├── KioskViewModel.kt                # State machine, audio chime, and 3-second cooldown
│           ├── CameraView.kt                    # CameraX preview AndroidView
│           ├── BrandedOverlay.kt                # Biometric oval guide, scanning laser, status pills
│           ├── SuccessBanner.kt                 # Celebratory green modal (2.5s display)
│           └── QrPairingScreen.kt               # First-boot QR code tablet pairing screen
└── supabase/
    ├── migrations/
    │   └── 20261004_consolidated_school_attendance_system.sql # Unified schema, HNSW index, RLS, RPCs
    └── functions/
        └── extract-face-vector/index.ts         # Edge Function for face vector extraction
```

---

## ⚡ Setup & Deployment

### 1. Supabase Database Migration
Execute `supabase/migrations/20261004_consolidated_school_attendance_system.sql` in your Supabase SQL Editor. This will:
* Enable `pgcrypto` and `vector` (pgvector).
* Create tables: `tenants`, `kiosk_devices`, `users`, `user_biometrics`, `attendance_logs`.
* Create HNSW index on `user_biometrics(face_vector vector_cosine_ops)`.
* Apply Row Level Security (RLS) with strict lockdown on `user_biometrics`.
* Deploy the atomic `verify_and_log_attendance` RPC function.

### 2. Admin Web Portal (`apps/web-admin`)
```bash
cd apps/web-admin
npm install

# Configure environment variables
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

npm run dev
# Open http://localhost:3000
```

### 3. Android Time-In Kiosk (`apps/android-kiosk`)
1. Build the APK via Gradle:
   ```bash
   cd apps/android-kiosk
   ./gradlew assembleRelease
   ```
2. Install APK onto the dedicated Android tablet via ADB:
   ```bash
   adb install -r -g app/build/outputs/apk/release/app-release.apk
   adb shell pm grant com.techxodia.schoolkiosk android.permission.CAMERA
   ```
3. Set app as **Device Owner** for silent Single-App Lock Task Mode:
   ```bash
   adb shell dpm set-device-owner com.techxodia.schoolkiosk/.kiosk.LockTaskReceiver
   ```
4. On first boot, the tablet displays `QrPairingScreen`. Scan the QR code generated from **Kiosk Terminals** in the Web Admin Portal to pair the device instantly.
