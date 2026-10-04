package com.techxodia.schoolkiosk.camera

import android.graphics.Bitmap
import android.graphics.Matrix
import android.graphics.Rect
import android.util.Log
import androidx.annotation.OptIn
import androidx.camera.core.ExperimentalGetImage
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.FaceDetection
import com.google.mlkit.vision.face.FaceDetector
import com.google.mlkit.vision.face.FaceDetectorOptions

class FaceAnalyzer(
    private val embeddingEngine: TFLiteEmbeddingEngine,
    private val livenessValidator: LivenessValidator,
    private val onFaceVectorExtracted: (embedding: FloatArray, statusMessage: String) -> Unit,
    private val onStatusUpdate: (message: String) -> Unit
) : ImageAnalysis.Analyzer {

    private val detector: FaceDetector
    var isSuspended: Boolean = false

    init {
        val options = FaceDetectorOptions.Builder()
            .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_FAST)
            .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
            .setMinFaceSize(0.25f)
            .build()
        detector = FaceDetection.getClient(options)
    }

    @OptIn(ExperimentalGetImage::class)
    override fun analyze(imageProxy: ImageProxy) {
        if (isSuspended) {
            imageProxy.close()
            return
        }

        val mediaImage = imageProxy.image
        if (mediaImage == null) {
            imageProxy.close()
            return
        }

        val rotation = imageProxy.imageInfo.rotationDegrees
        val inputImage = InputImage.fromMediaImage(mediaImage, rotation)

        detector.process(inputImage)
            .addOnSuccessListener { faces ->
                if (faces.isEmpty()) {
                    onStatusUpdate("Position face in the guide oval")
                    return@addOnSuccessListener
                }

                val primaryFace = faces.maxByOrNull { it.boundingBox.width() * it.boundingBox.height() } ?: return@addOnSuccessListener
                val validation = livenessValidator.validate(primaryFace)

                if (!validation.isPassed) {
                    onStatusUpdate(validation.message)
                    return@addOnSuccessListener
                }

                // Liveness verified! Extract 512D embedding from RAM
                val vector = extractVectorFromProxy(imageProxy, primaryFace.boundingBox, rotation)
                if (vector != null) {
                    onFaceVectorExtracted(vector, "Verifying with School Cloud...")
                }
            }
            .addOnFailureListener {
                Log.e("FaceAnalyzer", "Face detection error", it)
            }
            .addOnCompleteListener {
                // Strict zero-persistence memory recycling
                imageProxy.close()
            }
    }

    private fun extractVectorFromProxy(imageProxy: ImageProxy, bounds: Rect, rotation: Int): FloatArray? {
        var rawBitmap: Bitmap? = null
        var rotatedBitmap: Bitmap? = null
        var croppedFace: Bitmap? = null

        return try {
            rawBitmap = imageProxy.toBitmap()
            rotatedBitmap = if (rotation != 0) {
                val m = Matrix().apply { postRotate(rotation.toFloat()) }
                Bitmap.createBitmap(rawBitmap, 0, 0, rawBitmap.width, rawBitmap.height, m, true)
            } else {
                rawBitmap
            }

            val margin = (bounds.width() * 0.15f).toInt()
            val left = (bounds.left - margin).coerceAtLeast(0)
            val top = (bounds.top - margin).coerceAtLeast(0)
            val width = (bounds.width() + 2 * margin).coerceAtMost(rotatedBitmap.width - left)
            val height = (bounds.height() + 2 * margin).coerceAtMost(rotatedBitmap.height - top)

            if (width <= 0 || height <= 0) return null

            croppedFace = Bitmap.createBitmap(rotatedBitmap, left, top, width, height)
            embeddingEngine.extract(croppedFace)
        } catch (e: Exception) {
            Log.e("FaceAnalyzer", "Cropping failed", e)
            null
        } finally {
            if (rawBitmap != null && rawBitmap != rotatedBitmap && !rawBitmap.isRecycled) rawBitmap.recycle()
            if (rotatedBitmap != null && !rotatedBitmap.isRecycled) rotatedBitmap.recycle()
            if (croppedFace != null && !croppedFace.isRecycled) croppedFace.recycle()
        }
    }

    fun close() {
        detector.close()
    }
}
