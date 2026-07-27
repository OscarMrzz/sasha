"use server";

import type { copaInterface } from "@/interfaces/interfaces";
import {
  eventoPermiteEdicionCopas,
  MENSAJE_COPAS_EVENTO_BLOQUEADO,
} from "@/lib/copas/eventoPermiteEdicionCopas";
import { revalidarBandasDeEvento } from "@/lib/actions/revalidarResultadosEvento";
import { getSupabaseAdmin } from "@/lib/services/servidor/supabaseAdmin";
import { revalidateTag } from "next/cache";

export type CopaAsignacionInput = {
  id_foranea_banda: string;
  lugar: number;
  tipo?: "directo" | "desempate";
  id_copas?: string;
};

async function assertEventoEditable(idEvento: string): Promise<void> {
  const { data, error } = await getSupabaseAdmin()
    .from("registroEventos")
    .select("estado_evento")
    .eq("idEvento", idEvento)
    .single();

  if (error) throw error;
  if (!eventoPermiteEdicionCopas(data?.estado_evento)) {
    throw new Error(MENSAJE_COPAS_EVENTO_BLOQUEADO);
  }
}

export async function guardarCopasEventoCategoria(
  idEvento: string,
  idCategoria: string,
  asignaciones: CopaAsignacionInput[],
) {
  await assertEventoEditable(idEvento);

  if (!asignaciones.length) {
    throw new Error("No hay asignaciones de copas para guardar.");
  }

  const lugares = asignaciones.map((a) => a.lugar);
  const lugaresUnicos = new Set(lugares);
  if (lugaresUnicos.size !== lugares.length) {
    throw new Error(
      "No puede haber dos bandas con el mismo lugar en la misma categoría.",
    );
  }

  for (const a of asignaciones) {
    if (a.lugar < 1 || a.lugar > 10) {
      throw new Error("El lugar debe estar entre 1 y 10.");
    }
  }

  const bandaIds = asignaciones.map((a) => a.id_foranea_banda);
  const { data: bandas, error: errBandas } = await getSupabaseAdmin()
    .from("bandas")
    .select("idBanda, idForaneaCategoria")
    .in("idBanda", bandaIds);

  if (errBandas) throw errBandas;

  const todasMismaCategoria = (bandas ?? []).every(
    (b) => b.idForaneaCategoria === idCategoria,
  );
  if (!todasMismaCategoria || (bandas ?? []).length !== bandaIds.length) {
    throw new Error("Todas las bandas deben pertenecer a la categoría seleccionada.");
  }

  const admin = getSupabaseAdmin();

  for (const asignacion of asignaciones) {
    const payload = {
      id_foranea_evento: idEvento,
      id_foranea_banda: asignacion.id_foranea_banda,
      lugar: asignacion.lugar,
      tipo: asignacion.tipo ?? "directo",
    };

    if (asignacion.id_copas?.trim()) {
      const { error } = await admin
        .from("copas")
        .update(payload)
        .eq("id_copas", asignacion.id_copas);
      if (error) throw error;
    } else {
      const { data: existente } = await admin
        .from("copas")
        .select("id_copas")
        .eq("id_foranea_evento", idEvento)
        .eq("id_foranea_banda", asignacion.id_foranea_banda)
        .maybeSingle();

      if (existente?.id_copas) {
        const { error } = await admin
          .from("copas")
          .update(payload)
          .eq("id_copas", existente.id_copas);
        if (error) throw error;
      } else {
        const { error } = await admin.from("copas").insert(payload);
        if (error) throw error;
      }
    }
  }

  revalidateTag("copas-temporada", { expire: 0 });
  revalidateTag("resultados-global", { expire: 0 });

  try {
    await revalidarBandasDeEvento(idEvento);
  } catch (e) {
    console.error("Error al revalidar tras guardar copas:", e);
  }

  return { ok: true as const };
}

/** Lectura con service role: la tabla copas tiene RLS sin política SELECT en muchos entornos. */
export async function obtenerCopasPorEventoAccion(
  idEvento: string,
): Promise<copaInterface[]> {
  if (!idEvento?.trim()) return [];

  const { data, error } = await getSupabaseAdmin()
    .from("copas")
    .select("*")
    .eq("id_foranea_evento", idEvento)
    .order("lugar", { ascending: true });

  if (error) throw error;
  return (data ?? []) as copaInterface[];
}

export async function eliminarCopaAccion(idCopa: string, idEvento: string) {
  await assertEventoEditable(idEvento);

  const { error } = await getSupabaseAdmin()
    .from("copas")
    .delete()
    .eq("id_copas", idCopa);

  if (error) throw error;

  revalidateTag("copas-temporada", { expire: 0 });
  revalidateTag("resultados-global", { expire: 0 });

  return { ok: true as const };
}
