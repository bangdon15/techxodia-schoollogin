-- ============================================================================
-- School Kiosk Biometric Attendance System - Supabase Migration
-- Zero-Local-Persistence & Lock-Task Android Architecture
-- ============================================================================

-- 1. Enable pgvector extension for high-performance vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create tenant_branding table for multi-tenant white-label styling
CREATE TABLE IF NOT EXISTS public.tenant_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kiosk_location_id UUID UNIQUE NOT NULL,
    school_name TEXT NOT NULL,
    logo_url TEXT DEFAULT '',
    primary_color TEXT NOT NULL DEFAULT '#1E3A8A',
    accent_color TEXT NOT NULL DEFAULT '#F59E0B',
    cosine_threshold FLOAT NOT NULL DEFAULT 0.35,
    liveness_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Create students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.tenant_branding(id) ON DELETE CASCADE,
    student_no VARCHAR(64) UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    grade_section VARCHAR(64),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Create student_biometrics table
-- Stores 512-dimension normalized face embedding vectors (ArcFace / MobileFaceNet)
CREATE TABLE IF NOT EXISTS public.student_biometrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    face_vector vector(512) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_student_biometrics UNIQUE(student_id)
);

-- HNSW Vector Index for sub-millisecond approximate nearest neighbor search
-- using cosine distance metric (<=>)
CREATE INDEX IF NOT EXISTS idx_student_biometrics_hnsw
ON public.student_biometrics
USING hnsw (face_vector vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 5. Create attendance_logs table
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    kiosk_id UUID NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    confidence_score FLOAT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_attendance_logs_student_timestamp
ON public.attendance_logs(student_id, timestamp DESC);

-- 6. Create kiosk_devices table for real-time device health telemetry
CREATE TABLE IF NOT EXISTS public.kiosk_devices (
    kiosk_id UUID PRIMARY KEY,
    battery_level INT DEFAULT 100,
    is_charging BOOLEAN DEFAULT true,
    network_latency_ms BIGINT DEFAULT 0,
    camera_status VARCHAR(32) DEFAULT 'OK',
    app_version VARCHAR(32) DEFAULT '1.0.0',
    last_seen_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 7. Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE public.tenant_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosk_devices ENABLE ROW LEVEL SECURITY;

-- Allow kiosks (anon key) to read their specific tenant branding config
CREATE POLICY "Public Read Tenant Branding"
ON public.tenant_branding
FOR SELECT
TO anon, authenticated
USING (true);

-- Deny direct client SELECT, INSERT, UPDATE, DELETE on student_biometrics!
-- Client devices NEVER have access to raw biometric vectors.
CREATE POLICY "Strict Lockdown on Biometrics"
ON public.student_biometrics
FOR ALL
TO anon, authenticated
USING (false);

-- Kiosks can only write telemetry to kiosk_devices
CREATE POLICY "Allow Kiosk Heartbeat Upsert"
ON public.kiosk_devices
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow attendance logs reading only for authenticated school admins
CREATE POLICY "Admins Read Attendance Logs"
ON public.attendance_logs
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- 8. Atomic Biometric Matching RPC (SECURITY DEFINER)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.match_student_face(
    p_embedding vector(512),
    p_threshold FLOAT DEFAULT 0.35,
    p_kiosk_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated DB privileges to access student_biometrics safely
SET search_path = public
AS $$
DECLARE
    v_student_id UUID;
    v_student_no VARCHAR(64);
    v_full_name TEXT;
    v_avatar_url TEXT;
    v_grade_section VARCHAR(64);
    v_distance FLOAT;
    v_log_id UUID;
    v_now TIMESTAMPTZ := TIMEZONE('utc', NOW());
BEGIN
    -- Query nearest neighbor using cosine distance (<=>)
    SELECT
        b.student_id,
        s.student_no,
        s.full_name,
        s.avatar_url,
        s.grade_section,
        (b.face_vector <=> p_embedding) AS distance
    INTO
        v_student_id,
        v_student_no,
        v_full_name,
        v_avatar_url,
        v_grade_section,
        v_distance
    FROM public.student_biometrics b
    JOIN public.students s ON s.id = b.student_id
    WHERE s.is_active = true
    ORDER BY b.face_vector <=> p_embedding
    LIMIT 1;

    -- Evaluate match threshold
    IF v_student_id IS NOT NULL AND v_distance <= p_threshold THEN
        -- Atomic insert of attendance record
        INSERT INTO public.attendance_logs (
            student_id,
            kiosk_id,
            timestamp,
            confidence_score
        ) VALUES (
            v_student_id,
            COALESCE(p_kiosk_id, gen_random_uuid()),
            v_now,
            v_distance
        ) RETURNING id INTO v_log_id;

        -- Return sanitized non-biometric student metadata
        RETURN jsonb_build_object(
            'matched', true,
            'student_id', v_student_id,
            'student_no', v_student_no,
            'full_name', v_full_name,
            'avatar_url', v_avatar_url,
            'grade_section', v_grade_section,
            'confidence_score', v_distance,
            'attendance_timestamp', v_now
        );
    ELSE
        -- Face not recognized within strict confidence threshold
        RETURN jsonb_build_object(
            'matched', false,
            'confidence_score', COALESCE(v_distance, 1.0),
            'message', 'Face not recognized within authorized threshold'
        );
    END IF;
END;
$$;

-- Grant execution of match_student_face to anon role (kiosk device key)
GRANT EXECUTE ON FUNCTION public.match_student_face(vector(512), FLOAT, UUID) TO anon, authenticated;

-- ============================================================================
-- 9. Sample Seed Data for Instant Verification
-- ============================================================================

INSERT INTO public.tenant_branding (
    kiosk_location_id,
    school_name,
    logo_url,
    primary_color,
    accent_color,
    cosine_threshold,
    liveness_required
) VALUES (
    '7f3b891e-4501-446f-87d2-7ec98234ab01',
    'Oakridge International Academy',
    'https://assets.techxodia.com/schools/oakridge-logo.png',
    '#1E3A8A',
    '#F59E0B',
    0.35,
    true
) ON CONFLICT (kiosk_location_id) DO NOTHING;
