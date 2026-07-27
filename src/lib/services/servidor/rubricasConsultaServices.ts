import type { rubricaConsultaCompletaInterface } from "@/interfaces/interfaces";
import { getSupabaseAdmin } from "@/lib/services/servidor/supabaseAdmin";

function ordenarCumplimientos(
  rubricas: rubricaConsultaCompletaInterface[],
): rubricaConsultaCompletaInterface[] {
  return rubricas.map((rubrica) => ({
    ...rubrica,
    criteriosEvalucion: (rubrica.criteriosEvalucion ?? []).map((criterio) => ({
      ...criterio,
      cumplimientos: [...(criterio.cumplimientos ?? [])].sort(
        (a, b) => (a.puntosCumplimiento ?? 0) - (b.puntosCumplimiento ?? 0),
      ),
    })),
  }));
}

export async function getRubricasCompletas(
  idForaneaFederacion: string,
  idCategoria?: string,
): Promise<rubricaConsultaCompletaInterface[]> {
  const idFed = idForaneaFederacion?.trim();
  if (!idFed) {
    throw new Error("No hay federación para consultar rúbricas.");
  }

  let query = getSupabaseAdmin()
    .from("rubricas")
    .select(
      `
      *,
      categorias(*),
      federaciones(*),
      criteriosEvalucion(
        *,
        cumplimientos(*)
      )
    `,
    )
    .eq("idForaneaFederacion", idFed)
    .order("nombreRubrica", { ascending: true });

  if (idCategoria?.trim()) {
    query = query.eq("idForaneaCategoria", idCategoria.trim());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error obteniendo rúbricas completas:", error);
    throw error;
  }

  const rubricas = (data ?? []) as rubricaConsultaCompletaInterface[];
  return ordenarCumplimientos(rubricas);
}
