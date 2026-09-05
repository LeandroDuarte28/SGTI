import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createConsultancy } from "./actions";

export const metadata: Metadata = { title: "Nova Consultoria" };

export default function NewConsultancyPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          className="text-muted-foreground text-sm hover:underline"
          href="/compliance/consultancies"
        >
          ← Voltar para Consultorias
        </Link>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">Nova Consultoria</h1>
        <p className="text-muted-foreground text-sm">
          Cadastre uma empresa ou profissional que realiza auditorias e assessorias de compliance.
        </p>
      </div>

      <form
        action={createConsultancy}
        className="border-border bg-card space-y-5 rounded-lg border p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="trade_name">Nome Fantasia</Label>
            <input
              required
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              id="trade_name"
              name="trade_name"
              type="text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal_name">Razão Social</Label>
            <input
              required
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              id="legal_name"
              name="legal_name"
              type="text"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <input
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="cnpj"
            name="cnpj"
            placeholder="XX.XXX.XXX/XXXX-XX"
            type="text"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact_name">Contato Principal — Nome</Label>
            <input
              required
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              id="contact_name"
              name="contact_name"
              type="text"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contato Principal — E-mail</Label>
            <input
              required
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              id="contact_email"
              name="contact_email"
              type="email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialties">Especialidades</Label>
          <input
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="specialties"
            name="specialties"
            placeholder="ISO 27001, LGPD, PCI DSS (separadas por vírgula)"
            type="text"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            className="border-input h-4 w-4 rounded"
            id="nda_signed"
            name="nda_signed"
            type="checkbox"
          />
          <Label className="font-normal" htmlFor="nda_signed">
            Acordo de Confidencialidade (NDA) assinado
          </Label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/compliance/consultancies">Cancelar</Link>
          </Button>
          <Button type="submit">Cadastrar Consultoria</Button>
        </div>
      </form>
    </div>
  );
}
