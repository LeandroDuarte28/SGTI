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

-- ─── Catalog: SLA Definitions ───────────────────────────────────────────────
INSERT INTO catalog."SLADefinition" (id, name, priority, response_time_minutes, resolution_time_minutes, business_hours_only)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Padrão Crítico', 'CRITICAL', 15, 240, false),
    ('b0000000-0000-0000-0000-000000000002', 'Padrão Alto', 'HIGH', 30, 480, true),
    ('b0000000-0000-0000-0000-000000000003', 'Padrão Médio', 'MEDIUM', 240, 1440, true),
    ('b0000000-0000-0000-0000-000000000004', 'Padrão Baixo', 'LOW', 480, 4320, true)
ON CONFLICT (id) DO NOTHING;

-- ─── Catalog: Service Categories ────────────────────────────────────────────
INSERT INTO catalog."ServiceCategory" (id, name, description, icon, sort_order)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Hardware', 'Solicitações de equipamentos e periféricos', 'laptop', 1),
    ('c0000000-0000-0000-0000-000000000002', 'Software', 'Instalação e licenciamento de software', 'app-window', 2),
    ('c0000000-0000-0000-0000-000000000003', 'Acesso e Contas', 'Criação e alteração de acessos a sistemas', 'key-round', 3),
    ('c0000000-0000-0000-0000-000000000004', 'Rede e Conectividade', 'VPN, Wi-Fi e conectividade geral', 'wifi', 4)
ON CONFLICT (id) DO NOTHING;

-- ─── Catalog: Service Catalog Items ─────────────────────────────────────────
INSERT INTO catalog."ServiceCatalogItem" (category_id, name, description, default_sla_id, estimated_delivery_days)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Solicitar Notebook', 'Solicitação de notebook corporativo novo', 'b0000000-0000-0000-0000-000000000004', 5),
    ('c0000000-0000-0000-0000-000000000001', 'Solicitar Monitor Adicional', 'Solicitação de monitor extra para posto de trabalho', 'b0000000-0000-0000-0000-000000000004', 3),
    ('c0000000-0000-0000-0000-000000000002', 'Instalar Software', 'Instalação de software homologado pela TI', 'b0000000-0000-0000-0000-000000000003', 1),
    ('c0000000-0000-0000-0000-000000000002', 'Licença Microsoft 365', 'Solicitação de licença Microsoft 365', 'b0000000-0000-0000-0000-000000000003', 2),
    ('c0000000-0000-0000-0000-000000000003', 'Criar Acesso a Sistema', 'Criação de acesso a sistema interno', 'b0000000-0000-0000-0000-000000000002', 1),
    ('c0000000-0000-0000-0000-000000000003', 'Resetar Senha', 'Redefinição de senha de acesso corporativo', 'b0000000-0000-0000-0000-000000000001', NULL),
    ('c0000000-0000-0000-0000-000000000004', 'Configurar VPN', 'Configuração de acesso remoto via VPN', 'b0000000-0000-0000-0000-000000000003', 1),
    ('c0000000-0000-0000-0000-000000000004', 'Problema de Wi-Fi', 'Suporte para problemas de conectividade Wi-Fi', 'b0000000-0000-0000-0000-000000000001', NULL);
