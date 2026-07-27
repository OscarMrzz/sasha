"use server";

import { getRankingGlobalTemporadaActual } from "@/lib/services/servidor/resultadosServices";

export async function fetchRankingGlobal() {
  return getRankingGlobalTemporadaActual();
}
