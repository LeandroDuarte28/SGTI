import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Catálogo de Serviços" };

function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = minutes / 60;
  if (hours < 24) {
    return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
  }
  const days = hours / 24;
  return `${Number.isInteger(days) ? days : days.toFixed(1)}d`;
}

export default async function CatalogPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();

  const [categoriesResult, itemsResult, slaResult] = await Promise.all([
    supabase
      .schema("catalog")
      .from("ServiceCategory")
      .select("id, name, description")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .schema("catalog")
      .from("ServiceCatalogItem")
      .select("id, category_id, name, description, estimated_delivery_days, default_sla_id")
      .eq("is_active", true),
    supabase
      .schema("catalog")
      .from("SLADefinition")
      .select("id, name, response_time_minutes, resolution_time_minutes"),
  ]);

  const error = categoriesResult.error ?? itemsResult.error ?? slaResult.error;
  const categories = categoriesResult.data ?? [];
  const items = itemsResult.data ?? [];
  const slaRows = slaResult.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Catálogo de Serviços</h1>
        <p className="text-sm text-muted-foreground">
          Solicite serviços de TI disponíveis para sua área.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Não foi possível carregar o catálogo: {error.message}
        </div>
      )}

      {!error && categories.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma categoria de serviço cadastrada ainda.
          </p>
        </div>
      )}

      {!error && categories.length > 0 && (
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryItems = items.filter((item) => item.category_id === category.id);

            return (
              <section key={category.id}>
                <h2 className="mb-1 font-medium text-foreground">{category.name}</h2>
                {category.description && (
                  <p className="mb-3 text-sm text-muted-foreground">{category.description}</p>
                )}

                {categoryItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum item cadastrado nesta categoria ainda.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {categoryItems.map((item) => {
                      const sla = slaRows.find((row) => row.id === item.default_sla_id);
                      return (
                        <div
                          className="rounded-lg border border-border bg-card p-4 shadow-sm"
                          key={item.id}
                        >
                          <h3 className="font-medium text-foreground">{item.name}</h3>
                          {item.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {sla && (
                              <span className="rounded-full bg-muted px-2.5 py-0.5">
                                Resposta em {formatMinutes(sla.response_time_minutes)} · Resolução
                                em {formatMinutes(sla.resolution_time_minutes)}
                              </span>
                            )}
                            {item.estimated_delivery_days !== null && (
                              <span className="rounded-full bg-muted px-2.5 py-0.5">
                                Entrega estimada: {item.estimated_delivery_days}{" "}
                                {item.estimated_delivery_days === 1 ? "dia" : "dias"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
