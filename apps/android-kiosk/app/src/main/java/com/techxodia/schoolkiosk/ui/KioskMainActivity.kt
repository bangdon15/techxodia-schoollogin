package com.techxodia.schoolkiosk.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.content.ContextCompat
import com.techxodia.schoolkiosk.kiosk.DevicePolicyController

class KioskMainActivity : ComponentActivity() {

    private val viewModel: KioskViewModel by viewModels()
    private lateinit var policyController: DevicePolicyController
    private var hasCameraPermission by mutableStateOf(false)

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasCameraPermission = isGranted
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        policyController = DevicePolicyController(this)

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            hasCameraPermission = true
        } else {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }

        setContent {
            val uiState by viewModel.uiState.collectAsState()
            val config by viewModel.kioskConfig.collectAsState()

            Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
                if (uiState is KioskUiState.Pairing) {
                    QrPairingScreen(
                        currentConfig = config,
                        onPairSuccess = { newConfig ->
                            viewModel.completePairing(newConfig)
                        }
                    )
                } else if (hasCameraPermission) {
                    // Continuous Live Camera Feed
                    CameraView(
                        modifier = Modifier.fillMaxSize(),
                        analyzer = viewModel.analyzer
                    )

                    val statusMsg = when (val state = uiState) {
                        is KioskUiState.Standby -> state.message
                        is KioskUiState.Verifying -> "Verifying with School Cloud..."
                        is KioskUiState.Unrecognized -> state.message
                        is KioskUiState.Offline -> state.message
                        else -> "Ready"
                    }

                    // Dynamic School HUD
                    BrandedOverlay(
                        config = config,
                        statusMessage = statusMsg,
                        isVerifying = uiState is KioskUiState.Verifying,
                        isUnrecognized = uiState is KioskUiState.Unrecognized,
                        onSwitchGate = { viewModel.openGateSelector() },
                        onOpenFailSafe = { viewModel.openFailSafe() }
                    )

                    // Branded Success Modal with "Not you?" Fail-Safe
                    if (uiState is KioskUiState.Success) {
                        val result = (uiState as KioskUiState.Success).result
                        SuccessBanner(
                            result = result,
                            config = config,
                            onNotYou = { viewModel.onNotYouClicked(result.attendanceId) }
                        )
                    }

                    // Fail-Safe PIN Keypad Overlay
                    if (uiState is KioskUiState.FailSafe) {
                        val failSafeState = uiState as KioskUiState.FailSafe
                        FailSafeDialog(
                            promptMessage = failSafeState.promptMessage,
                            isVerifying = failSafeState.isVerifying,
                            errorMessage = failSafeState.errorMessage,
                            onSubmitPin = { pin -> viewModel.verifyBackupPin(pin) },
                            onRetryFaceScan = { viewModel.resetToStandby() },
                            onDismiss = { viewModel.dismissFailSafe() }
                        )
                    }
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        policyController.enterKioskMode()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) policyController.enterKioskMode()
    }

    @Deprecated("Deprecated in Java", ReplaceWith("Unit"))
    override fun onBackPressed() {
        // Block back navigation gesture in Lock Task Mode
    }
}
