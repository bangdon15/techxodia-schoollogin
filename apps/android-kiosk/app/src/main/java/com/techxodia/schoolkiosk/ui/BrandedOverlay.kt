package com.techxodia.schoolkiosk.ui

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Icon
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.techxodia.schoolkiosk.data.KioskConfig
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun BrandedOverlay(
    config: KioskConfig,
    statusMessage: String,
    isVerifying: Boolean,
    isUnrecognized: Boolean,
    onSwitchGate: () -> Unit = {},
    onOpenFailSafe: () -> Unit = {}
) {
    var currentTime by remember { mutableStateOf("") }
    LaunchedEffect(Unit) {
        val fmt = SimpleDateFormat("EEE, MMM dd • hh:mm:ss a", Locale.getDefault())
        while (true) {
            currentTime = fmt.format(Date())
            delay(1000)
        }
    }

    val transition = rememberInfiniteTransition(label = "laser")
    val laserProgress by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(2000, easing = FastOutSlowInEasing), RepeatMode.Reverse),
        label = "laser_y"
    )

    val guideColor = when {
        isUnrecognized -> Color(0xFFEF4444)
        isVerifying -> Color(0xFF10B981)
        else -> Color(0xFFF59E0B)
    }

    Box(modifier = Modifier.fillMaxSize()) {
        // Oval Guide Canvas with Laser
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height
            val ovalW = w * 0.65f
            val ovalH = h * 0.52f
            val left = (w - ovalW) / 2f
            val top = (h - ovalH) / 2.3f

            drawRect(color = Color.Black.copy(alpha = 0.40f), size = size)

            drawOval(
                color = guideColor,
                topLeft = Offset(left, top),
                size = Size(ovalW, ovalH),
                style = Stroke(width = 4.dp.toPx())
            )

            // Scanning Laser Line
            val laserY = top + (ovalH * laserProgress)
            drawLine(
                brush = Brush.horizontalGradient(
                    colors = listOf(Color.Transparent, guideColor, Color.Transparent),
                    startX = left,
                    endX = left + ovalW
                ),
                start = Offset(left, laserY),
                end = Offset(left + ovalW, laserY),
                strokeWidth = 3.dp.toPx()
            )
        }

        // Top Header HUD Bar
        Column(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth()
                .padding(24.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color(0xFF0F172A).copy(alpha = 0.90f),
                tonalElevation = 8.dp,
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
                        Surface(shape = CircleShape, color = Color(0xFF1E3A8A), modifier = Modifier.size(42.dp)) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(Icons.Default.School, contentDescription = "Logo", tint = Color.White)
                            }
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(text = config.schoolName, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .clickable { onSwitchGate() }
                                    .padding(vertical = 2.dp)
                            ) {
                                Text(
                                    text = "${config.deviceName} • ${config.locationTag}",
                                    color = Color(0xFF38BDF8),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Surface(
                                    shape = RoundedCornerShape(4.dp),
                                    color = Color(0xFF1E293B)
                                ) {
                                    Text(
                                        text = "Switch Gate",
                                        color = Color.LightGray,
                                        fontSize = 9.sp,
                                        modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Lock, contentDescription = "Lock", tint = Color(0xFFF59E0B), modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = "KIOSK LOCKED", color = Color(0xFFF59E0B), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                        Text(text = currentTime, color = Color.White, fontSize = 12.sp)
                    }
                }
            }
        }

        // Bottom Status Pill & Fail-Safe Shortcut
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                shape = RoundedCornerShape(32.dp),
                color = if (isUnrecognized) Color(0xFFEF4444) else Color(0xFF1E293B).copy(alpha = 0.95f),
                shadowElevation = 8.dp,
                modifier = Modifier.clickable {
                    if (isUnrecognized) onOpenFailSafe()
                }
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = if (isUnrecognized) Icons.Default.Key else Icons.Default.Face,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = if (isUnrecognized) "$statusMessage • Tap for PIN" else statusMessage,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Discrete Fail-Safe Button (always accessible)
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color.Black.copy(alpha = 0.6f),
                modifier = Modifier
                    .clickable { onOpenFailSafe() }
                    .padding(horizontal = 12.dp, vertical = 4.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Icon(Icons.Default.Key, contentDescription = "PIN", tint = Color(0xFFF59E0B), modifier = Modifier.size(14.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "Face not scanning? Enter 4-Digit PIN", color = Color(0xFFFCD34D), fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                }
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(text = "Zero-Persistence Biometric Processing • Secure Cloud Verification", color = Color.White.copy(alpha = 0.5f), fontSize = 11.sp)
        }
    }
}
