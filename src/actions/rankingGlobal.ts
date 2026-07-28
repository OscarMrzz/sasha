"use server";

import { getRankingGlobalTemporadaActual } from "@/services/servidor/resultadosServices";

export async function fetchRankingGlobal() {
  return getRankingGlobalTemporadaActual();
}
