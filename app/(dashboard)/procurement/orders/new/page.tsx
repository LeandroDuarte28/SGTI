import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createPurchaseOrder } from "./actions";

export const metadata: Metadata = { title: "Novo Pedido de Compra" };

const ITEM_ROWS = 4;

export default async function NewPurchaseOrderPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();
  const { data: suppliers } = await supabase
    .schema("procurement")
    .from("Supplier")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link className="text-sm text-muted-foreground hover:underline" href="/procurement">
          ← Voltar para Compras
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Novo Pedido de Compra</h1>
      </div>

      <form
        action={createPurchaseOrder}
        className="space-y-5 rounded-lg border border-border bg-card p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="supplier_id">Fornecedor</Label>
          <select
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue=""
            id="supplier_id"
            name="supplier_id"
          >
            <option disabled value="">
              Selecione um fornecedor
            </option>
            {(suppliers ?? []).map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label>Itens</Label>
          <div className="space-y-2 rounded-md border border-input p-3">
            {Array.from({ length: ITEM_ROWS }).map((_, index) => (
              <div className="grid grid-cols-[1fr_auto_auto] gap-2" key={index}>
                <input
                  className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
                  name="item_description"
                  placeholder="Descrição do item"
                  type="text"
                />
                <input
                  className="w-20 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                  min="1"
                  name="item_quantity"
                  placeholder="Qtd."
                  type="number"
                />
                <input
                  className="w-28 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
                  min="0"
                  name="item_unit_price"
                  placeholder="Preço unit."
                  step="0.01"
                  type="number"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Linhas em branco são ignoradas.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações (opcional)</Label>
          <textarea
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            id="notes"
            name="notes"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/procurement">Cancelar</Link>
          </Button>
          <Button type="submit">Criar Pedido</Button>
        </div>
      </form>
    </div>
  );
}
