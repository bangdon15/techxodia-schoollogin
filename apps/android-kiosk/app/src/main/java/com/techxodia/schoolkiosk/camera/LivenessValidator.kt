package com.techxodia.schoolkiosk.camera

import com.google.mlkit.vision.face.Face
import kotlin.math.abs

class LivenessValidator {

    data class Result(
        val isPassed: Boolean,
        val message: String,
        val yaw: Float,
        val pitch: Float
    )

    fun validate(face: Face): Result {
        val yaw = face.headEulerAngleY
        val pitch = face.headEulerAngleX

        // 1. Pose Check: Face must be centered and looking directly forward
        if (abs(yaw) > 15.0f) {
            return Result(false, "Please look directly at the kiosk screen", yaw, pitch)
        }
        if (abs(pitch) > 15.0f) {
            return Result(false, "Please adjust head level with the camera", yaw, pitch)
        }

        // 2. Eyes Open Check (anti-sleeping/closed eye)
        val leftEye = face.leftEyeOpenProbability ?: 1.0f
        val rightEye = face.rightEyeOpenProbability ?: 1.0f
        if (leftEye < 0.4f || rightEye < 0.4f) {
            return Result(false, "Please keep eyes open", yaw, pitch)
        }

        return Result(true, "Face Aligned", yaw, pitch)
    }
}
