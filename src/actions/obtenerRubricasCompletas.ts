"use server";

import { getRubricasCompletas } from "@/services/servidor/rubricasConsultaServices";
import type { rubricaConsultaCompletaInterface } from "@/models";

export async function obtenerRubricasCompletas(
  idForaneaFederacion: string,
  idCategoria?: string,
): Promise<rubricaConsultaCompletaInterface[]> {
  return getRubricasCompletas(idForaneaFederacion, idCategoria);
}
