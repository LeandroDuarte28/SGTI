import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createSupplier } from "./actions";

export const metadata: Metadata = { title: "Novo Fornecedor" };

export default function NewSupplierPage(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-muted-foreground text-sm hover:underline" href="/procurement">
          ← Voltar para Compras
        </Link>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">Novo Fornecedor</h1>
      </div>

      <form
        action={createSupplier}
        className="border-border bg-card space-y-5 rounded-lg border p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <input
            required
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="name"
            name="name"
            type="text"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_id">CNPJ (opcional)</Label>
          <input
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
            id="tax_id"
            name="tax_id"
            placeholder="XX.XXX.XXX/XXXX-XX"
            type="text"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact_email">E-mail de Contato (opcional)</Label>
            <input
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              id="contact_email"
              name="contact_email"
              type="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Telefone (opcional)</Label>
            <input
              className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
              id="contact_phone"
              name="contact_phone"
              type="text"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/procurement">Cancelar</Link>
          </Button>
          <Button type="submit">Cadastrar Fornecedor</Button>
        </div>
      </form>
    </div>
  );
}
