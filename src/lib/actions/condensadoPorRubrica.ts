"use server";

import { getVistaCondensado } from "@/lib/services/servidor/resultadosServices";

export async function fetchVistaCondensado() {
  return getVistaCondensado();
}
