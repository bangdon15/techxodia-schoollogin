package com.techxodia.schoolkiosk.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import com.techxodia.schoolkiosk.domain.ml.LivenessDetector
import com.techxodia.schoolkiosk.kiosk.KioskManager
import com.techxodia.schoolkiosk.ui.components.CameraPreview
import com.techxodia.schoolkiosk.ui.components.FaceOverlay
import com.techxodia.schoolkiosk.ui.components.OfflineBanner
import com.techxodia.schoolkiosk.ui.components.SuccessCard
import com.techxodia.schoolkiosk.ui.theme.DynamicTenantTheme

class KioskActivity : ComponentActivity() {

    private val viewModel: KioskViewModel by viewModels()
    private lateinit var kioskManager: KioskManager

    private var hasCameraPermission by mutableStateOf(false)

    private val requestCameraPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            hasCameraPermission = isGranted
            if (!isGranted) {
                Toast.makeText(
                    this,
                    "Camera permission is required for unattended facial authentication.",
                    Toast.LENGTH_LONG
                ).show()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        kioskManager = KioskManager(this)

        checkCameraPermission()

        setContent {
            val tenantConfig by viewModel.tenantConfig.collectAsState()
            val uiState by viewModel.uiState.collectAsState()

            DynamicTenantTheme(tenantConfig = tenantConfig) {
                KioskScreen(
                    hasCameraPermission = hasCameraPermission,
                    uiState = uiState,
                    tenantConfig = tenantConfig,
                    analyzer = viewModel.analyzer
                )
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Lock screen into kiosk mode and immersive full screen
        kioskManager.enterKioskMode(this)
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            kioskManager.enterKioskMode(this)
        }
    }

    @Deprecated("Deprecated in Java", ReplaceWith("Unit"))
    override fun onBackPressed() {
        // Suppress back button navigation completely in kiosk mode
    }

    private fun checkCameraPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            hasCameraPermission = true
        } else {
            requestCameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }
}

@Composable
fun KioskScreen(
    hasCameraPermission: Boolean,
    uiState: KioskUiState,
    tenantConfig: com.techxodia.schoolkiosk.data.model.TenantConfig,
    analyzer: com.techxodia.schoolkiosk.domain.camerax.KioskFaceAnalyzer
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        if (hasCameraPermission) {
            // Camera Stream
            CameraPreview(
                modifier = Modifier.fillMaxSize(),
                analyzer = analyzer
            )

            // Extract feedback message and liveness state
            val (livenessState, feedback) = when (uiState) {
                is KioskUiState.Standby -> Pair(LivenessDetector.LivenessState.SEARCHING_FACE, uiState.feedback)
                is KioskUiState.Liveness -> Pair(uiState.state, uiState.feedback)
                is KioskUiState.Verifying -> Pair(LivenessDetector.LivenessState.LIVENESS_CONFIRMED, "Verifying face...")
                is KioskUiState.Unrecognized -> Pair(LivenessDetector.LivenessState.SEARCHING_FACE, uiState.reason)
                else -> Pair(LivenessDetector.LivenessState.SEARCHING_FACE, "Ready")
            }

            // HUD Overlay
            FaceOverlay(
                modifier = Modifier.fillMaxSize(),
                tenantConfig = tenantConfig,
                livenessState = livenessState,
                feedbackMessage = feedback,
                isVerifying = uiState is KioskUiState.Verifying
            )

            // Success Confirmation Card (displayed for 3 seconds)
            if (uiState is KioskUiState.Success) {
                SuccessCard(
                    matchResult = uiState.match,
                    tenantConfig = tenantConfig
                )
            }

            // Offline Network Warning
            if (uiState is KioskUiState.Offline) {
                OfflineBanner(
                    schoolName = tenantConfig.schoolName
                )
            }
        } else {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Awaiting Camera Access Permission...",
                    style = MaterialTheme.typography.titleLarge,
                    color = Color.White
                )
            }
        }
    }
}
