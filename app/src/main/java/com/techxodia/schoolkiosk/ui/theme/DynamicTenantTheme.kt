package com.techxodia.schoolkiosk.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import com.techxodia.schoolkiosk.data.model.TenantConfig

fun parseHexColor(hexString: String, fallback: Color): Color {
    return try {
        val cleanHex = hexString.removePrefix("#").trim()
        val colorInt = when (cleanHex.length) {
            6 -> (0xFF000000 or cleanHex.toLong(16)).toInt()
            8 -> cleanHex.toLong(16).toInt()
            else -> return fallback
        }
        Color(colorInt)
    } catch (e: Exception) {
        fallback
    }
}

fun createTenantColorScheme(tenantConfig: TenantConfig, isDark: Boolean = true): ColorScheme {
    val primary = parseHexColor(tenantConfig.primaryColor, Color(0xFF1E3A8A))
    val accent = parseHexColor(tenantConfig.accentColor, Color(0xFFF59E0B))

    return if (isDark) {
        darkColorScheme(
            primary = primary,
            secondary = accent,
            tertiary = Color(0xFF10B981), // Emerald Success
            background = Color(0xFF0F172A), // Slate 900
            surface = Color(0xFF1E293B), // Slate 800
            surfaceVariant = Color(0xFF334155),
            onPrimary = Color.White,
            onSecondary = Color.Black,
            onBackground = Color(0xFFF8FAFC),
            onSurface = Color(0xFFF8FAFC),
            error = Color(0xFFEF4444)
        )
    } else {
        lightColorScheme(
            primary = primary,
            secondary = accent,
            tertiary = Color(0xFF059669),
            background = Color(0xFFF8FAFC),
            surface = Color.White,
            surfaceVariant = Color(0xFFE2E8F0),
            onPrimary = Color.White,
            onSecondary = Color.Black,
            onBackground = Color(0xFF0F172A),
            onSurface = Color(0xFF0F172A),
            error = Color(0xFFDC2626)
        )
    }
}

val KioskTypography = Typography(
    headlineLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp,
        letterSpacing = 0.sp
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 24.sp,
        letterSpacing = 0.15.sp
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 20.sp,
        letterSpacing = 0.15.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp,
        letterSpacing = 0.5.sp
    ),
    labelLarge = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 14.sp,
        letterSpacing = 1.25.sp
    )
)

@Composable
fun DynamicTenantTheme(
    tenantConfig: TenantConfig,
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = createTenantColorScheme(tenantConfig, isDark = darkTheme)

    MaterialTheme(
        colorScheme = colorScheme,
        typography = KioskTypography,
        content = content
    )
}
