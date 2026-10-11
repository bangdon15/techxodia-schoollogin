package com.techxodia.schoolkiosk.domain.camerax

import android.graphics.Bitmap
import android.graphics.Matrix
import android.graphics.Rect
import android.util.Log
import androidx.annotation.OptIn
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.Face
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetector
import com.google.mlkit.vision.face.FaceDetectorOptions
import com.techxodia.schoolkiosk.domain.ml.FaceEmbeddingExtractor
import com.techxodia.schoolkiosk.domain.ml.LivenessDetector

/**
 * CameraX ImageAnalysis.Analyzer for continuous real-time face detection,
 * liveness verification, and in-memory 512-dim embedding extraction.
 *
 * Strict Zero-Persistence Policy:
 * Raw camera frames are analyzed directly in RAM, embeddings are calculated,
 * and memory buffers are immediately recycled.
 */
class KioskFaceAnalyzer(
    private val embeddingExtractor: FaceEmbeddingExtractor,
    private val livenessDetector: LivenessDetector,
    private val requireLivenessChallenge: Boolean = true,
    private val onAnalysisUpdate: (
        livenessResult: LivenessDetector.LivenessResult,
        faceBoundingBox: Rect?,
        embedding: FloatArray?
    ) -> Unit
) : ImageAnalysis.Analyzer {

    private val detector: FaceDetector

    // Cooldown flag to prevent redundant inference during verification/confirmation states
    var isProcessingSuspended: Boolean = false

    init {
        val options = FaceDetectorOptions.Builder()
            .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
            .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
            .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
            .setMinFaceSize(0.20f) // Ignore far-away background passersby
            .enableTracking()
            .build()
        detector = FaceDetection.getClient(options)
    }

    @OptIn(ExperimentalGetImage::class)
    override fun analyze(imageProxy: ImageProxy) {
        if (isProcessingSuspended) {
            imageProxy.close()
            return
        }

        val mediaImage = imageProxy.image
        if (mediaImage == null) {
            imageProxy.close()
            return
        }

        val rotationDegrees = imageProxy.imageInfo.rotationDegrees
        val inputImage = InputImage.fromMediaImage(mediaImage, rotationDegrees)

        detector.process(inputImage)
            .addOnSuccessListener { faces ->
                try {
                    handleDetection(faces, imageProxy, rotationDegrees)
                } catch (e: Exception) {
                    Log.e(TAG, "Exception during face frame handling", e)
                }
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "ML Kit face detection failed", e)
            }
            .addOnCompleteListener {
                // Mandatory recycling: Closes the ImageProxy to allow CameraX to deliver next frame
                imageProxy.close()
            }
    }

    private fun handleDetection(faces: List<Face>, imageProxy: ImageProxy, rotationDegrees: Int) {
        if (faces.isEmpty()) {
            livenessDetector.resetChallenge()
            onAnalysisUpdate(
                LivenessDetector.LivenessResult(
                    state = LivenessDetector.LivenessState.SEARCHING_FACE,
                    isLive = false,
                    feedbackMessage = "Position your face in the oval guide",
                    eyeOpenAvg = 0f,
                    yawAngle = 0f,
                    pitchAngle = 0f
                ),
                null,
                null
            )
            return
        }

        // Focus on the most prominent / centered face
        val primaryFace = faces.maxByOrNull { it.boundingBox.width() * it.boundingBox.height() } ?: return

        // Step 1: Liveness and orientation check
        val livenessResult = livenessDetector.evaluateFace(primaryFace, requireLivenessChallenge)

        // Step 2: If liveness passed and face is looking straight, extract 512-dim embedding
        var embedding: FloatArray? = null
        if (livenessResult.isLive) {
            embedding = extractFaceEmbeddingFromProxy(imageProxy, primaryFace.boundingBox, rotationDegrees)
        }

        onAnalysisUpdate(livenessResult, primaryFace.boundingBox, embedding)
    }

    /**
     * Converts the ImageProxy frame to a cropped Face Bitmap in RAM and computes
     * the 512-dim embedding vector via TFLite.
     */
    private fun extractFaceEmbeddingFromProxy(
        imageProxy: ImageProxy,
        boundingBox: Rect,
        rotationDegrees: Int
    ): FloatArray? {
        var rawBitmap: Bitmap? = null
        var rotatedBitmap: Bitmap? = null
        var croppedFaceBitmap: Bitmap? = null

        return try {
            rawBitmap = imageProxy.toBitmap()

            // Rotate bitmap to match camera display orientation
            rotatedBitmap = if (rotationDegrees != 0) {
                val matrix = Matrix().apply { postRotate(rotationDegrees.toFloat()) }
                Bitmap.createBitmap(rawBitmap, 0, 0, rawBitmap.width, rawBitmap.height, matrix, true)
            } else {
                rawBitmap
            }

            // Expand bounding box slightly (15%) for better biometric feature coverage
            val marginX = (boundingBox.width() * 0.15f).toInt()
            val marginY = (boundingBox.height() * 0.15f).toInt()

            val cropLeft = (boundingBox.left - marginX).coerceAtLeast(0)
            val cropTop = (boundingBox.top - marginY).coerceAtLeast(0)
            val cropWidth = (boundingBox.width() + 2 * marginX).coerceAtMost(rotatedBitmap.width - cropLeft)
            val cropHeight = (boundingBox.height() + 2 * marginY).coerceAtMost(rotatedBitmap.height - cropTop)

            if (cropWidth <= 0 || cropHeight <= 0) {
                return null
            }

            croppedFaceBitmap = Bitmap.createBitmap(rotatedBitmap, cropLeft, cropTop, cropWidth, cropHeight)

            // Execute TFLite inference in-memory
            embeddingExtractor.extractEmbedding(croppedFaceBitmap)
        } catch (e: Exception) {
            Log.e(TAG, "Error cropping face or running embedding extraction", e)
            null
        } finally {
            // Strictly recycle all temporary RAM bitmaps
            if (rawBitmap != null && rawBitmap != rotatedBitmap && !rawBitmap.isRecycled) {
                rawBitmap.recycle()
            }
            if (rotatedBitmap != null && !rotatedBitmap.isRecycled) {
                rotatedBitmap.recycle()
            }
            if (croppedFaceBitmap != null && !croppedFaceBitmap.isRecycled) {
                croppedFaceBitmap.recycle()
            }
        }
    }

    fun close() {
        detector.close()
    }

    companion object {
        private const val TAG = "KioskFaceAnalyzer"
    }
}
