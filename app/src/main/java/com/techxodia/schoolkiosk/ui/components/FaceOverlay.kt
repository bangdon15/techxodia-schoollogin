package com.techxodia.schoolkiosk.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Face
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.BlendMode
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.techxodia.schoolkiosk.data.model.TenantConfig
import com.techxodia.schoolkiosk.domain.ml.LivenessDetector
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun FaceOverlay(
    modifier: Modifier = Modifier,
    tenantConfig: TenantConfig,
    livenessState: LivenessDetector.LivenessState,
    feedbackMessage: String,
    isVerifying: Boolean
) {
    // Current time ticker
    var currentTimeString by remember { mutableStateOf("") }
    LaunchedEffect(Unit) {
        val formatter = SimpleDateFormat("EEE, MMM dd • hh:mm:ss a", Locale.getDefault())
        while (true) {
            currentTimeString = formatter.format(Date())
            delay(1000)
        }
    }

    // Scanning laser animation
    val infiniteTransition = rememberInfiniteTransition(label = "scanner")
    val scanProgress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scan_laser"
    )

    // Outline color based on state
    val guideColor = when {
        isVerifying -> MaterialTheme.colorScheme.tertiary
        livenessState == LivenessDetector.LivenessState.LIVENESS_CONFIRMED -> MaterialTheme.colorScheme.tertiary
        livenessState == LivenessDetector.LivenessState.BLINK_OR_SMILE_CHALLENGE -> MaterialTheme.colorScheme.secondary
        livenessState == LivenessDetector.LivenessState.ALIGN_HEAD_STRAIGHT -> MaterialTheme.colorScheme.error
        else -> Color.White.copy(alpha = 0.5f)
    }

    Box(modifier = modifier.fillMaxSize()) {

        // Canvas overlay with cutout oval guide and animated laser scan
        Canvas(modifier = Modifier.fillMaxSize()) {
            val canvasWidth = size.width
            val canvasHeight = size.height

            // Calculate oval dimensions centered on screen
            val ovalWidth = canvasWidth * 0.65f
            val ovalHeight = canvasHeight * 0.50f
            val left = (canvasWidth - ovalWidth) / 2f
            val top = (canvasHeight - ovalHeight) / 2.3f

            // Outer dark vignette tint
            drawRect(
                color = Color.Black.copy(alpha = 0.45f),
                size = size
            )

            // Draw oval guide border
            drawOval(
                color = guideColor,
                topLeft = Offset(left, top),
                size = Size(ovalWidth, ovalHeight),
                style = Stroke(
                    width = 4.dp.toPx(),
                    pathEffect = if (livenessState == LivenessDetector.LivenessState.SEARCHING_FACE) {
                        PathEffect.dashPathEffect(floatArrayOf(30f, 15f), 0f)
                    } else null
                )
            )

            // Corner alignment brackets
            val bracketLength = 40.dp.toPx()
            val bracketStroke = 5.dp.toPx()

            // Top-left
            drawLine(guideColor, Offset(left - 10, top + bracketLength), Offset(left - 10, top - 10), bracketStroke)
            drawLine(guideColor, Offset(left - 10, top - 10), Offset(left + bracketLength, top - 10), bracketStroke)

            // Top-right
            val right = left + ovalWidth
            drawLine(guideColor, Offset(right + 10, top + bracketLength), Offset(right + 10, top - 10), bracketStroke)
            drawLine(guideColor, Offset(right + 10, top - 10), Offset(right - bracketLength, top - 10), bracketStroke)

            // Bottom-left
            val bottom = top + ovalHeight
            drawLine(guideColor, Offset(left - 10, bottom - bracketLength), Offset(left - 10, bottom + 10), bracketStroke)
            drawLine(guideColor, Offset(left - 10, bottom + 10), Offset(left + bracketLength, bottom + 10), bracketStroke)

            // Bottom-right
            drawLine(guideColor, Offset(right + 10, bottom - bracketLength), Offset(right + 10, bottom + 10), bracketStroke)
            drawLine(guideColor, Offset(right + 10, bottom + 10), Offset(right - bracketLength, bottom + 10), bracketStroke)

            // Dynamic Scanning Line if active
            if (livenessState != LivenessDetector.LivenessState.SEARCHING_FACE || isVerifying) {
                val laserY = top + (ovalHeight * scanProgress)
                drawLine(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            Color.Transparent,
                            guideColor.copy(alpha = 0.8f),
                            guideColor,
                            guideColor.copy(alpha = 0.8f),
                            Color.Transparent
                        ),
                        startX = left,
                        endX = right
                    ),
                    start = Offset(left, laserY),
                    end = Offset(right, laserY),
                    strokeWidth = 3.dp.toPx()
                )
            }
        }

        // Top Kiosk Header (School Branding)
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 28.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surface.copy(alpha = 0.88f),
                tonalElevation = 6.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            shape = CircleShape,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(42.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.School,
                                    contentDescription = "School Logo",
                                    tint = MaterialTheme.colorScheme.onPrimary,
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = tenantConfig.schoolName,
                                style = MaterialTheme.typography.titleLarge,
                                color = MaterialTheme.colorScheme.onSurface,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "${tenantConfig.kioskName} • Unattended Kiosk",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                            )
                        }
                    }

                    // Kiosk mode status and Live Clock
                    Column(horizontalAlignment = Alignment.End) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "Lock Task",
                                tint = MaterialTheme.colorScheme.secondary,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "KIOSK LOCKED",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.secondary,
                                fontWeight = FontWeight.ExtraBold
                            )
                        }
                        Text(
                            text = currentTimeString,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }

        // Bottom Real-Time Instruction & Status Pill
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 44.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                shape = RoundedCornerShape(32.dp),
                color = when {
                    isVerifying -> MaterialTheme.colorScheme.primary.copy(alpha = 0.95f)
                    livenessState == LivenessDetector.LivenessState.ALIGN_HEAD_STRAIGHT -> MaterialTheme.colorScheme.error.copy(alpha = 0.95f)
                    livenessState == LivenessDetector.LivenessState.BLINK_OR_SMILE_CHALLENGE -> MaterialTheme.colorScheme.secondary.copy(alpha = 0.95f)
                    livenessState == LivenessDetector.LivenessState.LIVENESS_CONFIRMED -> MaterialTheme.colorScheme.tertiary.copy(alpha = 0.95f)
                    else -> MaterialTheme.colorScheme.surface.copy(alpha = 0.90f)
                },
                shadowElevation = 8.dp,
                modifier = Modifier.padding(horizontal = 24.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 28.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Face,
                        contentDescription = "Face Status",
                        tint = when {
                            livenessState == LivenessDetector.LivenessState.BLINK_OR_SMILE_CHALLENGE -> Color.Black
                            else -> Color.White
                        },
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = if (isVerifying) "Verifying with School Cloud..." else feedbackMessage,
                        style = MaterialTheme.typography.titleMedium,
                        color = when {
                            livenessState == LivenessDetector.LivenessState.BLINK_OR_SMILE_CHALLENGE -> Color.Black
                            else -> Color.White
                        },
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = "Zero-Persistence Biometric Processing • Secure In-Memory Verification",
                style = MaterialTheme.typography.labelSmall,
                color = Color.White.copy(alpha = 0.6f)
            )
        }
    }
}
