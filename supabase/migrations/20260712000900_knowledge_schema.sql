-- ============================================================================
-- SGTI — Knowledge Schema (Knowledge Base)
-- Migration: 20260712000900_knowledge_schema
-- ============================================================================

CREATE TYPE knowledge."ArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- ─── Articles ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge."Article" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    content     TEXT NOT NULL,
    category_id UUID REFERENCES catalog."ServiceCategory"(id) ON DELETE SET NULL,
    status      knowledge."ArticleStatus" NOT NULL DEFAULT 'DRAFT',
    author_id   UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    view_count  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_article_status ON knowledge."Article"(status);
CREATE INDEX IF NOT EXISTS idx_article_search  ON knowledge."Article" USING gin (title gin_trgm_ops);

CREATE TRIGGER trg_article_updated_at
    BEFORE UPDATE ON knowledge."Article"
    FOR EACH ROW EXECUTE FUNCTION shared.set_updated_at();
CREATE TRIGGER trg_audit_article
    AFTER INSERT OR UPDATE OR DELETE ON knowledge."Article"
    FOR EACH ROW EXECUTE FUNCTION shared.audit_trigger();

-- ─── Article Versions (edit history) ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge."ArticleVersion" (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id     UUID NOT NULL REFERENCES knowledge."Article"(id) ON DELETE CASCADE,
    content        TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    edited_by      UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (article_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_article_version_article ON knowledge."ArticleVersion"(article_id);

-- ─── Article Feedback ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS knowledge."ArticleFeedback" (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id  UUID NOT NULL REFERENCES knowledge."Article"(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES shared."UserProfile"(id) ON DELETE SET NULL,
    is_helpful  BOOLEAN NOT NULL,
    comment     TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (article_id, user_id)
);

-- ─── Row Level Security ─────────────────────────────────────────────────────
-- Published articles are readable by ANY authenticated user (it's the
-- self-service knowledge base — the whole point is END_USERs reading it).
-- Drafts and management are IT-staff only.

ALTER TABLE knowledge."Article" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Article: authenticated can read published"
    ON knowledge."Article" FOR SELECT
    USING (status = 'PUBLISHED' AND auth.uid() IS NOT NULL);
CREATE POLICY "Article: IT staff can read all (incl. drafts)"
    ON knowledge."Article" FOR SELECT
    USING (shared.is_it_staff());
CREATE POLICY "Article: IT staff can manage"
    ON knowledge."Article" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

ALTER TABLE knowledge."ArticleVersion" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ArticleVersion: IT staff only"
    ON knowledge."ArticleVersion" FOR ALL
    USING (shared.is_it_staff())
    WITH CHECK (shared.is_it_staff());

ALTER TABLE knowledge."ArticleFeedback" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ArticleFeedback: user can manage own"
    ON knowledge."ArticleFeedback" FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "ArticleFeedback: IT staff can read all"
    ON knowledge."ArticleFeedback" FOR SELECT
    USING (shared.is_it_staff());

-- ─── Grants ─────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA knowledge TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA knowledge TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA knowledge TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA knowledge TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA knowledge
    GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA knowledge
    GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA knowledge
    GRANT ALL ON ROUTINES TO anon, authenticated, service_role;
