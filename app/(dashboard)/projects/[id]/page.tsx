import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { ADMIN_ROLES, hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { formatDateOnly } from "@/lib/utils/format-date";
import { Button } from "@/components/ui/button";

import {
  addGithubReference,
  addMilestone,
  addProjectBenefit,
  addRisk,
  completeMilestone,
  measureProjectBenefit,
  resolveRisk,
  updateProjectFinancials,
  updateProjectStatus,
} from "./actions";

export const metadata: Metadata = { title: "Detalhe do Projeto" };

const STATUS_LABEL: Record<string, string> = {
  PLANNING: "Planejamento",
  IN_PROGRESS: "Em Andamento",
  ON_HOLD: "Em Espera",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};
const STATUS_OPTIONS = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"];

const RISK_LEVEL_LABEL: Record<string, string> = { LOW: "Baixo", MEDIUM: "Médio", HIGH: "Alto" };
const RISK_LEVEL_CLASS: Record<string, string> = {
  LOW: "bg-priority-low/10 text-priority-low",
  MEDIUM: "bg-priority-medium/10 text-priority-medium",
  HIGH: "bg-priority-high/10 text-priority-high",
};

const REF_TYPE_OPTIONS = ["ISSUE", "PULL_REQUEST", "COMMIT"];

const BENEFIT_TYPE_LABEL: Record<string, string> = {
  FINANCIAL: "Financeiro",
  EFFICIENCY: "Eficiência",
  RISK_REDUCTION: "Redução de Risco",
  COMPLIANCE: "Compliance",
  QUALITY: "Qualidade",
  INNOVATION: "Inovação",
};
const BENEFIT_TYPE_OPTIONS = Object.keys(BENEFIT_TYPE_LABEL);

const BENEFIT_STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planejado",
  PENDING_MEASUREMENT: "Aguardando Medição",
  REALIZED: "Realizado",
  NOT_REALIZED: "Não Realizado",
  PARTIALLY_REALIZED: "Parcialmente Realizado",
};
const BENEFIT_STATUS_OPTIONS = Object.keys(BENEFIT_STATUS_LABEL);
const BENEFIT_STATUS_CLASS: Record<string, string> = {
  PLANNED: "bg-muted text-muted-foreground",
  PENDING_MEASUREMENT: "bg-status-pending/10 text-status-pending",
  REALIZED: "bg-status-resolved/10 text-status-resolved",
  NOT_REALIZED: "bg-destructive/10 text-destructive",
  PARTIALLY_REALIZED: "bg-priority-medium/10 text-priority-medium",
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const user = await getAuthUser();
  const isItStaff = hasRole(user.roles, IT_STAFF_ROLES);
  const isManager = hasRole(user.roles, ADMIN_ROLES);

  const supabase = await createClient();

  const { data: project, error } = await supabase
    .schema("project")
    .from("Project")
    .select(
      "id, name, description, status, owner_id, budget_id, start_date, end_date, github_repo, capex_approved, opex_approved, capex_realized, opex_realized",
    )
    .eq("id", id)
    .single();

  if (error || !project) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link className="text-sm text-muted-foreground hover:underline" href="/projects">
          ← Voltar para Projetos
        </Link>
        <div className="mt-4 rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Projeto não encontrado, ou você não tem permissão para vê-lo.
          </p>
        </div>
      </div>
    );
  }

  const canManageStatus = isManager || project.owner_id === user.id;

  const [milestonesResult, risksResult, refsResult, ownerResult, benefitsResult] = await Promise.all([
    supabase.schema("project").from("Milestone").select("id, title, due_date, completed_at").eq("project_id", id).order("due_date"),
    supabase.schema("project").from("Risk").select("id, description, probability, impact, mitigation, is_resolved").eq("project_id", id),
    supabase.schema("project").from("GithubReference").select("id, ref_type, url, title").eq("project_id", id),
    supabase.schema("shared").from("UserProfile").select("full_name").eq("id", project.owner_id ?? "").maybeSingle(),
    supabase
      .schema("project")
      .from("ProjectBenefit")
      .select("id, description, benefit_type, expected_value, realization_deadline, realized_value, status")
      .eq("project_id", id)
      .order("created_at"),
  ]);

  const milestones = milestonesResult.data ?? [];
  const risks = risksResult.data ?? [];
  const githubRefs = refsResult.data ?? [];
  const benefits = benefitsResult.data ?? [];

  const capexApproved = Number(project.capex_approved ?? 0);
  const opexApproved = Number(project.opex_approved ?? 0);
  const capexRealized = Number(project.capex_realized);
  const opexRealized = Number(project.opex_realized);
  const totalApproved = capexApproved + opexApproved;
  const totalRealized = capexRealized + opexRealized;
  const percentUsed = totalApproved > 0 ? (totalRealized / totalApproved) * 100 : null;

  return (
    <div className="mx-auto max-w-2xl">
      <Link className="text-sm text-muted-foreground hover:underline" href="/projects">
        ← Voltar para Projetos
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-foreground">{project.name}</h1>
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {STATUS_LABEL[project.status] ?? project.status}
          </span>
        </div>
        {project.description && <p className="mt-2 text-sm text-foreground">{project.description}</p>}
        <p className="mt-3 text-xs text-muted-foreground">
          {ownerResult.data && `Responsável: ${ownerResult.data.full_name}`}
          {project.start_date && ` · Início: ${formatDateOnly(project.start_date)}`}
          {project.end_date && ` · Fim: ${formatDateOnly(project.end_date)}`}
          {project.github_repo && ` · ${project.github_repo}`}
        </p>
      </div>

      {canManageStatus && (
        <form action={updateProjectStatus} className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-card p-4">
          <input name="project_id" type="hidden" value={project.id} />
          <select
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
            defaultValue={project.status}
            key={project.status}
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
        </form>
      )}

      {isManager && (
        <div className="mt-6">
          <h2 className="mb-3 font-medium text-foreground">Financeiro do Projeto</h2>
          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">Aprovado (Total)</p>
              <p className="text-sm font-medium text-foreground">{formatCurrency(totalApproved)}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">Realizado (Total)</p>
              <p className="text-sm font-medium text-foreground">{formatCurrency(totalRealized)}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">% Utilizado</p>
              <p
                className={`text-sm font-medium ${
                  percentUsed !== null && percentUsed > 100 ? "text-destructive" : "text-foreground"
                }`}
              >
                {percentUsed !== null ? `${percentUsed.toFixed(1)}%` : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">Saldo Disponível</p>
              <p className="text-sm font-medium text-foreground">{formatCurrency(totalApproved - totalRealized)}</p>
            </div>
          </div>
          <form
            action={updateProjectFinancials}
            className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-4 sm:grid-cols-4"
          >
            <input name="project_id" type="hidden" value={project.id} />
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="capex_approved">
                CAPEX Aprovado
              </label>
              <input
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                defaultValue={project.capex_approved ?? ""}
                id="capex_approved"
                min="0"
                name="capex_approved"
                step="0.01"
                type="number"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="opex_approved">
                OPEX Aprovado
              </label>
              <input
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                defaultValue={project.opex_approved ?? ""}
                id="opex_approved"
                min="0"
                name="opex_approved"
                step="0.01"
                type="number"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="capex_realized">
                CAPEX Realizado
              </label>
              <input
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                defaultValue={project.capex_realized}
                id="capex_realized"
                min="0"
                name="capex_realized"
                step="0.01"
                type="number"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="opex_realized">
                OPEX Realizado
              </label>
              <input
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                defaultValue={project.opex_realized}
                id="opex_realized"
                min="0"
                name="opex_realized"
                step="0.01"
                type="number"
              />
            </div>
            <div className="col-span-2 flex items-end sm:col-span-4">
              <Button size="sm" type="submit">
                Salvar Financeiro
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-3 font-medium text-foreground">Marcos</h2>
        {milestones.length > 0 && (
          <ul className="mb-4 space-y-2">
            {milestones.map((milestone) => (
              <li className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3" key={milestone.id}>
                <div>
                  <p className={`text-sm ${milestone.completed_at ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {milestone.title}
                  </p>
                  {milestone.due_date && (
                    <p className="text-xs text-muted-foreground">Prazo: {formatDateOnly(milestone.due_date)}</p>
                  )}
                </div>
                {isItStaff && !milestone.completed_at && (
                  <form action={completeMilestone}>
                    <input name="milestone_id" type="hidden" value={milestone.id} />
                    <input name="project_id" type="hidden" value={project.id} />
                    <Button size="sm" type="submit" variant="outline">
                      Concluir
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
        {isItStaff && (
          <form action={addMilestone} className="flex items-center gap-2 rounded-lg border border-border bg-card p-4">
            <input name="project_id" type="hidden" value={project.id} />
            <input
              required
              className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
              name="title"
              placeholder="Título do marco"
              type="text"
            />
            <input className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground" name="due_date" type="date" />
            <Button size="sm" type="submit">
              Adicionar
            </Button>
          </form>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-medium text-foreground">Riscos</h2>
        {risks.length > 0 && (
          <ul className="mb-4 space-y-2">
            {risks.map((risk) => (
              <li className="rounded-lg border border-border bg-card p-3" key={risk.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className={`text-sm ${risk.is_resolved ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {risk.description}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RISK_LEVEL_CLASS[risk.probability] ?? ""}`}>
                      P: {RISK_LEVEL_LABEL[risk.probability]}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RISK_LEVEL_CLASS[risk.impact] ?? ""}`}>
                      I: {RISK_LEVEL_LABEL[risk.impact]}
                    </span>
                  </div>
                </div>
                {risk.mitigation && <p className="mt-1 text-xs text-muted-foreground">Mitigação: {risk.mitigation}</p>}
                {isItStaff && !risk.is_resolved && (
                  <form action={resolveRisk} className="mt-2">
                    <input name="risk_id" type="hidden" value={risk.id} />
                    <input name="project_id" type="hidden" value={project.id} />
                    <Button size="sm" type="submit" variant="outline">
                      Marcar como resolvido
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
        {isItStaff && (
          <form action={addRisk} className="space-y-2 rounded-lg border border-border bg-card p-4">
            <input name="project_id" type="hidden" value={project.id} />
            <input
              required
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
              name="description"
              placeholder="Descrição do risco"
              type="text"
            />
            <div className="grid grid-cols-2 gap-2">
              <select required className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground" defaultValue="" name="probability">
                <option disabled value="">
                  Probabilidade
                </option>
                <option value="LOW">Baixo</option>
                <option value="MEDIUM">Médio</option>
                <option value="HIGH">Alto</option>
              </select>
              <select required className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground" defaultValue="" name="impact">
                <option disabled value="">
                  Impacto
                </option>
                <option value="LOW">Baixo</option>
                <option value="MEDIUM">Médio</option>
                <option value="HIGH">Alto</option>
              </select>
            </div>
            <input
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
              name="mitigation"
              placeholder="Plano de mitigação (opcional)"
              type="text"
            />
            <div className="flex justify-end">
              <Button size="sm" type="submit">
                Adicionar Risco
              </Button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-3 font-medium text-foreground">Referências GitHub</h2>
        {githubRefs.length > 0 && (
          <ul className="mb-4 space-y-2">
            {githubRefs.map((ref) => (
              <li className="rounded-lg border border-border bg-card p-3 text-sm" key={ref.id}>
                <a className="text-foreground underline" href={ref.url} rel="noreferrer" target="_blank">
                  {ref.title ?? ref.url}
                </a>
                <span className="ml-2 text-xs text-muted-foreground">{ref.ref_type}</span>
              </li>
            ))}
          </ul>
        )}
        {isItStaff && (
          <form action={addGithubReference} className="flex items-center gap-2 rounded-lg border border-border bg-card p-4">
            <input name="project_id" type="hidden" value={project.id} />
            <select required className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground" defaultValue="" name="ref_type">
              <option disabled value="">
                Tipo
              </option>
              {REF_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              required
              className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
              name="url"
              placeholder="URL"
              type="text"
            />
            <input
              className="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
              name="title"
              placeholder="Título (opcional)"
              type="text"
            />
            <Button size="sm" type="submit">
              Adicionar
            </Button>
          </form>
        )}
      </div>

      {isItStaff && (
        <div className="mt-6">
          <h2 className="mb-3 font-medium text-foreground">Benefícios</h2>
          {benefits.length > 0 && (
            <ul className="mb-4 space-y-2">
              {benefits.map((benefit) => (
                <li className="rounded-lg border border-border bg-card p-3" key={benefit.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-foreground">{benefit.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {BENEFIT_TYPE_LABEL[benefit.benefit_type] ?? benefit.benefit_type} · Prazo:{" "}
                        {formatDateOnly(benefit.realization_deadline)}
                        {benefit.expected_value !== null && ` · Esperado: ${formatCurrency(Number(benefit.expected_value))}`}
                        {benefit.realized_value !== null && ` · Realizado: ${formatCurrency(Number(benefit.realized_value))}`}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        BENEFIT_STATUS_CLASS[benefit.status] ?? ""
                      }`}
                    >
                      {BENEFIT_STATUS_LABEL[benefit.status] ?? benefit.status}
                    </span>
                  </div>
                  <form action={measureProjectBenefit} className="mt-2 flex flex-wrap items-center gap-2">
                    <input name="benefit_id" type="hidden" value={benefit.id} />
                    <input name="project_id" type="hidden" value={project.id} />
                    <input
                      className="w-32 rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                      defaultValue={benefit.realized_value ?? ""}
                      min="0"
                      name="realized_value"
                      placeholder="Valor realizado"
                      step="0.01"
                      type="number"
                    />
                    <select
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs text-foreground"
                      defaultValue={benefit.status}
                      key={benefit.status}
                      name="status"
                    >
                      {BENEFIT_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {BENEFIT_STATUS_LABEL[status]}
                        </option>
                      ))}
                    </select>
                    <Button size="sm" type="submit" variant="outline">
                      Registrar Medição
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <form action={addProjectBenefit} className="space-y-2 rounded-lg border border-border bg-card p-4">
            <input name="project_id" type="hidden" value={project.id} />
            <input
              required
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
              name="description"
              placeholder="Descrição do benefício esperado"
              type="text"
            />
            <div className="grid grid-cols-3 gap-2">
              <select required className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground" defaultValue="" name="benefit_type">
                <option disabled value="">
                  Tipo
                </option>
                {BENEFIT_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {BENEFIT_TYPE_LABEL[type]}
                  </option>
                ))}
              </select>
              <input
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
                min="0"
                name="expected_value"
                placeholder="Valor esperado (R$, opcional)"
                step="0.01"
                type="number"
              />
              <input
                required
                className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                name="realization_deadline"
                type="date"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" type="submit">
                Registrar Benefício
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
