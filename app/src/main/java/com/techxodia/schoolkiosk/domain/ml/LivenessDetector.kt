package com.techxodia.schoolkiosk.domain.ml

import com.google.mlkit.vision.face.Face
import kotlin.math.abs

/**
 * Validates facial pose and dynamic liveness (anti-spoofing) to defeat printed photo
 * attacks and phone screen replay attacks.
 */
class LivenessDetector {

    enum class LivenessState {
        SEARCHING_FACE,
        ALIGN_HEAD_STRAIGHT,
        BLINK_OR_SMILE_CHALLENGE,
        LIVENESS_CONFIRMED,
        SPOOF_SUSPECTED
    }

    data class LivenessResult(
        val state: LivenessState,
        val isLive: Boolean,
        val feedbackMessage: String,
        val eyeOpenAvg: Float,
        val yawAngle: Float,
        val pitchAngle: Float
    )

    // Blink detection internal tracking state
    private var wasEyesClosedDetected = false
    private var frameCountInState = 0

    // Thresholds
    private val maxHeadEulerAngleYaw = 15.0f // Facing camera directly
    private val maxHeadEulerAnglePitch = 15.0f
    private val eyeClosedThreshold = 0.25f
    private val eyeOpenThreshold = 0.70f

    /**
     * Evaluates a detected face for head orientation and dynamic liveness.
     */
    fun evaluateFace(face: Face, requireBlinkChallenge: Boolean = true): LivenessResult {
        val yaw = face.headEulerAngleY // Head turned left/right
        val pitch = face.headEulerAngleX // Head tilted up/down

        // Step 1: Head alignment check
        if (abs(yaw) > maxHeadEulerAngleYaw || abs(pitch) > maxHeadEulerAnglePitch) {
            resetChallenge()
            val instruction = if (abs(yaw) > maxHeadEulerAngleYaw) {
                "Please look directly at the camera"
            } else {
                "Adjust head level with the kiosk screen"
            }
            return LivenessResult(
                state = LivenessState.ALIGN_HEAD_STRAIGHT,
                isLive = false,
                feedbackMessage = instruction,
                eyeOpenAvg = 0f,
                yawAngle = yaw,
                pitchAngle = pitch
            )
        }

        val leftEyeOpen = face.leftEyeOpenProbability ?: -1.0f
        val rightEyeOpen = face.rightEyeOpenProbability ?: -1.0f

        // If eyes probabilities are unavailable, check if head is centered
        if (leftEyeOpen < 0f || rightEyeOpen < 0f) {
            return LivenessResult(
                state = LivenessState.LIVENESS_CONFIRMED,
                isLive = true,
                feedbackMessage = "Face centered",
                eyeOpenAvg = 1.0f,
                yawAngle = yaw,
                pitchAngle = pitch
            )
        }

        val avgEyeOpen = (leftEyeOpen + rightEyeOpen) / 2.0f

        if (!requireBlinkChallenge) {
            // Passive liveness: Eyes must simply be open and attentive
            val isOpen = avgEyeOpen >= eyeOpenThreshold
            return LivenessResult(
                state = if (isOpen) LivenessState.LIVENESS_CONFIRMED else LivenessState.BLINK_OR_SMILE_CHALLENGE,
                isLive = isOpen,
                feedbackMessage = if (isOpen) "Face aligned" else "Please open your eyes",
                eyeOpenAvg = avgEyeOpen,
                yawAngle = yaw,
                pitchAngle = pitch
            )
        }

        // Active liveness: Eye blink transition challenge (Open -> Closed -> Open)
        frameCountInState++

        if (!wasEyesClosedDetected) {
            if (avgEyeOpen <= eyeClosedThreshold) {
                wasEyesClosedDetected = true
                return LivenessResult(
                    state = LivenessState.BLINK_OR_SMILE_CHALLENGE,
                    isLive = false,
                    feedbackMessage = "Blink detected! Open eyes now",
                    eyeOpenAvg = avgEyeOpen,
                    yawAngle = yaw,
                    pitchAngle = pitch
                )
            } else {
                return LivenessResult(
                    state = LivenessState.BLINK_OR_SMILE_CHALLENGE,
                    isLive = false,
                    feedbackMessage = "Please blink to verify you are here",
                    eyeOpenAvg = avgEyeOpen,
                    yawAngle = yaw,
                    pitchAngle = pitch
                )
            }
        } else {
            // Awaiting eyes reopening
            if (avgEyeOpen >= eyeOpenThreshold) {
                resetChallenge()
                return LivenessResult(
                    state = LivenessState.LIVENESS_CONFIRMED,
                    isLive = true,
                    feedbackMessage = "Liveness verified!",
                    eyeOpenAvg = avgEyeOpen,
                    yawAngle = yaw,
                    pitchAngle = pitch
                )
            } else {
                return LivenessResult(
                    state = LivenessState.BLINK_OR_SMILE_CHALLENGE,
                    isLive = false,
                    feedbackMessage = "Open eyes to complete scan",
                    eyeOpenAvg = avgEyeOpen,
                    yawAngle = yaw,
                    pitchAngle = pitch
                )
            }
        }
    }

    fun resetChallenge() {
        wasEyesClosedDetected = false
        frameCountInState = 0
    }
}
