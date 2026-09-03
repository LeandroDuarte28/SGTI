import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getAuthUser } from "@/lib/auth/get-user";
import { hasRole, IT_STAFF_ROLES } from "@/lib/constants/roles";
import { Button } from "@/components/ui/button";

import { toggleCategoryActive, toggleItemActive } from "./actions";

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
  const user = await getAuthUser();
  const isItStaff = hasRole(user.roles, IT_STAFF_ROLES);

  const supabase = await createClient();

  let categoriesQuery = supabase
    .schema("catalog")
    .from("ServiceCategory")
    .select("id, name, description, is_active")
    .order("sort_order");
  let itemsQuery = supabase
    .schema("catalog")
    .from("ServiceCatalogItem")
    .select("id, category_id, name, description, estimated_delivery_days, default_sla_id, is_active");
  if (!isItStaff) {
    categoriesQuery = categoriesQuery.eq("is_active", true);
    itemsQuery = itemsQuery.eq("is_active", true);
  }

  const [categoriesResult, itemsResult, slaResult] = await Promise.all([
    categoriesQuery,
    itemsQuery,
    supabase
      .schema("catalog")
      .from("SLADefinition")
      .select("id, name, response_time_minutes, resolution_time_minutes, is_active")
      .order("response_time_minutes"),
  ]);

  const error = categoriesResult.error ?? itemsResult.error ?? slaResult.error;
  const categories = categoriesResult.data ?? [];
  const items = itemsResult.data ?? [];
  const slaRows = slaResult.data ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Catálogo de Serviços</h1>
          <p className="text-sm text-muted-foreground">
            Solicite serviços de TI disponíveis para sua área.
          </p>
        </div>
        {isItStaff && (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/catalog/categories/new">
                <Plus className="mr-2 h-4 w-4" />
                Categoria
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/catalog/slas/new">
                <Plus className="mr-2 h-4 w-4" />
                SLA
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/catalog/items/new">
                <Plus className="mr-2 h-4 w-4" />
                Item
              </Link>
            </Button>
          </div>
        )}
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
                <div className="mb-1 flex items-center justify-between gap-3">
                  <h2 className="font-medium text-foreground">{category.name}</h2>
                  {isItStaff && (
                    <div className="flex items-center gap-2">
                      {!category.is_active && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          Inativa
                        </span>
                      )}
                      <form action={toggleCategoryActive}>
                        <input name="category_id" type="hidden" value={category.id} />
                        <input name="is_active" type="hidden" value={(!category.is_active).toString()} />
                        <Button size="sm" type="submit" variant="ghost">
                          {category.is_active ? "Desativar" : "Ativar"}
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
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
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-foreground">{item.name}</h3>
                            {isItStaff && !item.is_active && (
                              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                Inativo
                              </span>
                            )}
                          </div>
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
                          <div className="mt-3 flex items-center gap-2">
                            <Button asChild size="sm">
                              <Link href={`/requests/new?item=${item.id}`}>Solicitar</Link>
                            </Button>
                            {isItStaff && (
                              <form action={toggleItemActive}>
                                <input name="item_id" type="hidden" value={item.id} />
                                <input name="is_active" type="hidden" value={(!item.is_active).toString()} />
                                <Button size="sm" type="submit" variant="ghost">
                                  {item.is_active ? "Desativar" : "Ativar"}
                                </Button>
                              </form>
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

      {isItStaff && !error && slaRows.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-medium text-foreground">Definições de SLA</h2>
          <ul className="space-y-2">
            {slaRows.map((sla) => (
              <li
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 text-sm shadow-sm"
                key={sla.id}
              >
                <span className="font-medium text-foreground">{sla.name}</span>
                <span className="text-xs text-muted-foreground">
                  Resposta em {formatMinutes(sla.response_time_minutes)} · Resolução em{" "}
                  {formatMinutes(sla.resolution_time_minutes)}
                  {!sla.is_active && " · Inativa"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
