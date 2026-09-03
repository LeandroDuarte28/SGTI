import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createAccessRequest } from "./actions";

export const metadata: Metadata = { title: "Solicitar Acesso" };

export default function NewAccessRequestPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-sm text-muted-foreground hover:underline" href="/identity">
          ← Voltar para Identidade e Acesso
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Solicitar Acesso</h1>
        <p className="text-sm text-muted-foreground">
          Peça acesso a um sistema interno ou externo. Sua solicitação será avaliada pela TI.
        </p>
      </div>

      <form
        action={createAccessRequest}
        className="space-y-5 rounded-lg border border-border bg-card p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="system_name">Sistema</Label>
          <input
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="system_name"
            maxLength={200}
            name="system_name"
            placeholder="Ex: GLPI, Google Workspace, VPN"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="access_level">Nível de acesso</Label>
          <input
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="access_level"
            maxLength={200}
            name="access_level"
            placeholder="Ex: Usuário Padrão, Admin, Somente Leitura"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="justification">Justificativa</Label>
          <textarea
            required
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="justification"
            name="justification"
            placeholder="Explique por que você precisa deste acesso."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/identity">Cancelar</Link>
          </Button>
          <Button type="submit">Enviar Solicitação</Button>
        </div>
      </form>
    </div>
  );
}
