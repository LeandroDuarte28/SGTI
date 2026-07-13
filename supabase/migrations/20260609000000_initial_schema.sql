-- ============================================================================
-- SGTI — Initial Database Schema
-- Migration: 20260609000000_initial_schema
-- Author: Arquitetura Corporativa de TI
-- Description: Creates the foundation schemas, extensions, and shared tables.
--              Module-specific tables are created in subsequent migrations.
-- ============================================================================

-- ─── Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";     -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Trigram similarity (full-text search)
CREATE EXTENSION IF NOT EXISTS "unaccent";      -- Accent-insensitive search
CREATE EXTENSION IF NOT EXISTS "btree_gist";    -- GiST index support for exclusion constraints

-- ─── Schemas (one per bounded context) ──────────────────────────────────────
-- Each module owns its schema. Cross-schema queries are prohibited by RLS policies.
CREATE SCHEMA IF NOT EXISTS shared;         -- Shared kernel: users, roles, audit, notifications
CREATE SCHEMA IF NOT EXISTS ticket;         -- Incidents, Requests, Problems
CREATE SCHEMA IF NOT EXISTS catalog;        -- Service Catalog, SLA definitions
CREATE SCHEMA IF NOT EXISTS asset;          -- ITAM: hardware, software, licenses
CREATE SCHEMA IF NOT EXISTS identity;       -- IAM: access management
CREATE SCHEMA IF NOT EXISTS compliance;     -- Compliance, policies, controls
CREATE SCHEMA IF NOT EXISTS financial;      -- OPEX, CAPEX, contracts
CREATE SCHEMA IF NOT EXISTS procurement;    -- Purchases, suppliers
CREATE SCHEMA IF NOT EXISTS project;        -- IT Projects
CREATE SCHEMA IF NOT EXISTS knowledge;      -- Knowledge Base articles

-- ─── Shared: User profile ────────────────────────────────────────────────────
-- Extends auth.users (managed by Supabase Auth) with SGTI-specific attributes.
-- One row per user — created automatically on first login via a trigger.
CREATE TABLE IF NOT EXISTS shared."UserProfile" (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email           TEXT NOT NULL UNIQUE,
    full_name       TEXT NOT NULL,
    display_name    TEXT,
    avatar_url      TEXT,
    department      TEXT,
    job_title       TEXT,
    phone           TEXT,
    google_id       TEXT UNIQUE,            -- Google OAuth subject (sub) claim
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE shared."UserProfile" IS
    'SGTI user profiles extending Supabase Auth users. One row per authenticated user.';

-- ─── Shared: Roles & Permissions ────────────────────────────────────────────
CREATE TYPE shared."SystemRole" AS ENUM (
    'SUPER_ADMIN',      -- Full access to all modules and admin settings
    'IT_MANAGER',       -- Full access to all IT modules, read-only financial
    'IT_ANALYST',       -- Create/update tickets, read all modules
    'IT_TECHNICIAN',    -- Assigned tickets only
    'AUDITOR',          -- Read-only access to compliance and audit logs
    'END_USER'          -- Portal: create and track own tickets
);

CREATE TABLE IF NOT EXISTS shared."UserRole" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE CASCADE,
    role        shared."SystemRole" NOT NULL,
    granted_by  UUID REFERENCES shared."UserProfile"(id),
    granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at  TIMESTAMPTZ,                -- NULL = permanent
    UNIQUE(user_id, role)
);
COMMENT ON TABLE shared."UserRole" IS
    'RBAC role assignments. A user may hold multiple roles simultaneously.';

