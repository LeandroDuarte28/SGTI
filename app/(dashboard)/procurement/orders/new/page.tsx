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
        <Link className="text-muted-foreground text-sm hover:underline" href="/procurement">
          ← Voltar para Compras
        </Link>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">Novo Pedido de Compra</h1>
      </div>

      <form
        action={createPurchaseOrder}
        className="border-border bg-card space-y-5 rounded-lg border p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="supplier_id">Fornecedor</Label>
          <select
            required
            className="border-input bg-background text-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
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
          <div className="border-input space-y-2 rounded-md border p-3">
            {Array.from({ length: ITEM_ROWS }).map((_, index) => (
              <div className="grid grid-cols-[1fr_auto_auto] gap-2" key={index}>
                <input
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground rounded-md border px-2 py-1.5 text-sm"
                  name="item_description"
                  placeholder="Descrição do item"
                  type="text"
                />
                <input
                  className="border-input bg-background text-foreground w-20 rounded-md border px-2 py-1.5 text-sm"
                  min="1"
                  name="item_quantity"
                  placeholder="Qtd."
                  type="number"
                />
                <input
                  className="border-input bg-background text-foreground w-28 rounded-md border px-2 py-1.5 text-sm"
                  min="0"
                  name="item_unit_price"
                  placeholder="Preço unit."
                  step="0.01"
                  type="number"
                />
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">Linhas em branco são ignoradas.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Observações (opcional)</Label>
          <textarea
            className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
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
