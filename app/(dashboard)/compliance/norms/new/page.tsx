import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createNorm } from "./actions";

export const metadata: Metadata = { title: "Nova Norma" };

const TYPE_OPTIONS = [
  { value: "INTERNATIONAL", label: "Internacional" },
  { value: "REGULATORY_BR", label: "Regulatória BR" },
  { value: "FRAMEWORK", label: "Framework" },
  { value: "INTERNAL", label: "Interna" },
];

export default function NewNormPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-sm text-muted-foreground hover:underline" href="/compliance/norms">
          ← Voltar para Normas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Nova Norma</h1>
        <p className="text-sm text-muted-foreground">Cadastre uma norma, framework ou política.</p>
      </div>

      <form action={createNorm} className="space-y-5 rounded-lg border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="code">Código</Label>
          <input
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="code"
            name="code"
            placeholder="Ex: NIST_CSF"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">Nome Completo</Label>
          <input
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="full_name"
            name="full_name"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="issuing_body">Órgão Emissor</Label>
          <input
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="issuing_body"
            name="issuing_body"
            placeholder="Ex: NIST, ISO, ANPD"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo</Label>
          <select
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue=""
            id="type"
            name="type"
          >
            <option disabled value="">
              Selecione um tipo
            </option>
            {TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/compliance/norms">Cancelar</Link>
          </Button>
          <Button type="submit">Cadastrar Norma</Button>
        </div>
      </form>
    </div>
  );
}
