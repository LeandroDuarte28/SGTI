import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Normas" };

const TYPE_LABEL: Record<string, string> = {
  INTERNATIONAL: "Internacional",
  REGULATORY_BR: "Regulatória BR",
  FRAMEWORK: "Framework",
  INTERNAL: "Interna",
};

const CRITICALITY_LABEL: Record<string, string> = {
  CRITICAL: "Crítica",
  MAJOR: "Maior",
  MINOR: "Menor",
  OBSERVATION: "Observação",
};

const CRITICALITY_CLASS: Record<string, string> = {
  CRITICAL: "bg-priority-critical/10 text-priority-critical",
  MAJOR: "bg-priority-high/10 text-priority-high",
  MINOR: "bg-priority-medium/10 text-priority-medium",
  OBSERVATION: "bg-muted text-muted-foreground",
};

export default async function NormsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  const [normsResult, itemsResult] = await Promise.all([
    supabase
      .schema("compliance")
      .from("Norm")
      .select("id, code, full_name, version, issuing_body, type, is_active")
      .order("full_name"),
    supabase
      .schema("compliance")
      .from("NormItem")
      .select(
        "id, norm_id, item_code, item_name, default_criticality, is_applicable, implementation_status",
      )
      .order("item_code"),
  ]);

  const error = normsResult.error ?? itemsResult.error;
  const norms = normsResult.data ?? [];
  const items = itemsResult.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link className="text-muted-foreground text-sm hover:underline" href="/compliance">
            ← Voltar para Compliance
          </Link>
          <h1 className="text-foreground mt-2 text-2xl font-semibold">Normas</h1>
          <p className="text-muted-foreground text-sm">
            Normas, frameworks e políticas usados como referência nas auditorias.
          </p>
        </div>
        <Button asChild>
          <Link href="/compliance/norms/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Norma
          </Link>
        </Button>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
          Não foi possível carregar as normas: {error.message}
        </div>
      )}

      {!error && norms.length > 0 && (
        <ul className="space-y-4">
          {norms.map((norm) => {
            const normItems = items.filter((item) => item.norm_id === norm.id);
            return (
              <li className="border-border bg-card rounded-lg border p-4 shadow-sm" key={norm.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-foreground font-medium">
                      {norm.full_name}{" "}
                      {norm.version && (
                        <span className="text-muted-foreground">({norm.version})</span>
                      )}
                    </h2>
                    <p className="text-muted-foreground text-xs">
                      {norm.code} · {norm.issuing_body} · {TYPE_LABEL[norm.type] ?? norm.type}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      norm.is_active
                        ? "bg-status-resolved/10 text-status-resolved"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {norm.is_active ? "Ativa" : "Inativa"}
                  </span>
                </div>

                {normItems.length > 0 && (
                  <ul className="border-border mt-3 space-y-1.5 border-t pt-3">
                    {normItems.map((item) => (
                      <li className="flex items-center justify-between gap-3 text-xs" key={item.id}>
                        <span className="text-foreground">
                          <span className="text-muted-foreground font-mono">{item.item_code}</span>{" "}
                          — {item.item_name}
                        </span>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 font-medium ${
                            CRITICALITY_CLASS[item.default_criticality] ?? ""
                          }`}
                        >
                          {CRITICALITY_LABEL[item.default_criticality] ?? item.default_criticality}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
