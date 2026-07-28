import type { rubricaConsultaCompletaInterface } from "@/models";
import { fromDbMany } from "@/services/mappers/caseMapper";
import { getSupabaseAdmin } from "@/services/servidor/supabaseAdmin";

/**
 * `rubricaConsultaCompletaInterface` conserva el typo histórico
 * `criteriosEvalucion` (sin la "a"); `fromDbMany` convierte
 * `criterios_evaluacion` a `criteriosEvaluacion`, así que se renombra la
 * clave para respetar la interfaz existente.
 */
function mapRubricaConsultaCompletaRow(
  row: Record<string, unknown>,
): rubricaConsultaCompletaInterface {
  const { criteriosEvaluacion, ...rest } = row as Record<string, unknown> & {
    criteriosEvaluacion?: unknown;
  };
  return {
    ...rest,
    criteriosEvalucion: criteriosEvaluacion ?? null,
  } as unknown as rubricaConsultaCompletaInterface;
}

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
      criterios_evaluacion(
        *,
        cumplimientos(*)
      )
    `,
    )
    .eq("id_foranea_federacion", idFed)
    .order("nombre_rubrica", { ascending: true });

  if (idCategoria?.trim()) {
    query = query.eq("id_foranea_categoria", idCategoria.trim());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error obteniendo rúbricas completas:", error);
    throw error;
  }

  const rubricas = fromDbMany<Record<string, unknown>>(data ?? []).map(
    mapRubricaConsultaCompletaRow,
  );
  return ordenarCumplimientos(rubricas);
}
