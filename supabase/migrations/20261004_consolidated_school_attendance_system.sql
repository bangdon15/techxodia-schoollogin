-- ============================================================================
-- Techxodia School Attendance & Identity System - Supabase Schema
-- Unified Backend for Next.js Web Admin & Android Lock-Task Kiosk
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Clean existing enum types if re-running
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_type') THEN
        CREATE TYPE user_role_type AS ENUM ('super_admin', 'school_admin', 'staff', 'student');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_direction_type') THEN
        CREATE TYPE attendance_direction_type AS ENUM ('time_in', 'time_out');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status_type') THEN
        CREATE TYPE attendance_status_type AS ENUM ('on_time', 'late', 'excused');
    END IF;
END $$;

-- 3. Tenants Table (White-label styling and school identity)
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT DEFAULT '',
    theme_config JSONB NOT NULL DEFAULT '{
        "primary": "#1E3A8A",
        "secondary": "#F59E0B",
        "surface": "#1E293B",
        "accent": "#10B981",
        "fontFamily": "Inter"
    }'::jsonb,
    late_threshold_time TIME DEFAULT '08:00:00',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Kiosk Devices Table (Unattended hardware terminals)
CREATE TABLE IF NOT EXISTS public.kiosk_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    device_name TEXT NOT NULL,
    device_token TEXT UNIQUE NOT NULL, -- Scoped authentication token (or SHA-256 hash)
    location_tag TEXT NOT NULL DEFAULT 'Main Entrance',
    is_active BOOLEAN NOT NULL DEFAULT true,
    battery_level INT DEFAULT 100,
    is_charging BOOLEAN DEFAULT true,
    camera_status TEXT DEFAULT 'OK',
    last_heartbeat_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_kiosk_devices_token ON public.kiosk_devices(device_token);

-- 5. Users Table (Students, Faculty, and Administrators)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    role user_role_type NOT NULL DEFAULT 'student',
    student_or_emp_id VARCHAR(64) NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    grade_section VARCHAR(64),
    avatar_url TEXT,
    emergency_contact TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT uq_tenant_student_emp_id UNIQUE (tenant_id, student_or_emp_id)
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_role ON public.users(tenant_id, role);

