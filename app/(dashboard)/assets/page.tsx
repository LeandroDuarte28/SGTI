import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

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

function Pill({ className, label }: { className: string; label: string }): React.JSX.Element {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{label}</span>
  );
}

export default async function AssetsPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  // RLS: a user sees only assets assigned to them; IT staff sees all
  // (see supabase/migrations/20260712000300_asset_schema.sql policies).
  const [assetsResult, profilesResult] = await Promise.all([
    supabase
      .schema("asset")
      .from("Asset")
      .select("id, asset_tag, type, status, name, manufacturer, model, assigned_to")
      .order("asset_tag"),
    supabase.schema("shared").from("UserProfile").select("id, full_name"),
  ]);

  const error = assetsResult.error ?? profilesResult.error;
  const assets = assetsResult.data ?? [];
  const profiles = profilesResult.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Ativos de TI</h1>
        <p className="text-sm text-muted-foreground">
          Inventário de hardware, licenças e equipamentos.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar os ativos: {error.message}
        </div>
      )}

      {!error && assets.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum ativo encontrado, ou nenhum está atribuído a você.
          </p>
        </div>
      )}

      {!error && assets.length > 0 && (
        <ul className="space-y-3">
          {assets.map((asset) => {
            const owner = profiles.find((profile) => profile.id === asset.assigned_to);
            return (
              <li
                className="rounded-lg border border-border bg-card p-4 shadow-sm"
                key={asset.id}
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
