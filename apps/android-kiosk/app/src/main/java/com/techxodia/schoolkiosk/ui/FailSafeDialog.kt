package com.techxodia.schoolkiosk.ui

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Backspace
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.techxodia.schoolkiosk.data.StudentPreviewData

enum class FailSafeTab {
    ATM_ID_PIN,
    QR_PASS,
    FRONT_DESK
}

enum class AtmStep {
    ENTER_ID,
    ENTER_PIN
}

@Composable
fun FailSafeDialog(
    promptMessage: String = "Face not recognized. Use Two-Factor ID or QR Pass:",
    isVerifying: Boolean = false,
    errorMessage: String? = null,
    previewStudent: StudentPreviewData? = null,
    onLookupId: (idNumber: String) -> Unit = {},
    onSubmitIdAndPin: (studentOrEmpId: String, pin: String) -> Unit,
    onSubmitQrPass: (qrCode: String) -> Unit = {},
    onRetryFaceScan: () -> Unit,
    onDismiss: () -> Unit
) {
    var activeTab by remember { mutableStateOf(FailSafeTab.ATM_ID_PIN) }
    var currentAtmStep by remember { mutableStateOf(AtmStep.ENTER_ID) }
    var enteredId by remember { mutableStateOf("") }
    var enteredPin by remember { mutableStateOf("") }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.85f)),
        contentAlignment = Alignment.Center
    ) {
        AnimatedVisibility(
            visible = true,
            enter = fadeIn() + scaleIn()
        ) {
            Card(
                shape = RoundedCornerShape(32.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
                elevation = CardDefaults.cardElevation(defaultElevation = 28.dp),
                modifier = Modifier
                    .fillMaxWidth(0.88f)
                    .border(2.5.dp, Color(0xFFF59E0B), RoundedCornerShape(32.dp))
            ) {
                Column(
                    modifier = Modifier.padding(26.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Header Bar with Tab Switcher & Close Button
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Surface(
                                shape = CircleShape,
                                color = Color(0xFFF59E0B).copy(alpha = 0.2f),
                                modifier = Modifier.size(42.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        imageVector = Icons.Default.Shield,
                                        contentDescription = "Security",
                                        tint = Color(0xFFF59E0B),
                                        modifier = Modifier.size(24.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column {
                                Text(
                                    text = "CAMPUS FAIL-SAFE HUB",
                                    color = Color(0xFFF59E0B),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 1.2.sp
                                )
                                Text(
                                    text = "10K+ Scalable Zero-Collision Verification",
                                    color = Color.White,
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.ExtraBold
                                )
                            }
                        }

                        Surface(
                            shape = CircleShape,
                            color = Color.White.copy(alpha = 0.1f),
                            modifier = Modifier
                                .size(36.dp)
                                .clickable { onDismiss() }
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Close",
                                    tint = Color.LightGray,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    // Mode Navigation Pills
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFF1E293B), RoundedCornerShape(16.dp))
                            .padding(4.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        // Tab 1: ATM ID + PIN
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (activeTab == FailSafeTab.ATM_ID_PIN) Color(0xFFF59E0B) else Color.Transparent,
                            modifier = Modifier
                                .weight(1f)
                                .clickable { activeTab = FailSafeTab.ATM_ID_PIN }
                        ) {
                            Row(
                                modifier = Modifier.padding(vertical = 9.dp),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Key,
                                    contentDescription = null,
                                    tint = if (activeTab == FailSafeTab.ATM_ID_PIN) Color(0xFF0F172A) else Color.LightGray,
                                    modifier = Modifier.size(15.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "ID + PIN (ATM)",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (activeTab == FailSafeTab.ATM_ID_PIN) Color(0xFF0F172A) else Color.LightGray
                                )
                            }
                        }

                        // Tab 2: Digital QR Pass
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (activeTab == FailSafeTab.QR_PASS) Color(0xFF38BDF8) else Color.Transparent,
                            modifier = Modifier
                                .weight(1f)
                                .clickable { activeTab = FailSafeTab.QR_PASS }
                        ) {
                            Row(
                                modifier = Modifier.padding(vertical = 9.dp),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.QrCodeScanner,
                                    contentDescription = null,
                                    tint = if (activeTab == FailSafeTab.QR_PASS) Color(0xFF0F172A) else Color.LightGray,
                                    modifier = Modifier.size(15.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Digital QR Pass",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (activeTab == FailSafeTab.QR_PASS) Color(0xFF0F172A) else Color.LightGray
                                )
                            }
                        }

                        // Tab 3: Front Desk Help
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = if (activeTab == FailSafeTab.FRONT_DESK) Color(0xFF10B981) else Color.Transparent,
                            modifier = Modifier
                                .weight(1f)
                                .clickable { activeTab = FailSafeTab.FRONT_DESK }
                        ) {
                            Row(
                                modifier = Modifier.padding(vertical = 9.dp),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = null,
                                    tint = if (activeTab == FailSafeTab.FRONT_DESK) Color(0xFF0F172A) else Color.LightGray,
                                    modifier = Modifier.size(15.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Front Desk",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (activeTab == FailSafeTab.FRONT_DESK) Color(0xFF0F172A) else Color.LightGray
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Error Message Banner (if any)
                    if (!errorMessage.isNullOrBlank()) {
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = Color(0xFFEF4444).copy(alpha = 0.15f),
                            border = BorderStroke(1.dp, Color(0xFFEF4444)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = errorMessage,
                                color = Color(0xFFFCA5A5),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                    }

                    // Content Body based on Active Tab
                    when (activeTab) {
                        FailSafeTab.ATM_ID_PIN -> {
                            AtmModeView(
                                currentStep = currentAtmStep,
                                enteredId = enteredId,
                                enteredPin = enteredPin,
                                isVerifying = isVerifying,
                                previewStudent = previewStudent,
                                onIdChange = { newId ->
                                    enteredId = newId
                                    if (newId.length >= 3) {
                                        onLookupId(newId)
                                    }
                                },
                                onPinChange = { newPin ->
                                    enteredPin = newPin
                                    if (newPin.length == 4) {
                                        onSubmitIdAndPin(enteredId, newPin)
                                    }
                                },
                                onNextToPin = {
                                    if (enteredId.isNotBlank()) {
                                        currentAtmStep = AtmStep.ENTER_PIN
                                    }
                                },
                                onBackToId = {
                                    currentAtmStep = AtmStep.ENTER_ID
                                    enteredPin = ""
                                }
                            )
                        }

                        FailSafeTab.QR_PASS -> {
                            QrPassModeView(
                                onSubmitQr = onSubmitQrPass
                            )
                        }

                        FailSafeTab.FRONT_DESK -> {
                            FrontDeskHelpView(
                                onRetryFaceScan = onRetryFaceScan
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Bottom Row: "Retry Face Scan" pill
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = Color.White.copy(alpha = 0.08f),
                        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.2f)),
                        modifier = Modifier
                            .fillMaxWidth(0.65f)
                            .clickable { onRetryFaceScan() }
                    ) {
                        Row(
                            modifier = Modifier.padding(vertical = 10.dp),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Retry",
                                tint = Color.LightGray,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Return to Face Scanner",
                                color = Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * Tab 1: ATM-Style Two-Step Verification (Option 1)
 * Step 1: Unique Student/Employee ID -> Step 2: 4-Digit Security PIN
 */
@Composable
private fun AtmModeView(
    currentStep: AtmStep,
    enteredId: String,
    enteredPin: String,
    isVerifying: Boolean,
    previewStudent: StudentPreviewData?,
    onIdChange: (String) -> Unit,
    onPinChange: (String) -> Unit,
    onNextToPin: () -> Unit,
    onBackToId: () -> Unit
) {
    AnimatedContent(
        targetState = currentStep,
        transitionSpec = { fadeIn() togetherWith fadeOut() },
        label = "atm_step"
    ) { step ->
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (step == AtmStep.ENTER_ID) {
                // STEP 1: Enter Student / Staff ID
                Text(
                    text = "STEP 1 OF 2: ENTER YOUR STUDENT / STAFF ID NUMBER",
                    color = Color(0xFFF59E0B),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Each student and employee has a unique permanent ID number",
                    color = Color.Gray,
                    fontSize = 12.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Quick Prefix Chips for instant 1-tap typing
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(bottom = 12.dp)
                ) {
                    listOf("TEST", "STU-", "EMP-", "FAC-").forEach { prefix ->
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFF1E293B),
                            border = BorderStroke(1.dp, Color(0xFF334155)),
                            modifier = Modifier.clickable {
                                if (!enteredId.startsWith(prefix)) {
                                    onIdChange(prefix)
                                }
                            }
                        ) {
                            Text(
                                text = prefix,
                                color = Color(0xFF38BDF8),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                            )
                        }
                    }
                }

                // ID Display Box
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0xFF020617),
                    border = BorderStroke(1.5.dp, Color(0xFF38BDF8)),
                    modifier = Modifier.fillMaxWidth(0.75f)
                ) {
                    Box(
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = if (enteredId.isEmpty()) "e.g. TEST1234 or 1042" else enteredId,
                            color = if (enteredId.isEmpty()) Color.DarkGray else Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 2.sp
                        )
                    }
                }

                // Live Preview Banner if Student Found
                if (previewStudent != null) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color(0xFF10B981).copy(alpha = 0.15f),
                        border = BorderStroke(1.dp, Color(0xFF10B981)),
                        modifier = Modifier.fillMaxWidth(0.75f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null, tint = Color(0xFF10B981), modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Found: ${previewStudent.firstName} ${previewStudent.lastName} (${previewStudent.gradeSection})",
                                color = Color(0xFFA7F3D0),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Numeric Keypad for ID entry
                KeypadGrid(
                    onKeyPress = { k ->
                        when (k) {
                            "CLEAR" -> onIdChange("")
                            "DEL" -> if (enteredId.isNotEmpty()) onIdChange(enteredId.dropLast(1))
                            else -> onIdChange(enteredId + k)
                        }
                    }
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Next Button
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = if (enteredId.isNotBlank()) Color(0xFFF59E0B) else Color(0xFF334155),
                    modifier = Modifier
                        .fillMaxWidth(0.75f)
                        .clickable(enabled = enteredId.isNotBlank()) { onNextToPin() }
                ) {
                    Row(
                        modifier = Modifier.padding(vertical = 12.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Next: Enter Security PIN",
                            color = if (enteredId.isNotBlank()) Color(0xFF0F172A) else Color.Gray,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Icon(
                            imageVector = Icons.Default.ArrowForward,
                            contentDescription = "Next",
                            tint = if (enteredId.isNotBlank()) Color(0xFF0F172A) else Color.Gray,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            } else {
                // STEP 2: Enter 4-Digit Security PIN
                Row(
                    modifier = Modifier.fillMaxWidth(0.75f),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0xFF1E293B),
                        modifier = Modifier.clickable { onBackToId() }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.LightGray, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(text = "Change ID", color = Color.LightGray, fontSize = 11.sp)
                        }
                    }

                    Text(
                        text = "ID: $enteredId",
                        color = Color(0xFF38BDF8),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "STEP 2 OF 2: ENTER YOUR 4-DIGIT SECURITY PIN",
                    color = Color(0xFFF59E0B),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Confirms you are the authorized owner of ID '$enteredId'",
                    color = Color.Gray,
                    fontSize = 12.sp
                )

                Spacer(modifier = Modifier.height(18.dp))

                // 4 PIN Dots Display
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    for (i in 0 until 4) {
                        val isFilled = i < enteredPin.length
                        Surface(
                            shape = CircleShape,
                            color = if (isFilled) Color(0xFFF59E0B) else Color(0xFF1E293B),
                            border = BorderStroke(1.5.dp, if (isFilled) Color(0xFFF59E0B) else Color.Gray.copy(alpha = 0.5f)),
                            modifier = Modifier.size(24.dp)
                        ) {}
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                if (isVerifying) {
                    CircularProgressIndicator(color = Color(0xFFF59E0B), modifier = Modifier.size(40.dp))
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(text = "Verifying ID + PIN & recalibrating biometrics...", color = Color.LightGray, fontSize = 12.sp)
                } else {
                    KeypadGrid(
                        onKeyPress = { k ->
                            when (k) {
                                "CLEAR" -> onPinChange("")
                                "DEL" -> if (enteredPin.isNotEmpty()) onPinChange(enteredPin.dropLast(1))
                                else -> if (enteredPin.length < 4) onPinChange(enteredPin + k)
                            }
                        }
                    )
                }
            }
        }
    }
}

/**
 * Tab 2: Instant Digital QR Pass Mode
 */
@Composable
private fun QrPassModeView(
    onSubmitQr: (String) -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp)
    ) {
        Surface(
            shape = CircleShape,
            color = Color(0xFF38BDF8).copy(alpha = 0.15f),
            modifier = Modifier.size(68.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = Icons.Default.QrCodeScanner,
                    contentDescription = "QR Scanner",
                    tint = Color(0xFF38BDF8),
                    modifier = Modifier.size(38.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = "DIGITAL PASS INSTANT SCANNER",
            color = Color(0xFF38BDF8),
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "Hold your student/faculty QR Pass or printed school badge up to the front camera. The system will detect and log your attendance in ~0.2s.",
            color = Color.LightGray,
            fontSize = 12.sp,
            lineHeight = 18.sp,
            modifier = Modifier.fillMaxWidth(0.85f)
        )

        Spacer(modifier = Modifier.height(18.dp))

        Surface(
            shape = RoundedCornerShape(14.dp),
            color = Color(0xFF1E293B),
            border = BorderStroke(1.dp, Color(0xFF38BDF8).copy(alpha = 0.5f)),
            modifier = Modifier.fillMaxWidth(0.85f)
        ) {
            Column(modifier = Modifier.padding(14.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "Demo Pass QR Codes:",
                    color = Color.Gray,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("TEST1234", "EMP-1042", "STU-2026-0891").forEach { demoId ->
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = Color(0xFF0F172A),
                            modifier = Modifier.clickable {
                                onSubmitQr(demoId)
                            }
                        ) {
                            Text(
                                text = "Scan $demoId",
                                color = Color(0xFF38BDF8),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * Tab 3: Front Desk Assistance
 */
@Composable
private fun FrontDeskHelpView(
    onRetryFaceScan: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp)
    ) {
        Surface(
            shape = CircleShape,
            color = Color(0xFF10B981).copy(alpha = 0.15f),
            modifier = Modifier.size(68.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "Staff",
                    tint = Color(0xFF10B981),
                    modifier = Modifier.size(38.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = "FRONT DESK & VISITOR REGISTRAR",
            color = Color(0xFF10B981),
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "If you have lost your ID number or haven't registered your face yet, please visit the North Wing Security Office for manual override or token assistance.",
            color = Color.LightGray,
            fontSize = 12.sp,
            lineHeight = 18.sp,
            modifier = Modifier.fillMaxWidth(0.85f)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Surface(
            shape = RoundedCornerShape(12.dp),
            color = Color(0xFF1E293B),
            modifier = Modifier.fillMaxWidth(0.85f)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(text = "Security Dispatch: +1 (555) 019-2834", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                Text(text = "Registrar Hours: 07:00 AM – 05:00 PM", color = Color.Gray, fontSize = 11.sp)
            }
        }
    }
}

@Composable
private fun KeypadGrid(
    onKeyPress: (String) -> Unit
) {
    val rows = listOf(
        listOf("1", "2", "3"),
        listOf("4", "5", "6"),
        listOf("7", "8", "9"),
        listOf("CLEAR", "0", "DEL")
    )

    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth(0.75f)
    ) {
        for (row in rows) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                for (key in row) {
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = when (key) {
                            "CLEAR" -> Color(0xFF334155)
                            "DEL" -> Color(0xFF334155)
                            else -> Color(0xFF1E293B)
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .clickable { onKeyPress(key) }
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            if (key == "DEL") {
                                Icon(
                                    imageVector = Icons.Default.Backspace,
                                    contentDescription = "Delete",
                                    tint = Color.LightGray,
                                    modifier = Modifier.size(18.dp)
                                )
                            } else {
                                Text(
                                    text = key,
                                    color = Color.White,
                                    fontSize = if (key == "CLEAR") 10.sp else 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
