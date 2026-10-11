package com.techxodia.schoolkiosk.ui

import android.app.Application
import android.media.AudioManager
import android.media.ToneGenerator
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.techxodia.schoolkiosk.camera.FaceAnalyzer
import com.techxodia.schoolkiosk.camera.LivenessValidator
import com.techxodia.schoolkiosk.camera.TFLiteEmbeddingEngine
import com.techxodia.schoolkiosk.data.AttendanceVerificationResult
import com.techxodia.schoolkiosk.data.KioskConfig
import com.techxodia.schoolkiosk.data.SupabaseKioskClient
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class KioskUiState {
    object Pairing : KioskUiState()
    data class Standby(val message: String = "Position face in the guide oval") : KioskUiState()
    object Verifying : KioskUiState()
    data class Success(val result: AttendanceVerificationResult) : KioskUiState()
    data class Unrecognized(val message: String = "Face not recognized - Please retry or see front desk") : KioskUiState()
    data class Offline(val message: String) : KioskUiState()
}

class KioskViewModel(application: Application) : AndroidViewModel(application) {

    val supabaseClient = SupabaseKioskClient(application)
    private val embeddingEngine = TFLiteEmbeddingEngine(application)
    private val livenessValidator = LivenessValidator()

    private val _kioskConfig = MutableStateFlow(supabaseClient.loadFallbackConfig())
    val kioskConfig: StateFlow<KioskConfig> = _kioskConfig.asStateFlow()

    private val _uiState = MutableStateFlow<KioskUiState>(
        if (_kioskConfig.value.deviceToken.isBlank()) KioskUiState.Pairing else KioskUiState.Standby()
    )
    val uiState: StateFlow<KioskUiState> = _uiState.asStateFlow()

    val analyzer: FaceAnalyzer

    private var toneGenerator: ToneGenerator? = null
    private var verificationJob: Job? = null

    init {
        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 95)
        } catch (e: Exception) {}

        analyzer = FaceAnalyzer(
            embeddingEngine = embeddingEngine,
            livenessValidator = livenessValidator,
            onFaceVectorExtracted = { embedding, msg ->
                onFaceReadyForCloud(embedding)
            },
            onStatusUpdate = { msg ->
                val state = _uiState.value
                if (state is KioskUiState.Standby) {
                    _uiState.value = KioskUiState.Standby(msg)
                }
            }
        )
    }

    fun completePairing(newConfig: KioskConfig) {
        _kioskConfig.value = newConfig
        supabaseClient.saveSelectedGate(newConfig)
        _uiState.value = KioskUiState.Standby()
    }

    fun openGateSelector() {
        _uiState.value = KioskUiState.Pairing
    }

    private fun onFaceReadyForCloud(embedding: FloatArray) {
        val state = _uiState.value
        if (state is KioskUiState.Verifying || state is KioskUiState.Success || verificationJob?.isActive == true) {
            return
        }

        verificationJob = viewModelScope.launch {
            analyzer.isSuspended = true
            _uiState.value = KioskUiState.Verifying

            val res = supabaseClient.verifyAndLogAttendance(embedding, threshold = 0.38)

            res.onSuccess { match ->
                if (match.matched) {
                    playChime(true)
                    _uiState.value = KioskUiState.Success(match)
                    // Show success banner for 2.5 seconds
                    delay(2500)
                    resetToStandby()
                } else {
                    playChime(false)
                    _uiState.value = KioskUiState.Unrecognized(match.message ?: "Face not recognized - Please retry or see front desk")
                    // Show unrecognized warning for 1.5 seconds
                    delay(1500)
                    resetToStandby()
                }
            }.onFailure { err ->
                Log.e("KioskViewModel", "Verification error", err)
                _uiState.value = KioskUiState.Offline("Cloud attendance service unreachable.")
                delay(3000)
                resetToStandby()
            }
        }
    }

    private fun resetToStandby() {
        // Enforce 3-second camera cooldown to avoid accidental double-triggers
        viewModelScope.launch {
            delay(1000) // Cooldown period
            _uiState.value = KioskUiState.Standby()
            analyzer.isSuspended = false
        }
    }

    private fun playChime(isSuccess: Boolean) {
        try {
            if (isSuccess) {
                toneGenerator?.startTone(ToneGenerator.TONE_PROP_BEEP2, 220)
            } else {
                toneGenerator?.startTone(ToneGenerator.TONE_PROP_NACK, 280)
            }
        } catch (e: Exception) {}
    }

    override fun onCleared() {
        super.onCleared()
        analyzer.close()
        embeddingEngine.close()
        toneGenerator?.release()
    }
}
