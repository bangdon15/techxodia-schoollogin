package com.techxodia.schoolkiosk.ui

import android.app.Application
import android.media.AudioManager
import android.media.ToneGenerator
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.techxodia.schoolkiosk.data.model.StudentMatchResult
import com.techxodia.schoolkiosk.data.model.TenantConfig
import com.techxodia.schoolkiosk.data.supabase.SupabaseService
import com.techxodia.schoolkiosk.domain.camerax.KioskFaceAnalyzer
import com.techxodia.schoolkiosk.domain.ml.FaceEmbeddingExtractor
import com.techxodia.schoolkiosk.domain.ml.LivenessDetector
import com.techxodia.schoolkiosk.kiosk.KioskHeartbeatMonitor
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class KioskUiState {
    data class Standby(val feedback: String = "Position your face in the oval guide") : KioskUiState()
    data class Liveness(val state: LivenessDetector.LivenessState, val feedback: String) : KioskUiState()
    object Verifying : KioskUiState()
    data class Success(val match: StudentMatchResult) : KioskUiState()
    data class Unrecognized(val reason: String = "Face not recognized. Please see front desk.") : KioskUiState()
    data class Offline(val message: String) : KioskUiState()
}

class KioskViewModel(application: Application) : AndroidViewModel(application) {

    private val supabaseService = SupabaseService(application)
    private val embeddingExtractor = FaceEmbeddingExtractor(application)
    private val livenessDetector = LivenessDetector()

    private val _tenantConfig = MutableStateFlow(supabaseService.loadFallbackConfig())
    val tenantConfig: StateFlow<TenantConfig> = _tenantConfig.asStateFlow()

    private val _uiState = MutableStateFlow<KioskUiState>(KioskUiState.Standby())
    val uiState: StateFlow<KioskUiState> = _uiState.asStateFlow()

    private val heartbeatMonitor = KioskHeartbeatMonitor(application, supabaseService, viewModelScope)

    // Hardware ToneGenerator for crisp audible feedback
    private var toneGenerator: ToneGenerator? = null

    val analyzer: KioskFaceAnalyzer

    private var matchJob: Job? = null
    private var lastMatchedStudentId: String? = null
    private var lastMatchTimestamp: Long = 0L
    private val cooldownWindowMs = 6000L // Prevent duplicate submissions for same student within 6s

    init {
        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 95)
        } catch (e: Exception) {
            Log.w(TAG, "ToneGenerator not available on this audio device", e)
        }

        analyzer = KioskFaceAnalyzer(
            embeddingExtractor = embeddingExtractor,
            livenessDetector = livenessDetector,
            requireLivenessChallenge = _tenantConfig.value.livenessRequired
        ) { livenessResult, bounds, embedding ->
            onAnalysisUpdate(livenessResult, embedding)
        }

        // 1. Fetch dynamic tenant config from Supabase at runtime
        fetchDynamicBranding()

        // 2. Start periodic telemetry heartbeat
        heartbeatMonitor.start(_tenantConfig.value.heartbeatIntervalSeconds)
    }

    private fun fetchDynamicBranding() {
        viewModelScope.launch {
            val dynamicConfig = supabaseService.fetchDynamicTenantConfig(_tenantConfig.value.kioskLocationId)
            _tenantConfig.value = dynamicConfig
        }
    }

    private fun onAnalysisUpdate(
        livenessResult: LivenessDetector.LivenessResult,
        embedding: FloatArray?
    ) {
        val currentState = _uiState.value
        if (currentState is KioskUiState.Verifying ||
            currentState is KioskUiState.Success ||
            currentState is KioskUiState.Offline
        ) {
            return
        }

        if (!livenessResult.isLive) {
            if (livenessResult.state == LivenessDetector.LivenessState.SEARCHING_FACE) {
                _uiState.value = KioskUiState.Standby(livenessResult.feedbackMessage)
            } else {
                _uiState.value = KioskUiState.Liveness(livenessResult.state, livenessResult.feedbackMessage)
            }
            return
        }

        // Liveness confirmed! If an embedding vector is available, proceed to match
        if (embedding != null && matchJob?.isActive != true) {
            triggerCloudMatch(embedding)
        }
    }

    private fun triggerCloudMatch(embedding: FloatArray) {
        matchJob = viewModelScope.launch {
            analyzer.isProcessingSuspended = true
            _uiState.value = KioskUiState.Verifying

            val result = supabaseService.matchStudentFace(
                embedding = embedding,
                threshold = _tenantConfig.value.cosineSimilarityThreshold,
                kioskId = _tenantConfig.value.kioskLocationId
            )

            result.onSuccess { match ->
                if (match.matched) {
                    val now = System.currentTimeMillis()
                    if (match.studentId == lastMatchedStudentId && (now - lastMatchTimestamp) < cooldownWindowMs) {
                        Log.i(TAG, "Ignoring duplicate trigger for student ${match.fullName}")
                        resetToStandby()
                        return@onSuccess
                    }

                    lastMatchedStudentId = match.studentId
                    lastMatchTimestamp = now

                    playSuccessChime()
                    _uiState.value = KioskUiState.Success(match)

                    // Display success confirmation card for 3 seconds
                    delay(3000)
                    resetToStandby()
                } else {
                    playFailureTone()
                    _uiState.value = KioskUiState.Unrecognized(match.message ?: "Student face not recognized")
                    delay(2500)
                    resetToStandby()
                }
            }.onFailure { error ->
                Log.e(TAG, "Biometric match RPC failed or timed out", error)
                _uiState.value = KioskUiState.Offline("Cloud attendance service unreachable.")
                delay(4000)
                resetToStandby()
            }
        }
    }

    private fun resetToStandby() {
        livenessDetector.resetChallenge()
        _uiState.value = KioskUiState.Standby()
        analyzer.isProcessingSuspended = false
    }

    private fun playSuccessChime() {
        try {
            toneGenerator?.startTone(ToneGenerator.TONE_PROP_BEEP2, 250)
        } catch (e: Exception) {
            Log.w(TAG, "Audio chime playback error", e)
        }
    }

    private fun playFailureTone() {
        try {
            toneGenerator?.startTone(ToneGenerator.TONE_PROP_NACK, 300)
        } catch (e: Exception) {
            Log.w(TAG, "Audio error tone playback error", e)
        }
    }

    override fun onCleared() {
        super.onCleared()
        heartbeatMonitor.stop()
        analyzer.close()
        embeddingExtractor.close()
        toneGenerator?.release()
        toneGenerator = null
    }

    companion object {
        private const val TAG = "KioskViewModel"
    }
}
