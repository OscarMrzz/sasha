"use server";

import { getVistaCopasTemporada } from "@/lib/services/servidor/copasServices";

export async function fetchTablaCopasTemporada() {
  return getVistaCopasTemporada();
}
