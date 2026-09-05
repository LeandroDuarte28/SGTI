import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Ativos de TI" };

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

const STATUS_CLASS: Record<string, string> = {
  IN_USE: "bg-status-resolved/10 text-status-resolved",
  IN_STOCK: "bg-muted text-muted-foreground",
  IN_MAINTENANCE: "bg-priority-medium/10 text-priority-medium",
  RETIRED: "bg-muted text-muted-foreground",
  LOST: "bg-destructive/10 text-destructive",
};

const STATUS_OPTIONS = ["IN_USE", "IN_STOCK", "IN_MAINTENANCE", "RETIRED", "LOST"] as const;
type AssetStatus = (typeof STATUS_OPTIONS)[number];
function isAssetStatus(value: string): value is AssetStatus {
  return (STATUS_OPTIONS as readonly string[]).includes(value);
}

const TYPE_OPTIONS = [
  "HARDWARE",
  "SOFTWARE_LICENSE",
  "PERIPHERAL",
  "NETWORK_EQUIPMENT",
  "MOBILE_DEVICE",
] as const;
type AssetType = (typeof TYPE_OPTIONS)[number];
function isAssetType(value: string): value is AssetType {
  return (TYPE_OPTIONS as readonly string[]).includes(value);
}

function Pill({ className, label }: { className: string; label: string }): React.JSX.Element {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
  );
}

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}): Promise<React.JSX.Element> {
  const { status: statusFilter, type: typeFilter } = await searchParams;
  const supabase = await createClient();

  // RLS: a user sees only assets assigned to them; IT staff sees all
  // (see supabase/migrations/20260712000300_asset_schema.sql policies).
  let query = supabase
    .schema("asset")
    .from("Asset")
    .select("id, asset_tag, type, status, name, manufacturer, model, assigned_to")
    .order("asset_tag");

  if (statusFilter && isAssetStatus(statusFilter)) {
    query = query.eq("status", statusFilter);
  }
  if (typeFilter && isAssetType(typeFilter)) {
    query = query.eq("type", typeFilter);
  }

  const [assetsResult, profilesResult] = await Promise.all([
    query,
    supabase.schema("shared").from("UserProfile").select("id, full_name"),
  ]);

  const error = assetsResult.error ?? profilesResult.error;
  const assets = assetsResult.data ?? [];
  const profiles = profilesResult.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Ativos de TI</h1>
          <p className="text-muted-foreground text-sm">
            Inventário de hardware, licenças e equipamentos.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href="/api/reports/assets">Exportar CSV</a>
        </Button>
      </div>

      <form className="mb-4 flex flex-wrap gap-3" method="get">
        <select
          className="border-input bg-background text-foreground rounded-md border px-2 py-1.5 text-sm"
          defaultValue={statusFilter ?? ""}
          name="status"
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>
        <select
          className="border-input bg-background text-foreground rounded-md border px-2 py-1.5 text-sm"
          defaultValue={typeFilter ?? ""}
          name="type"
        >
          <option value="">Todos os tipos</option>
          {TYPE_OPTIONS.map((type) => (
            <option key={type} value={type}>
              {TYPE_LABEL[type]}
            </option>
          ))}
        </select>
        <button
          className="border-input bg-background text-foreground hover:bg-muted rounded-md border px-3 py-1.5 text-sm font-medium"
          type="submit"
        >
          Filtrar
        </button>
        {(statusFilter || typeFilter) && (
          <Link
            className="text-muted-foreground rounded-md px-3 py-1.5 text-sm hover:underline"
            href="/assets"
          >
            Limpar filtros
          </Link>
        )}
      </form>

      {error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
          Não foi possível carregar os ativos: {error.message}
        </div>
      )}

      {!error && assets.length === 0 && (
        <div className="border-border rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhum ativo encontrado
            {statusFilter || typeFilter ? " para este filtro" : ", ou nenhum está atribuído a você"}
            .
          </p>
        </div>
      )}

      {!error && assets.length > 0 && (
        <ul className="space-y-3">
          {assets.map((asset) => {
            const owner = profiles.find((profile) => profile.id === asset.assigned_to);
            return (
              <li key={asset.id}>
                <Link
                  className="border-border bg-card hover:bg-muted/50 block rounded-lg border p-4 shadow-sm transition-colors"
                  href={`/assets/${asset.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-foreground font-medium">{asset.name}</h2>
                      <p className="text-muted-foreground text-xs">
                        {asset.asset_tag} · {TYPE_LABEL[asset.type] ?? asset.type}
                        {asset.manufacturer && ` · ${asset.manufacturer}`}
                        {asset.model && ` ${asset.model}`}
                      </p>
                    </div>
                    <Pill
                      className={STATUS_CLASS[asset.status] ?? ""}
                      label={STATUS_LABEL[asset.status] ?? asset.status}
                    />
                  </div>
                  {owner && (
                    <p className="text-muted-foreground mt-2 text-xs">
                      Atribuído a: {owner.full_name}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
