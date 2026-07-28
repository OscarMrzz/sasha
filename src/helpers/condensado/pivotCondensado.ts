import type { rubricaDatosAmpleosInterface, vistaCondensado } from "@/models";

export type FilaCondensadoTabla = {
  idBanda: string;
  nombreBanda: string;
  totalesPorRubrica: Record<string, number>;
};

export type FiltrosCondensado = {
  idCategoria: string;
  idRegion?: string;
  idEvento?: string;
};

export function pivotCondensado(
  rows: vistaCondensado[],
  filtros: FiltrosCondensado,
  rubricas: rubricaDatosAmpleosInterface[],
): FilaCondensadoTabla[] {
  const idCategoria = filtros.idCategoria.trim();
  if (!idCategoria) return [];

  const idRegion = filtros.idRegion?.trim() ?? "";
  const idEvento = filtros.idEvento?.trim() ?? "";

  const filtradas = rows.filter((row) => {
    if (row.idCategoria !== idCategoria) return false;
    if (idRegion && row.idRegion !== idRegion) return false;
    if (idEvento && row.idEvento !== idEvento) return false;
    return true;
  });

  const idsRubrica = rubricas.map((r) => r.idRubrica);
  const map = new Map<
    string,
    { nombreBanda: string; totales: Map<string, number> }
  >();

  for (const row of filtradas) {
    const idBanda = row.idBanda ?? "";
    const idRubrica = row.idRubrica ?? "";
    if (!idBanda || !idRubrica) continue;

    const total = Number(row.total ?? 0);
    const existing = map.get(idBanda);

    if (existing) {
      existing.totales.set(
        idRubrica,
        (existing.totales.get(idRubrica) ?? 0) + total,
      );
    } else {
      const totales = new Map<string, number>();
      totales.set(idRubrica, total);
      map.set(idBanda, {
        nombreBanda: row.nombreBanda ?? "",
        totales,
      });
    }
  }

  return Array.from(map.entries())
    .map(([idBanda, { nombreBanda, totales }]) => {
      const totalesPorRubrica: Record<string, number> = {};
      for (const idRubrica of idsRubrica) {
        totalesPorRubrica[idRubrica] = totales.get(idRubrica) ?? 0;
      }
      return { idBanda, nombreBanda, totalesPorRubrica };
    })
    .sort((a, b) =>
      a.nombreBanda.localeCompare(b.nombreBanda, "es", { sensitivity: "base" }),
    );
}

export function extraerCategoriasConDatos(
  rows: vistaCondensado[],
): { idCategoria: string; nombreCategoria: string }[] {
  const map = new Map<string, string>();
  for (const row of rows) {
    const id = row.idCategoria ?? "";
    if (!id) continue;
    map.set(id, row.nombreCategoria ?? id);
  }
  return Array.from(map.entries())
    .map(([idCategoria, nombreCategoria]) => ({ idCategoria, nombreCategoria }))
    .sort((a, b) =>
      a.nombreCategoria.localeCompare(b.nombreCategoria, "es", {
        sensitivity: "base",
      }),
    );
}

export function extraerEventosCondensado(
  rows: vistaCondensado[],
): { idEvento: string; LugarEvento: string }[] {
  const map = new Map<string, string>();
  for (const row of rows) {
    const id = row.idEvento ?? "";
    if (!id) continue;
    map.set(id, row.LugarEvento ?? id);
  }
  return Array.from(map.entries())
    .map(([idEvento, LugarEvento]) => ({ idEvento, LugarEvento }))
    .sort((a, b) =>
      a.LugarEvento.localeCompare(b.LugarEvento, "es", { sensitivity: "base" }),
    );
}

export function filtrarFilasPorBanda(
  filas: FilaCondensadoTabla[],
  busqueda: string,
): FilaCondensadoTabla[] {
  const q = busqueda.trim().toLowerCase();
  if (!q) return filas;
  return filas.filter((fila) =>
    fila.nombreBanda.toLowerCase().includes(q),
  );
}
