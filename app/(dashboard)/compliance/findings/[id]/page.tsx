import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { ADMIN_ROLES, hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { formatDateOnly } from "@/lib/utils/format-date";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  addActionItem,
  reviewEvidence,
  saveFindingRisk,
  updateActionItemProgress,
  updateFindingStatus,
  uploadEvidence,
} from "./actions";

export const metadata: Metadata = { title: "Detalhe do Apontamento" };

const STATUS_LABEL: Record<string, string> = {
  NEW: "Aberto",
  IN_PROGRESS: "Em Tratativa",
  PENDING_EVIDENCE: "Aguardando Evidência",
  IN_VALIDATION: "Em Validação",
  CONCLUDED: "Concluído",
  CANCELLED: "Cancelado",
  NOT_APPLICABLE: "Não Aplicável",
  REOPENED: "Reaberto",
};

const STATUS_OPTIONS = Object.keys(STATUS_LABEL);

const CRITICALITY_CLASS: Record<string, string> = {
  CRITICAL: "bg-priority-critical/10 text-priority-critical",
  MAJOR: "bg-priority-high/10 text-priority-high",
  MINOR: "bg-priority-medium/10 text-priority-medium",
  OBSERVATION: "bg-muted text-muted-foreground",
};

const EVIDENCE_TYPE_OPTIONS = ["SCREENSHOT", "DOCUMENT", "LOG", "REPORT", "CERTIFICATE", "OTHER"];

const EVIDENCE_REVIEW_LABEL: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
};
const EVIDENCE_REVIEW_CLASS: Record<string, string> = {
  PENDING: "bg-status-pending/10 text-status-pending",
  APPROVED: "bg-status-resolved/10 text-status-resolved",
  REJECTED: "bg-destructive/10 text-destructive",
};

const RISK_LEVEL_OPTIONS = [
  { value: "VERY_LOW", label: "Muito Baixo" },
  { value: "LOW", label: "Baixo" },
  { value: "MEDIUM", label: "Médio" },
  { value: "HIGH", label: "Alto" },
  { value: "VERY_HIGH", label: "Muito Alto" },
];
const RISK_CATEGORY_OPTIONS = [
  "REGULATORY",
  "OPERATIONAL",
  "REPUTATIONAL",
  "FINANCIAL",
  "SECURITY",
  "PRIVACY",
];
const RISK_RANK: Record<string, number> = { VERY_LOW: 1, LOW: 2, MEDIUM: 3, HIGH: 4, VERY_HIGH: 5 };

function riskLevelLabel(probability: string, impact: string): string {
  const score = (RISK_RANK[probability] ?? 0) * (RISK_RANK[impact] ?? 0);
  if (score >= 15) {
    return "Crítico";
  }
  if (score >= 10) {
    return "Alto";
  }
  if (score >= 5) {
    return "Médio";
  }
  return "Baixo";
}

