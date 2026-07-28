"use server";

import { getVistaCondensado } from "@/services/servidor/resultadosServices";

export async function fetchVistaCondensado() {
  return getVistaCondensado();
}
