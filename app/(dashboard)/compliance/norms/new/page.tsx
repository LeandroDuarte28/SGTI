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
        <Link className="text-muted-foreground text-sm hover:underline" href="/compliance/norms">
          ← Voltar para Normas
        </Link>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">Nova Norma</h1>
        <p className="text-muted-foreground text-sm">Cadastre uma norma, framework ou política.</p>
      </div>

      <form action={createNorm} className="border-border bg-card space-y-5 rounded-lg border p-6">
        <div className="space-y-2">
          <Label htmlFor="code">Código</Label>
          <input
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
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
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="full_name"
            name="full_name"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="issuing_body">Órgão Emissor</Label>
          <input
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
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
            className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
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