-- ─── Shared: Audit Log ──────────────────────────────────────────────────────
-- Immutable. RLS blocks UPDATE and DELETE. Append-only.
CREATE TABLE IF NOT EXISTS shared."AuditLog" (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES shared."UserProfile"(id),
    action          TEXT NOT NULL,          -- e.g. 'ticket.created', 'user.role.granted'
    entity_type     TEXT NOT NULL,          -- e.g. 'Ticket', 'UserProfile'
    entity_id       UUID,                   -- ID of the affected entity
    old_values      JSONB,                  -- Snapshot before change (NULL for INSERT)
    new_values      JSONB,                  -- Snapshot after change (NULL for DELETE)
    ip_address      INET,
    user_agent      TEXT,
    correlation_id  UUID,                   -- Links related audit events
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE shared."AuditLog" IS
    'Immutable audit trail. UPDATE and DELETE are blocked by RLS. Retention: 5 years (LGPD).';
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id    ON shared."AuditLog"(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity     ON shared."AuditLog"(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON shared."AuditLog"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action     ON shared."AuditLog" USING gin (action gin_trgm_ops);

-- ─── Shared: Notifications ──────────────────────────────────────────────────
CREATE TYPE shared."NotificationChannel" AS ENUM ('IN_APP', 'EMAIL');
CREATE TYPE shared."NotificationStatus" AS ENUM ('UNREAD', 'READ', 'DISMISSED');

CREATE TABLE IF NOT EXISTS shared."Notification" (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES shared."UserProfile"(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    body            TEXT NOT NULL,
    link            TEXT,                   -- Deep-link URL within SGTI
    channel         shared."NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    status          shared."NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    entity_type     TEXT,
    entity_id       UUID,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at         TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_notification_user_unread
    ON shared."Notification"(user_id) WHERE status = 'UNREAD';
COMMENT ON TABLE shared."Notification" IS
    'In-app and email notifications. Realtime subscribed by the frontend.';

-- ─── Updated_at trigger function ─────────────────────────────────────────────
-- Applied to all tables with an updated_at column.
CREATE OR REPLACE FUNCTION shared.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to UserProfile
CREATE TRIGGER trg_user_profile_updated_at
    BEFORE UPDATE ON shared."UserProfile"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();

-- ─── Auto-create UserProfile on first Google OAuth login ─────────────────────
CREATE OR REPLACE FUNCTION shared.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO shared."UserProfile" (id, email, full_name, avatar_url, google_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'sub'
    )
    ON CONFLICT (id) DO UPDATE
        SET
            email       = EXCLUDED.email,
            full_name   = COALESCE(EXCLUDED.full_name, shared."UserProfile".full_name),
            avatar_url  = COALESCE(EXCLUDED.avatar_url, shared."UserProfile".avatar_url),
            google_id   = COALESCE(EXCLUDED.google_id,  shared."UserProfile".google_id),
            last_login_at = NOW(),
            updated_at  = NOW();

    -- Assign default END_USER role if not already assigned
    INSERT INTO shared."UserRole" (user_id, role)
    VALUES (NEW.id, 'END_USER')
    ON CONFLICT (user_id, role) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION shared.handle_new_user();

-- ─── Row Level Security ──────────────────────────────────────────────────────

-- UserProfile: users see their own profile; IT_MANAGER+ see all
ALTER TABLE shared."UserProfile" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "UserProfile: owner can read own profile"
    ON shared."UserProfile" FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "UserProfile: owner can update own non-sensitive fields"
    ON shared."UserProfile" FOR UPDATE
    USING (auth.uid() = id);

-- UserRole: users can read their own roles
ALTER TABLE shared."UserRole" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "UserRole: owner can read own roles"
    ON shared."UserRole" FOR SELECT
    USING (auth.uid() = user_id);

-- AuditLog: INSERT allowed; UPDATE and DELETE blocked for all (immutability)
ALTER TABLE shared."AuditLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AuditLog: authenticated users can insert"
    ON shared."AuditLog" FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "AuditLog: no update allowed"
    ON shared."AuditLog" FOR UPDATE
    USING (FALSE);

CREATE POLICY "AuditLog: no delete allowed"
    ON shared."AuditLog" FOR DELETE
    USING (FALSE);

-- Notification: users see only their own notifications
ALTER TABLE shared."Notification" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notification: owner can read own"
    ON shared."Notification" FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Notification: owner can update own (mark as read)"
    ON shared."Notification" FOR UPDATE
    USING (auth.uid() = user_id);

-- ─── Realtime — enable for Notification table ─────────────────────────────
-- Frontend subscribes to this table for live in-app notifications.
ALTER PUBLICATION supabase_realtime ADD TABLE shared."Notification";
