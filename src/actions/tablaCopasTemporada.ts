"use server";

import { getVistaCopasTemporada } from "@/services/servidor/copasServices";

export async function fetchTablaCopasTemporada() {
  return getVistaCopasTemporada();
}