export default async function FindingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const user = await getAuthUser();
  const isManager = hasRole(user.roles, ADMIN_ROLES);

  const supabase = await createClient();

  const { data: finding, error } = await supabase
    .schema("compliance")
    .from("ComplianceFinding")
    .select(
      "id, code, audit_id, norm_id, norm_item_id, finding_type, title, description, criticality, analyst_id, due_date, status, is_recurrent, is_urgent, estimated_cost",
    )
    .eq("id", id)
    .single();

  if (error || !finding) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link className="text-muted-foreground text-sm hover:underline" href="/compliance/audits">
          ← Voltar para Auditorias
        </Link>
        <div className="border-border mt-4 rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Apontamento não encontrado, ou você não tem permissão para vê-lo.
          </p>
        </div>
      </div>
    );
  }

  const isAssignedAnalyst = finding.analyst_id === user.id;
  const canManageFinding = isManager || isAssignedAnalyst;

  const [normItemResult, evidenceResult, actionItemsResult, riskResult, staffRolesResult] =
    await Promise.all([
      supabase
        .schema("compliance")
        .from("NormItem")
        .select("item_code, item_name")
        .eq("id", finding.norm_item_id)
        .single(),
      supabase
        .schema("compliance")
        .from("FindingEvidence")
        .select(
          "id, title, description, evidence_type, evidence_date, uploaded_by, review_status, reviewed_by, rejection_reason, sha256_hash",
        )
        .eq("finding_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .schema("compliance")
        .from("ActionItem")
        .select(
          "id, sequence_number, description, responsible_id, due_date, status, completion_percentage",
        )
        .eq("finding_id", id)
        .order("sequence_number"),
      supabase
        .schema("compliance")
        .from("FindingRisk")
        .select("*")
        .eq("finding_id", id)
        .maybeSingle(),
      supabase.schema("shared").from("UserRole").select("user_id").in("role", IT_STAFF_ROLES),
    ]);

  const normItem = normItemResult.data;
  const evidences = evidenceResult.data ?? [];
  const actionItems = actionItemsResult.data ?? [];
  const risk = riskResult.data;

  const staffIds = [...new Set((staffRolesResult.data ?? []).map((r) => r.user_id))];
  const authorIds = [
    finding.analyst_id,
    ...evidences.flatMap((e) => [e.uploaded_by, e.reviewed_by]),
    ...actionItems.map((a) => a.responsible_id),
    ...staffIds,
  ].filter((v): v is string => v !== null);

  const { data: profiles } = await supabase
    .schema("shared")
    .from("UserProfile")
    .select("id, full_name")
    .in("id", authorIds.length > 0 ? authorIds : ["00000000-0000-0000-0000-000000000000"]);

  function nameFor(userId: string | null): string {
    if (!userId) {
      return "—";
    }
    return profiles?.find((p) => p.id === userId)?.full_name ?? "Usuário desconhecido";
  }

  const avgCompletion =
    actionItems.length > 0
      ? Math.round(
          actionItems.reduce((sum, item) => sum + item.completion_percentage, 0) /
            actionItems.length,
        )
      : 0;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        className="text-muted-foreground text-sm hover:underline"
        href={`/compliance/audits/${finding.audit_id}`}
      >
        ← Voltar para a auditoria
      </Link>

      <div className="border-border bg-card mt-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-foreground text-xl font-semibold">{finding.title}</h1>
          <div className="flex shrink-0 gap-2">
            {finding.is_urgent && (
              <span className="bg-destructive/10 text-destructive rounded-full px-2.5 py-0.5 text-xs font-medium">
                URGENTE
              </span>
            )}
            {finding.is_recurrent && (
              <span className="bg-priority-high/10 text-priority-high rounded-full px-2.5 py-0.5 text-xs font-medium">
                RECORRENTE
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${CRITICALITY_CLASS[finding.criticality] ?? ""}`}
            >
              {finding.criticality}
            </span>
          </div>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {finding.code} · {normItem && `${normItem.item_code} — ${normItem.item_name}`}
        </p>
        <p className="text-foreground mt-3 text-sm whitespace-pre-wrap">{finding.description}</p>
        <p className="text-muted-foreground mt-3 text-xs">
          Analista: {nameFor(finding.analyst_id)} · Prazo: {formatDateOnly(finding.due_date)}
          {finding.estimated_cost !== null &&
            ` · Custo estimado: R$ ${Number(finding.estimated_cost).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        </p>
        <p className="text-foreground mt-2 text-sm font-medium">
          Status: {STATUS_LABEL[finding.status] ?? finding.status}
          {actionItems.length > 0 && ` · Progresso do plano de ação: ${avgCompletion}%`}
        </p>
      </div>

      {canManageFinding && !["CANCELLED", "NOT_APPLICABLE"].includes(finding.status) && (
        <form
          action={updateFindingStatus}
          className="border-border bg-card mt-4 space-y-2 rounded-lg border p-4"
        >
          <input name="finding_id" type="hidden" value={finding.id} />
          <div className="flex items-center gap-2">
            <select
              className="border-input bg-background text-foreground rounded-md border px-2 py-1.5 text-sm"
              defaultValue={finding.status}
              key={finding.status}
              name="status"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
            <Button size="sm" type="submit">
              Atualizar status
            </Button>
          </div>
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="reason">
              Motivo (obrigatório para cancelar / não aplicável / reabrir)
            </Label>
            <input
              className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
              id="reason"
              name="reason"
              type="text"
            />
          </div>
        </form>
      )}

      {/* ─── Evidências ─────────────────────────────────────────────── */}
      <div className="mt-6">
        <h2 className="text-foreground mb-3 font-medium">Evidências</h2>

        {evidences.length > 0 && (
          <ul className="mb-4 space-y-3">
            {evidences.map((evidence) => (
              <li className="border-border bg-card rounded-lg border p-3" key={evidence.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-foreground text-sm font-medium">{evidence.title}</p>
                    <p className="text-muted-foreground text-xs">{evidence.description}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      EVIDENCE_REVIEW_CLASS[evidence.review_status] ?? ""
                    }`}
                  >
                    {EVIDENCE_REVIEW_LABEL[evidence.review_status] ?? evidence.review_status}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 font-mono text-[10px]">
                  SHA-256: {evidence.sha256_hash}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  Enviado por {nameFor(evidence.uploaded_by)} em{" "}
                  {formatDateOnly(evidence.evidence_date)}
                  {evidence.reviewed_by && ` · Revisado por ${nameFor(evidence.reviewed_by)}`}
                </p>
                {evidence.rejection_reason && (
                  <p className="text-destructive mt-1 text-xs">
                    Motivo da rejeição: {evidence.rejection_reason}
                  </p>
                )}

                {isManager &&
                  evidence.review_status === "PENDING" &&
                  evidence.uploaded_by !== user.id && (
                    <div className="mt-3 space-y-2">
                      <form action={reviewEvidence} className="inline">
                        <input name="evidence_id" type="hidden" value={evidence.id} />
                        <input name="finding_id" type="hidden" value={finding.id} />
                        <input name="decision" type="hidden" value="APPROVED" />
                        <Button size="sm" type="submit">
                          Aprovar
                        </Button>
                      </form>
                      <form action={reviewEvidence} className="mt-2 flex items-center gap-2">
                        <input name="evidence_id" type="hidden" value={evidence.id} />
                        <input name="finding_id" type="hidden" value={finding.id} />
                        <input name="decision" type="hidden" value="REJECTED" />
                        <input
                          className="border-input bg-background text-foreground flex-1 rounded-md border px-2 py-1 text-xs"
                          name="rejection_reason"
                          placeholder="Motivo da rejeição (mín. 30 caracteres)"
                          type="text"
                        />
                        <Button size="sm" type="submit" variant="outline">
                          Rejeitar
                        </Button>
                      </form>
                    </div>
                  )}
              </li>
            ))}
          </ul>
        )}

        {canManageFinding && (
          <form
            action={uploadEvidence}
            className="border-border bg-card space-y-2 rounded-lg border p-4"
          >
            <input name="finding_id" type="hidden" value={finding.id} />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                required
                className="border-input bg-background text-foreground placeholder:text-muted-foreground rounded-md border px-3 py-1.5 text-sm"
                name="title"
                placeholder="Título"
                type="text"
              />
              <select
                required
                className="border-input bg-background text-foreground rounded-md border px-3 py-1.5 text-sm"
                defaultValue=""
                name="evidence_type"
              >
                <option disabled value="">
                  Tipo de evidência
                </option>
                {EVIDENCE_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              required
              className="border-input bg-background text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-1.5 text-sm"
              name="description"
              placeholder="O que a evidência comprova"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                required
                className="border-input bg-background text-foreground rounded-md border px-3 py-1.5 text-sm"
                name="evidence_date"
                type="date"
              />
              <input
                required
                accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,.csv"
                className="border-input bg-background text-foreground rounded-md border px-3 py-1.5 text-sm"
                name="file"
                type="file"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" type="submit">
                Enviar Evidência
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* ─── Plano de Ação ──────────────────────────────────────────── */}
      <div className="mt-6">
        <h2 className="text-foreground mb-3 font-medium">Plano de Ação</h2>

        {actionItems.length > 0 && (
          <ul className="mb-4 space-y-2">
            {actionItems.map((item) => (
              <li className="border-border bg-card rounded-lg border p-3" key={item.id}>
                <p className="text-foreground text-sm">
                  #{item.sequence_number} {item.description}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {nameFor(item.responsible_id)} · Prazo: {formatDateOnly(item.due_date)}
                </p>
                {canManageFinding ? (
                  <form action={updateActionItemProgress} className="mt-2 flex items-center gap-2">
                    <input name="action_item_id" type="hidden" value={item.id} />
                    <input name="finding_id" type="hidden" value={finding.id} />
                    <select
                      className="border-input bg-background text-foreground rounded-md border px-2 py-1 text-xs"
                      defaultValue={item.status}
                      key={item.status}
                      name="status"
                    >
                      {["PENDING", "IN_PROGRESS", "DONE", "CANCELLED", "OVERDUE"].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <input
                      className="border-input bg-background text-foreground w-20 rounded-md border px-2 py-1 text-xs"
                      defaultValue={item.completion_percentage}
                      key={item.completion_percentage}
                      max={100}
                      min={0}
                      name="completion_percentage"
                      type="number"
                    />
                    <span className="text-muted-foreground text-xs">%</span>
                    <Button size="sm" type="submit" variant="outline">
                      Salvar
                    </Button>
                  </form>
                ) : (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {item.status} · {item.completion_percentage}%
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {canManageFinding && (
          <form
            action={addActionItem}
            className="border-border bg-card space-y-2 rounded-lg border p-4"
          >
            <input name="finding_id" type="hidden" value={finding.id} />
            <textarea
              required
              className="border-input bg-background text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-1.5 text-sm"
              minLength={30}
              name="description"
              placeholder="O que deve ser feito (mínimo 30 caracteres)"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                required
                className="border-input bg-background text-foreground rounded-md border px-3 py-1.5 text-sm"
                defaultValue=""
                name="responsible_id"
              >
                <option disabled value="">
                  Responsável
                </option>
                {staffIds.map((sid) => (
                  <option key={sid} value={sid}>
                    {nameFor(sid)}
                  </option>
                ))}
              </select>
              <input
                required
                className="border-input bg-background text-foreground rounded-md border px-3 py-1.5 text-sm"
                name="due_date"
                type="date"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" type="submit">
                Adicionar Item
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* ─── Risco ──────────────────────────────────────────────────── */}
      <div className="mt-6">
        <h2 className="text-foreground mb-3 font-medium">Risco</h2>

        {risk && (
          <div className="border-border bg-card mb-4 rounded-lg border p-4">
            <p className="text-foreground text-sm">{risk.description}</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Probabilidade {risk.probability} × Impacto {risk.impact} → Nível{" "}
              <span className="text-foreground font-medium">
                {riskLevelLabel(risk.probability, risk.impact)}
              </span>
              {" · "}
              {risk.category} · Responsável: {nameFor(risk.responsible_id)}
            </p>
            {risk.contingency_plan && (
              <p className="text-muted-foreground mt-2 text-xs">
                Contingência: {risk.contingency_plan}
              </p>
            )}
          </div>
        )}

        {canManageFinding && (
          <form
            action={saveFindingRisk}
            className="border-border bg-card space-y-2 rounded-lg border p-4"
          >
            <input name="finding_id" type="hidden" value={finding.id} />
            <textarea
              required
              className="border-input bg-background text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-1.5 text-sm"
              defaultValue={risk?.description ?? ""}
              name="description"
              placeholder="O que pode acontecer se não tratado"
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <select
                required
                className="border-input bg-background text-foreground rounded-md border px-2 py-1.5 text-sm"
                defaultValue={risk?.probability ?? ""}
                name="probability"
              >
                <option disabled value="">
                  Probabilidade
                </option>
                {RISK_LEVEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                required
                className="border-input bg-background text-foreground rounded-md border px-2 py-1.5 text-sm"
                defaultValue={risk?.impact ?? ""}
                name="impact"
              >
                <option disabled value="">
                  Impacto
                </option>
                {RISK_LEVEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                required
                className="border-input bg-background text-foreground rounded-md border px-2 py-1.5 text-sm"
                defaultValue={risk?.category ?? ""}
                name="category"
              >
                <option disabled value="">
                  Categoria
                </option>
                {RISK_CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="border-input bg-background text-foreground placeholder:text-muted-foreground w-full rounded-md border px-3 py-1.5 text-sm"
              defaultValue={risk?.contingency_plan ?? ""}
              name="contingency_plan"
              placeholder="Plano de contingência (obrigatório se nível Alto ou Crítico)"
            />
            <select
              required
              className="border-input bg-background text-foreground w-full rounded-md border px-2 py-1.5 text-sm"
              defaultValue={risk?.responsible_id ?? ""}
              name="responsible_id"
            >
              <option disabled value="">
                Responsável pelo monitoramento
              </option>
              {staffIds.map((sid) => (
                <option key={sid} value={sid}>
                  {nameFor(sid)}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <Button size="sm" type="submit">
                {risk ? "Atualizar Risco" : "Registrar Risco"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
