"use server";

import { getVistaRendimientoPorRubricaTemporadaActual } from "@/services/servidor/resultadosServices";

export async function fetchRendimientoPorRubrica() {
  return getVistaRendimientoPorRubricaTemporadaActual();
}
