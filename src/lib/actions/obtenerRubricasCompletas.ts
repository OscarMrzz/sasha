"use server";

import { getRubricasCompletas } from "@/lib/services/servidor/rubricasConsultaServices";
import type { rubricaConsultaCompletaInterface } from "@/interfaces/interfaces";

export async function obtenerRubricasCompletas(
  idForaneaFederacion: string,
  idCategoria?: string,
): Promise<rubricaConsultaCompletaInterface[]> {
  return getRubricasCompletas(idForaneaFederacion, idCategoria);
}
