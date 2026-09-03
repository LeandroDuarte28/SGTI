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
          <h1 className="text-2xl font-semibold text-foreground">Ativos de TI</h1>
          <p className="text-sm text-muted-foreground">
            Inventário de hardware, licenças e equipamentos.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <a href="/api/reports/assets">Exportar CSV</a>
        </Button>
      </div>

      <form className="mb-4 flex flex-wrap gap-3" method="get">
        <select
          className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
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
          className="rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground"
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
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
          type="submit"
        >
          Filtrar
        </button>
        {(statusFilter || typeFilter) && (
          <Link
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:underline"
            href="/assets"
          >
            Limpar filtros
          </Link>
        )}
      </form>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os ativos: {error.message}
        </div>
      )}

      {!error && assets.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum ativo encontrado{statusFilter || typeFilter ? " para este filtro" : ", ou nenhum está atribuído a você"}.
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
                  className="block rounded-lg border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50"
                  href={`/assets/${asset.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-medium text-foreground">{asset.name}</h2>
                      <p className="text-xs text-muted-foreground">
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
                    <p className="mt-2 text-xs text-muted-foreground">
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
