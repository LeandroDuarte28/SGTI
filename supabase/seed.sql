-- ============================================================================
-- SGTI — Development Seed Data
-- Environment: Development / Staging ONLY
-- NEVER run this in production.
-- ============================================================================

-- NOTE: User profiles are created automatically by the handle_new_user() trigger
-- when a real Google OAuth login occurs. The seed below is for local dev only,
-- where we insert mock users directly into auth.users.

-- ─── Mock Users (local dev only) ─────────────────────────────────────────────
-- In production, all users come from Google OAuth.

-- Admin user
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@sgti.local',
    '{"full_name": "Administrador SGTI", "avatar_url": null, "sub": "google-admin-001"}'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- IT Manager user
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000002',
    'manager@sgti.local',
    '{"full_name": "Gerente de TI", "avatar_url": null, "sub": "google-manager-001"}'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- IT Analyst user
INSERT INTO auth.users (id, email, raw_user_meta_data, created_at, updated_at)
VALUES (
    'a0000000-0000-0000-0000-000000000003',
    'analyst@sgti.local',
    '{"full_name": "Analista de TI", "avatar_url": null, "sub": "google-analyst-001"}'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Assign elevated roles (END_USER already assigned by trigger)
INSERT INTO shared."UserRole" (user_id, role)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'SUPER_ADMIN'),
    ('a0000000-0000-0000-0000-000000000002', 'IT_MANAGER'),
    ('a0000000-0000-0000-0000-000000000003', 'IT_ANALYST')
ON CONFLICT (user_id, role) DO NOTHING;

-- Update department info for seed users
UPDATE shared."UserProfile"
SET department = 'Tecnologia da Informação', job_title = 'Administrador do Sistema'
WHERE id = 'a0000000-0000-0000-0000-000000000001';

UPDATE shared."UserProfile"
SET department = 'Tecnologia da Informação', job_title = 'Gerente de TI'
WHERE id = 'a0000000-0000-0000-0000-000000000002';

UPDATE shared."UserProfile"
SET department = 'Tecnologia da Informação', job_title = 'Analista de TI Sênior'
WHERE id = 'a0000000-0000-0000-0000-000000000003';
