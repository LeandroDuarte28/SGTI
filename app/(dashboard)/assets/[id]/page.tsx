import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { addMaintenanceRecord, reassignAsset, updateAssetStatus } from "./actions";

export const metadata: Metadata = { title: "Detalhe do Ativo" };

const TYPE_LABEL: Record<string, string> = {
  HARDWARE: "Hardware",
  SOFTWARE_LICENSE: "Licença de Software",
  PERIPHERAL: "Periférico",
  NETWORK_EQUIPMENT: "Equipamento de Rede",
  MOBILE_DEVICE: "Dispositivo Móvel",
};

const STATUS_LABEL: Record<string, string> = {
  IN_USE: "Em Uso",
  IN_STOCK: "Em Estoque",
  IN_MAINTENANCE: "Em Manutenção",
  RETIRED: "Desativado",
  LOST: "Perdido/Roubado",
};

const STATUS_OPTIONS = ["IN_USE", "IN_STOCK", "IN_MAINTENANCE", "RETIRED", "LOST"];

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<React.JSX.Element> {
  const { id } = await params;
  const user = await getAuthUser();
  const isItStaff = hasRole(user.roles, IT_STAFF_ROLES);

  const supabase = await createClient();

  const { data: asset, error } = await supabase
    .schema("asset")
    .from("Asset")
    .select(
      "id, asset_tag, type, status, name, manufacturer, model, serial_number, purchase_date, warranty_expires, assigned_to, location, notes",
    )
    .eq("id", id)
    .single();

  if (error || !asset) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link className="text-muted-foreground text-sm hover:underline" href="/assets">
          ← Voltar para Ativos
        </Link>
        <div className="border-border mt-4 rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Ativo não encontrado, ou você não tem permissão para vê-lo.
          </p>
        </div>
      </div>
    );
  }

  // RLS restricts AssetMaintenanceRecord to IT staff — this simply returns
  // empty for anyone else rather than erroring.
  const [maintenanceResult, staffProfiles] = await Promise.all([
    supabase
      .schema("asset")
      .from("AssetMaintenanceRecord")
      .select("id, description, performed_by, cost, performed_at")
      .eq("asset_id", id)
      .order("performed_at", { ascending: false }),
    isItStaff
      ? supabase.schema("shared").from("UserProfile").select("id, full_name").order("full_name")
      : Promise.resolve({ data: null }),
  ]);

  const maintenanceRecords = maintenanceResult.data ?? [];
  const allProfiles = staffProfiles.data ?? [];

  const authorIds = [
    asset.assigned_to,
    ...maintenanceRecords.map((record) => record.performed_by),
  ].filter((value): value is string => value !== null);

  const { data: profiles } = await supabase
    .schema("shared")
    .from("UserProfile")
    .select("id, full_name")
    .in("id", authorIds.length > 0 ? authorIds : ["00000000-0000-0000-0000-000000000000"]);

  function nameFor(userId: string | null): string {
    if (!userId) {
      return "—";
    }
    return (
      profiles?.find((p) => p.id === userId)?.full_name ??
      allProfiles.find((p) => p.id === userId)?.full_name ??
      "Usuário desconhecido"
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link className="text-muted-foreground text-sm hover:underline" href="/assets">
        ← Voltar para Ativos
      </Link>

      <div className="border-border bg-card mt-4 rounded-lg border p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-foreground text-xl font-semibold">{asset.name}</h1>
          <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium">
            {TYPE_LABEL[asset.type] ?? asset.type}
          </span>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {asset.asset_tag}
          {asset.manufacturer && ` · ${asset.manufacturer}`}
          {asset.model && ` ${asset.model}`}
          {asset.serial_number && ` · S/N ${asset.serial_number}`}
        </p>
        <p className="text-muted-foreground mt-4 text-xs">
          Atribuído a: {nameFor(asset.assigned_to)}
          {asset.location && ` · Localização: ${asset.location}`}
        </p>
        {(asset.purchase_date || asset.warranty_expires) && (
          <p className="text-muted-foreground mt-1 text-xs">
            {asset.purchase_date &&
              `Comprado em ${new Date(asset.purchase_date).toLocaleDateString("pt-BR")}`}
            {asset.warranty_expires &&
              ` · Garantia até ${new Date(asset.warranty_expires).toLocaleDateString("pt-BR")}`}
          </p>
        )}
        {asset.notes && (
          <p className="text-foreground mt-3 text-sm whitespace-pre-wrap">{asset.notes}</p>
        )}
      </div>

      {isItStaff && (
        <div className="border-border bg-card mt-4 flex flex-wrap items-center gap-3 rounded-lg border p-4">
          <form action={updateAssetStatus} className="flex items-center gap-2">
            <input name="asset_id" type="hidden" value={asset.id} />
            <select
              className="border-input bg-background text-foreground rounded-md border px-2 py-1.5 text-sm"
              defaultValue={asset.status}
              key={asset.status}
              name="status"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status] ?? status}
                </option>
              ))}
            </select>
            <Button size="sm" type="submit">
              Atualizar status
            </Button>
          </form>

          <form action={reassignAsset} className="flex items-center gap-2">
            <input name="asset_id" type="hidden" value={asset.id} />
            <select
              className="border-input bg-background text-foreground rounded-md border px-2 py-1.5 text-sm"
              defaultValue={asset.assigned_to ?? ""}
              key={asset.assigned_to ?? "unassigned"}
              name="assigned_to"
            >
              <option value="">Sem responsável</option>
              {allProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.full_name}
                </option>
              ))}
            </select>
            <Button size="sm" type="submit" variant="outline">
              Atribuir
            </Button>
          </form>
        </div>
      )}

      {!isItStaff && (
        <div className="bg-muted text-muted-foreground mt-4 inline-block rounded-full px-3 py-1 text-xs">
          Status: {STATUS_LABEL[asset.status] ?? asset.status}
        </div>
      )}

      {isItStaff && (
        <div className="mt-6">
          <h2 className="text-foreground mb-3 font-medium">Histórico de Manutenção</h2>

          {maintenanceRecords.length > 0 && (
            <ul className="mb-4 space-y-3">
              {maintenanceRecords.map((record) => (
                <li className="border-border bg-card rounded-lg border p-3" key={record.id}>
                  <p className="text-foreground text-sm">{record.description}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {nameFor(record.performed_by)} ·{" "}
                    {new Date(record.performed_at).toLocaleDateString("pt-BR")}
                    {record.cost !== null &&
                      ` · R$ ${Number(record.cost).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                  </p>
                </li>
              ))}
            </ul>
          )}

          <form
            action={addMaintenanceRecord}
            className="border-border bg-card space-y-2 rounded-lg border p-4"
          >
            <input name="asset_id" type="hidden" value={asset.id} />
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                required
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                id="description"
                name="description"
                placeholder="Ex: Troca de bateria, limpeza interna, atualização de firmware..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Custo (opcional)</Label>
              <input
                className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                id="cost"
                min="0"
                name="cost"
                placeholder="0,00"
                step="0.01"
                type="number"
              />
            </div>
            <div className="flex justify-end">
              <Button size="sm" type="submit">
                Registrar manutenção
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