-- 6. User Biometrics Table (Normalized 512-dimension face embeddings)
CREATE TABLE IF NOT EXISTS public.user_biometrics (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    face_vector vector(512) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- HNSW Vector Index for sub-millisecond approximate nearest neighbor search
-- using cosine distance metric (<=>)
CREATE INDEX IF NOT EXISTS idx_user_biometrics_hnsw
ON public.user_biometrics
USING hnsw (face_vector vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 7. Attendance Logs Table
CREATE TABLE IF NOT EXISTS public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    kiosk_id UUID NOT NULL REFERENCES public.kiosk_devices(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    confidence_score FLOAT NOT NULL,
    direction attendance_direction_type NOT NULL DEFAULT 'time_in',
    status attendance_status_type NOT NULL DEFAULT 'on_time',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_attendance_logs_tenant_timestamp
ON public.attendance_logs(tenant_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_logs_user_cooldown
ON public.attendance_logs(user_id, timestamp DESC);

-- Enable Supabase Realtime publication on attendance_logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_logs;

-- ============================================================================
-- 8. Row Level Security (RLS) Policies
-- ============================================================================

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kiosk_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- 8.1: Tenants Policies
CREATE POLICY "Public Read Active Tenants"
ON public.tenants FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admin Modify Tenants"
ON public.tenants FOR ALL
TO authenticated
USING (true);

-- 8.2: Kiosk Devices Policies
CREATE POLICY "Read Kiosks for Authenticated Admin"
ON public.kiosk_devices FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin Manage Kiosks"
ON public.kiosk_devices FOR ALL
TO authenticated
USING (true);

-- 8.3: Users Policies
CREATE POLICY "Admin Read and Manage Users"
ON public.users FOR ALL
TO authenticated
USING (true);

-- 8.4: User Biometrics STRICT Isolation
-- NO DIRECT ACCESS FOR CLIENT KEYS (Neither anon nor regular authenticated user)
CREATE POLICY "Deny Direct Client Access to Biometrics"
ON public.user_biometrics FOR ALL
TO anon, authenticated
USING (false);

-- 8.5: Attendance Logs Policies
CREATE POLICY "Admins Read Attendance Logs"
ON public.attendance_logs FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- 9. RPC: verify_and_log_attendance (SECURITY DEFINER)
-- Core Kiosk Authentication Routine
-- ============================================================================

CREATE OR REPLACE FUNCTION public.verify_and_log_attendance(
    p_device_token TEXT,
    p_face_vector vector(512),
    p_threshold FLOAT DEFAULT 0.38
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_kiosk_id UUID;
    v_tenant_id UUID;
    v_location_tag TEXT;
    v_late_time TIME;
    v_user_id UUID;
    v_student_or_emp_id VARCHAR(64);
    v_first_name TEXT;
    v_last_name TEXT;
    v_grade_section VARCHAR(64);
    v_avatar_url TEXT;
    v_distance FLOAT;
    v_last_log_time TIMESTAMPTZ;
    v_now TIMESTAMPTZ := TIMEZONE('utc', NOW());
    v_status attendance_status_type := 'on_time';
    v_new_log_id UUID;
BEGIN
    -- 1. Validate Kiosk Device Token
    SELECT id, tenant_id, location_tag
    INTO v_kiosk_id, v_tenant_id, v_location_tag
    FROM public.kiosk_devices
    WHERE device_token = p_device_token
      AND is_active = true;

    IF v_kiosk_id IS NULL THEN
        RETURN jsonb_build_object(
            'matched', false,
            'error', 'UNAUTHORIZED_KIOSK_DEVICE',
            'message', 'Kiosk device token is invalid or inactive.'
        );
    END IF;

    -- Update kiosk heartbeat timestamp
    UPDATE public.kiosk_devices
    SET last_heartbeat_at = v_now
    WHERE id = v_kiosk_id;

    -- Fetch tenant late cutoff time
    SELECT COALESCE(late_threshold_time, '08:00:00'::TIME)
    INTO v_late_time
    FROM public.tenants
    WHERE id = v_tenant_id;

    -- 2. Indexed Cosine Distance Search (<=>) scoped strictly to tenant_id
    SELECT
        b.user_id,
        u.student_or_emp_id,
        u.first_name,
        u.last_name,
        u.grade_section,
        u.avatar_url,
        (b.face_vector <=> p_face_vector) AS distance
    INTO
        v_user_id,
        v_student_or_emp_id,
        v_first_name,
        v_last_name,
        v_grade_section,
        v_avatar_url,
        v_distance
    FROM public.user_biometrics b
    JOIN public.users u ON u.id = b.user_id
    WHERE b.tenant_id = v_tenant_id
      AND u.is_active = true
    ORDER BY b.face_vector <=> p_face_vector
    LIMIT 1;

    -- 3. Check Match Confidence Threshold
    IF v_user_id IS NULL OR v_distance > p_threshold THEN
        RETURN jsonb_build_object(
            'matched', false,
            'error', 'NO_MATCH',
            'confidence_score', COALESCE(v_distance, 1.0),
            'message', 'Face not recognized within authorized threshold.'
        );
    END IF;

    -- 4. Cooldown Check (60 seconds debounce window)
    SELECT timestamp
    INTO v_last_log_time
    FROM public.attendance_logs
    WHERE user_id = v_user_id
    ORDER BY timestamp DESC
    LIMIT 1;

    IF v_last_log_time IS NOT NULL AND (v_now - v_last_log_time) < INTERVAL '60 seconds' THEN
        RETURN jsonb_build_object(
            'matched', true,
            'cooldown_active', true,
            'message', 'Attendance already recorded within the last 60 seconds.',
            'user_id', v_user_id,
            'first_name', v_first_name,
            'last_name', v_last_name,
            'student_or_emp_id', v_student_or_emp_id,
            'avatar_url', v_avatar_url,
            'grade_section', v_grade_section,
            'timestamp', v_last_log_time
        );
    END IF;

    -- 5. Calculate Status (On-Time vs Late based on local wall clock time)
    IF (v_now::TIME) > v_late_time THEN
        v_status := 'late';
    ELSE
        v_status := 'on_time';
    END IF;

    -- 6. Atomic Insert Attendance Log Entry
    INSERT INTO public.attendance_logs (
        tenant_id,
        user_id,
        kiosk_id,
        timestamp,
        confidence_score,
        direction,
        status
    ) VALUES (
        v_tenant_id,
        v_user_id,
        v_kiosk_id,
        v_now,
        v_distance,
        'time_in',
        v_status
    ) RETURNING id INTO v_new_log_id;

    -- 7. Return Verified User Summary
    RETURN jsonb_build_object(
        'matched', true,
        'cooldown_active', false,
        'attendance_id', v_new_log_id,
        'user_id', v_user_id,
        'student_or_emp_id', v_student_or_emp_id,
        'first_name', v_first_name,
        'last_name', v_last_name,
        'grade_section', v_grade_section,
        'avatar_url', v_avatar_url,
        'direction', 'time_in',
        'status', v_status,
        'location_tag', v_location_tag,
        'confidence_score', v_distance,
        'timestamp', v_now
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_and_log_attendance(TEXT, vector(512), FLOAT) TO anon, authenticated;

-- ============================================================================
-- 10. RPC: register_user_face (SECURITY DEFINER)
-- Secure Ingestion of 512D Vector from Web Admin Portal
-- ============================================================================

CREATE OR REPLACE FUNCTION public.register_user_face(
    p_user_id UUID,
    p_face_vector vector(512)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT tenant_id INTO v_tenant_id
    FROM public.users
    WHERE id = p_user_id;

    IF v_tenant_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'USER_NOT_FOUND');
    END IF;

    INSERT INTO public.user_biometrics (user_id, tenant_id, face_vector, updated_at)
    VALUES (p_user_id, v_tenant_id, p_face_vector, TIMEZONE('utc', NOW()))
    ON CONFLICT (user_id) DO UPDATE
    SET face_vector = EXCLUDED.face_vector,
        updated_at = TIMEZONE('utc', NOW());

    RETURN jsonb_build_object('success', true, 'user_id', p_user_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_user_face(UUID, vector(512)) TO authenticated;

-- ============================================================================
-- 11. Seed Initial Demo Tenant, Kiosk & Sample Students
-- ============================================================================

INSERT INTO public.tenants (
    id,
    school_name,
    slug,
    logo_url,
    theme_config,
    late_threshold_time
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Oakridge International Academy',
    'oakridge',
    'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&auto=format&fit=crop&q=80',
    '{
        "primary": "#1E3A8A",
        "secondary": "#F59E0B",
        "surface": "#0F172A",
        "accent": "#10B981"
    }'::jsonb,
    '08:00:00'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.kiosk_devices (
    id,
    tenant_id,
    device_name,
    device_token,
    location_tag,
    is_active
) VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'North Gate Tablet 01',
    'kiosk_secret_token_oakridge_north_gate',
    'North Campus Turnstiles',
    true
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (
    id,
    tenant_id,
    role,
    student_or_emp_id,
    first_name,
    last_name,
    grade_section,
    avatar_url,
    is_active
) VALUES 
(
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'student',
    'STU-2026-0891',
    'Sophia',
    'Chen',
    'Grade 11 - STEM A',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
    true
),
(
    'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'student',
    'STU-2026-0892',
    'Marcus',
    'Vance',
    'Grade 10 - Section B',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&auto=format&fit=crop&q=80',
    true
),
(
    'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'staff',
    'EMP-1042',
    'Dr. Elena',
    'Rostova',
    'Faculty of Science',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80',
    true
) ON CONFLICT DO NOTHING;
