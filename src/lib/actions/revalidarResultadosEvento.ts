"use server";

import { getSupabaseAdmin } from "@/lib/services/servidor/supabaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

const TAG_PREFIXES = [
  "resultados",
  "estadisticas",
  "tabla-posiciones",
  "eventos-banda",
  "sanciones",
] as const;

const GLOBAL_TAGS = [
  "resultados-global",
  "estadisticas-global",
  "tabla-posiciones-global",
  "eventos-banda-global",
  "sanciones-global",
  "vista-rendimiento-por-rubrica-temporada-actual",
  "vista-ranking-global-temporada-actual",
  "copas-temporada",
] as const;

async function revalidarIdsBandas(idsBanda: string[]): Promise<number> {
  const ids = [...new Set(idsBanda.map((id) => id.trim()).filter(Boolean))];

  for (const id of ids) {
    for (const prefix of TAG_PREFIXES) {
      revalidateTag(`${prefix}-${id}`, { expire: 0 });
    }
    revalidatePath(`/mi-banda-page/${id}`);
    revalidatePath(`/mi-banda-page/${id}/estadisticas`);
    revalidatePath(`/mi-banda-page/${id}/resultados`);
    revalidatePath(`/mi-banda-page/${id}/tabla-posiciones`);
    revalidatePath(`/mi-banda-page/${id}/sanciones`);
  }

  for (const tag of GLOBAL_TAGS) {
    revalidateTag(tag, { expire: 0 });
  }

  return ids.length;
}

/**
 * Revalida caché Next (Data Cache + rutas mi-banda) para las bandas del evento.
 * Incluye confirmaciones de asistencia y bandas con evaluaciones registradas
 * (en dev muchas bandas solo tienen cumplimientos, sin fila en confirmacion_asistencia).
 */
export async function revalidarBandasDeEvento(idEvento: string): Promise<number> {
  if (!idEvento?.trim()) {
    throw new Error("idEvento es obligatorio.");
  }

  const db = getSupabaseAdmin();
  const [confirmacionRes, evaluacionesRes] = await Promise.all([
    db
      .from("confirmacion_asistencia")
      .select("id_foranea_banda, estado_asistencia")
      .eq("id_foranea_evento", idEvento),
    db
      .from("registroCumplimientoEvaluaciones")
      .select("idForaneaBanda")
      .eq("idForaneaEvento", idEvento),
  ]);

  if (confirmacionRes.error) throw confirmacionRes.error;
  if (evaluacionesRes.error) throw evaluacionesRes.error;

  const idsBanda = [
    ...new Set(
      [
        ...(confirmacionRes.data ?? [])
          .filter(
            (row: { estado_asistencia: boolean | null }) =>
              row.estado_asistencia !== false,
          )
          .map((row: { id_foranea_banda: string | null }) =>
            row.id_foranea_banda?.trim(),
          ),
        ...(evaluacionesRes.data ?? []).map(
          (row: { idForaneaBanda: string | null }) => row.idForaneaBanda?.trim(),
        ),
      ].filter(Boolean) as string[],
    ),
  ];

  return revalidarIdsBandas(idsBanda);
}

/** Refresco manual desde controladores: bandas del evento finalizado. */
export async function revalidarResultadosPorEvento(
  idEvento: string,
): Promise<number> {
  return revalidarBandasDeEvento(idEvento);
}

/** Tras re-seed en dev o para forzar refresco de una banda concreta. */
export async function revalidarResultadosPorIdBanda(
  idBanda: string,
): Promise<number> {
  const id = idBanda?.trim();
  if (!id) throw new Error("idBanda es obligatorio.");
  return revalidarIdsBandas([id]);
}

export async function revalidarResultadosPorRegion(
  idRegion: string,
): Promise<number> {
  const id = idRegion?.trim();
  if (!id) throw new Error("idRegion es obligatorio.");

  const { data, error } = await getSupabaseAdmin()
    .from("bandas")
    .select("idBanda")
    .eq("idForaneaRegion", id);

  if (error) throw error;
  return revalidarIdsBandas((data ?? []).map((row) => String(row.idBanda ?? "")));
}

export async function revalidarResultadosPorCategoria(
  idCategoria: string,
): Promise<number> {
  const id = idCategoria?.trim();
  if (!id) throw new Error("idCategoria es obligatorio.");

  const { data, error } = await getSupabaseAdmin()
    .from("bandas")
    .select("idBanda")
    .eq("idForaneaCategoria", id);

  if (error) throw error;
  return revalidarIdsBandas((data ?? []).map((row) => String(row.idBanda ?? "")));
}
