"use server";

import { getVistaRendimientoPorRubricaTemporadaActual } from "@/lib/services/servidor/resultadosServices";

export async function fetchRendimientoPorRubrica() {
  return getVistaRendimientoPorRubricaTemporadaActual();
}
