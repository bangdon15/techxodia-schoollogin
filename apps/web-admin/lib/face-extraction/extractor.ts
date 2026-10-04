/**
 * Face extraction helper for the Web Admin Portal.
 * Interacts with /api/extract-face or the Supabase Edge Function to extract
 * a normalized 512-dimension vector from a captured webcam photo.
 */

export interface ExtractionResult {
  success: boolean;
  face_vector?: number[];
  confidence?: number;
  error?: string;
}

export async function extractFaceVectorFromBase64(
  imageBase64: string,
  userId: string
): Promise<ExtractionResult> {
  try {
    const res = await fetch("/api/extract-face", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, userId }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { success: false, error: err.error || "Extraction failed" };
    }

    const data = await res.json();
    return {
      success: true,
      face_vector: data.face_vector,
      confidence: data.confidence,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Network error during face vector extraction",
    };
  }
}
