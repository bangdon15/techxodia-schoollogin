package com.techxodia.schoolkiosk.camera

import com.google.mlkit.vision.face.Face
import kotlin.math.abs

/**
 * High-Speed Kiosk Face Alignment Validator
 * 
 * Optimized for low-resolution tablet front cameras and varied lighting.
 * Detects face presence without requiring strict eye gaze or direct eye contact,
 * allowing instant time-in recognition as soon as the face enters the oval guide.
 */
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

        // Broad yaw/pitch tolerances (+-45 deg) to comfortably capture students/staff
        // even if looking slightly away or at an angle to the tablet.
        if (abs(yaw) > 48.0f) {
            return Result(false, "Please face towards the tablet", yaw, pitch)
        }
        if (abs(pitch) > 48.0f) {
            return Result(false, "Please adjust angle to screen", yaw, pitch)
        }

        // Removed strict eye-open probability checks so low-res camera noise,
        // spectacles, or indirect gaze do not block instant recognition.
        return Result(true, "Face Aligned", yaw, pitch)
    }
}
