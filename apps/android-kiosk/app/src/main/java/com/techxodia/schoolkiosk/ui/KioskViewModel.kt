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
import com.techxodia.schoolkiosk.data.StudentPreviewData
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
    data class FailSafe(
        val promptMessage: String = "Face not recognized. Use Two-Factor ID or QR Pass:",
        val errorMessage: String? = null,
        val isVerifying: Boolean = false,
        val previewStudent: StudentPreviewData? = null
    ) : KioskUiState()
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
    private var lastExtractedFaceVector: FloatArray? = null

    init {
        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 95)
        } catch (e: Exception) {}

        analyzer = FaceAnalyzer(
            embeddingEngine = embeddingEngine,
            livenessValidator = livenessValidator,
            onFaceVectorExtracted = { embedding, _ ->
                lastExtractedFaceVector = embedding
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

    fun openFailSafe(message: String = "Face not recognized. Use Two-Factor ID or QR Pass:") {
        verificationJob?.cancel()
        analyzer.isSuspended = true
        _uiState.value = KioskUiState.FailSafe(promptMessage = message)
    }

    fun dismissFailSafe() {
        resetToStandby()
    }

    /**
     * Triggered when the user taps the "Not you?" button on the Success banner.
     * Cancels the incorrect attendance entry and presents the ATM Two-Factor fail-safe.
     */
    fun onNotYouClicked(attendanceId: String?) {
        verificationJob?.cancel()
        analyzer.isSuspended = true

        viewModelScope.launch {
            if (!attendanceId.isNullOrBlank()) {
                supabaseClient.cancelAttendance(attendanceId, "User clicked 'Not you?' button")
            }
            playChime(false)
            _uiState.value = KioskUiState.FailSafe(
                promptMessage = "Attendance cancelled. Enter your Student ID & PIN to verify:"
            )
        }
    }

    /**
     * Live Preview: Looks up Student/Staff Name & Avatar as they type their ID number.
     */
    fun lookupStudentId(idNumber: String) {
        if (idNumber.length < 3) return
        viewModelScope.launch {
            val res = supabaseClient.previewStudentId(idNumber)
            res.onSuccess { r ->
                if (r.found && r.preview != null) {
                    val currentState = _uiState.value
                    if (currentState is KioskUiState.FailSafe) {
                        _uiState.value = currentState.copy(previewStudent = r.preview)
                    }
                }
            }
        }
    }

    /**
     * Option 1 Two-Factor ATM Verification: Student ID + Security PIN.
     * Automatically recalibrates facial biometrics on the fly!
     */
    fun verifyIdAndPin(studentOrEmpId: String, pin: String) {
        viewModelScope.launch {
            val currentState = _uiState.value as? KioskUiState.FailSafe
            _uiState.value = KioskUiState.FailSafe(
                promptMessage = "Verifying ID + PIN & recalibrating...",
                isVerifying = true,
                previewStudent = currentState?.previewStudent
            )

            val res = supabaseClient.verifyIdAndPin(
                studentOrEmpId = studentOrEmpId,
                pin = pin,
                recalibrationVector = lastExtractedFaceVector
            )

            res.onSuccess { match ->
                if (match.matched) {
                    playChime(true)
                    _uiState.value = KioskUiState.Success(match)
                    delay(3000)
                    resetToStandby()
                } else {
                    playChime(false)
                    _uiState.value = KioskUiState.FailSafe(
                        promptMessage = "Enter your Student ID & 4-digit PIN:",
                        errorMessage = match.message ?: "Incorrect Student ID or PIN. Please retry.",
                        isVerifying = false,
                        previewStudent = currentState?.previewStudent
                    )
                }
            }.onFailure {
                playChime(false)
                _uiState.value = KioskUiState.FailSafe(
                    promptMessage = "Enter your Student ID & 4-digit PIN:",
                    errorMessage = "Verification service unreachable. Please retry.",
                    isVerifying = false,
                    previewStudent = currentState?.previewStudent
                )
            }
        }
    }

    /**
     * Digital QR Code Pass Scanner Verification
     */
    fun verifyQrPass(qrPayload: String) {
        viewModelScope.launch {
            _uiState.value = KioskUiState.FailSafe(
                promptMessage = "Scanning Digital Pass...",
                isVerifying = true
            )

            val res = supabaseClient.verifyQrPass(qrPayload)
            res.onSuccess { match ->
                if (match.matched) {
                    playChime(true)
                    _uiState.value = KioskUiState.Success(match)
                    delay(3000)
                    resetToStandby()
                } else {
                    playChime(false)
                    _uiState.value = KioskUiState.FailSafe(
                        promptMessage = "Digital Pass scanning failed.",
                        errorMessage = match.message ?: "Pass not recognized in school directory.",
                        isVerifying = false
                    )
                }
            }.onFailure {
                playChime(false)
                _uiState.value = KioskUiState.FailSafe(
                    promptMessage = "Scan Digital QR Pass:",
                    errorMessage = "Cloud verification failed. Please see security desk.",
                    isVerifying = false
                )
            }
        }
    }

    private fun onFaceReadyForCloud(embedding: FloatArray) {
        val state = _uiState.value
        if (state is KioskUiState.Verifying ||
            state is KioskUiState.Success ||
            state is KioskUiState.FailSafe ||
            verificationJob?.isActive == true
        ) {
            return
        }

        verificationJob = viewModelScope.launch {
            analyzer.isSuspended = true
            _uiState.value = KioskUiState.Verifying

            val res = supabaseClient.verifyAndLogAttendance(embedding, threshold = 0.68)

            res.onSuccess { match ->
                if (match.matched) {
                    playChime(true)
                    _uiState.value = KioskUiState.Success(match)
                    delay(3000)
                    resetToStandby()
                } else {
                    playChime(false)
                    _uiState.value = KioskUiState.Unrecognized(
                        match.message ?: "Face not recognized - Please retry or use Student ID"
                    )
                    delay(2200)
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

    fun resetToStandby() {
        viewModelScope.launch {
            delay(500)
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
