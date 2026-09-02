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
        <Link className="text-sm text-muted-foreground hover:underline" href="/assets">
          ← Voltar para Ativos
        </Link>
        <div className="mt-4 rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
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
      <Link className="text-sm text-muted-foreground hover:underline" href="/assets">
        ← Voltar para Ativos
      </Link>

      <div className="mt-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-semibold text-foreground">{asset.name}</h1>
          <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            {TYPE_LABEL[asset.type] ?? asset.type}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {asset.asset_tag}
          {asset.manufacturer && ` · ${asset.manufacturer}`}
          {asset.model && ` ${asset.model}`}
          {asset.serial_number && ` · S/N ${asset.serial_number}`}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Atribuído a: {nameFor(asset.assigned_to)}
          {asset.location && ` · Localização: ${asset.location}`}
        </p>
        {(asset.purchase_date || asset.warranty_expires) && (
          <p className="mt-1 text-xs text-muted-foreground">
            {asset.purchase_date &&
              `Comprado em ${new Date(asset.purchase_date).toLocaleDateString("pt-BR")}`}
            {asset.warranty_expires &&
              ` · Garantia até ${new Date(asset.warranty_expires).toLocaleDateString("pt-BR")}`}
          </p>
        )}
        {asset.notes && <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{asset.notes}</p>}
      </div>

      {isItStaff && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
          <form action={updateAssetStatus} className="flex items-center gap-2">
            <input name="asset_id" type="hidden" value={asset.id} />
            <select
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
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
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
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
        <div className="mt-4 inline-block rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          Status: {STATUS_LABEL[asset.status] ?? asset.status}
        </div>
      )}

      {isItStaff && (
        <div className="mt-6">
          <h2 className="mb-3 font-medium text-foreground">Histórico de Manutenção</h2>

          {maintenanceRecords.length > 0 && (
            <ul className="mb-4 space-y-3">
              {maintenanceRecords.map((record) => (
                <li className="rounded-lg border border-border bg-card p-3" key={record.id}>
                  <p className="text-sm text-foreground">{record.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
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
            className="space-y-2 rounded-lg border border-border bg-card p-4"
          >
            <input name="asset_id" type="hidden" value={asset.id} />
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <textarea
                required
                className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                id="description"
                name="description"
                placeholder="Ex: Troca de bateria, limpeza interna, atualização de firmware..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Custo (opcional)</Label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
