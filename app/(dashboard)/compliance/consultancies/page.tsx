import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Consultorias" };

export default async function ConsultanciesPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  const { data: consultancies, error } = await supabase
    .schema("compliance")
    .from("Consultancy")
    .select(
      "id, trade_name, legal_name, cnpj, contact_name, contact_email, specialties, status, nda_signed",
    )
    .order("trade_name");

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link className="text-muted-foreground text-sm hover:underline" href="/compliance">
            ← Voltar para Compliance
          </Link>
          <h1 className="text-foreground mt-2 text-2xl font-semibold">Consultorias</h1>
          <p className="text-muted-foreground text-sm">
            Empresas e profissionais que realizam auditorias e assessorias de compliance.
          </p>
        </div>
        <Button asChild>
          <Link href="/compliance/consultancies/new">
            <Plus className="mr-2 h-4 w-4" />
            Nova Consultoria
          </Link>
        </Button>
      </div>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
          Não foi possível carregar as consultorias: {error.message}
        </div>
      )}

      {!error && (consultancies ?? []).length === 0 && (
        <div className="border-border rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">Nenhuma consultoria cadastrada ainda.</p>
        </div>
      )}

      {!error && (consultancies ?? []).length > 0 && (
        <ul className="space-y-3">
          {(consultancies ?? []).map((c) => (
            <li className="border-border bg-card rounded-lg border p-4 shadow-sm" key={c.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-foreground font-medium">{c.trade_name}</h2>
                  <p className="text-muted-foreground text-xs">
                    {c.legal_name}
                    {c.cnpj && ` · ${c.cnpj}`}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    c.status === "ACTIVE"
                      ? "bg-status-resolved/10 text-status-resolved"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.status === "ACTIVE" ? "Ativa" : "Inativa"}
                </span>
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                {c.contact_name} · {c.contact_email}
                {c.nda_signed && " · NDA assinado"}
              </p>
              {c.specialties.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.specialties.map((s) => (
                    <span
                      className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
                      key={s}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
