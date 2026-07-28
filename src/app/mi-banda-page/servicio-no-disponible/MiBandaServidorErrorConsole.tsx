"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Debe coincidir con `PARAM_DEBUG_ERROR` en `@/helpers/mi-banda/servidorMiBandaHealth`. */
const QUERY_DEBUG_ERROR = "d";

export function MiBandaServidorErrorConsole() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams.get(QUERY_DEBUG_ERROR);
    if (!raw?.trim()) return;
    try {
      const decoded = decodeURIComponent(raw);
      console.error(
        "[MiBanda] Detalle del error del servidor (modo desarrollo):",
        decoded
      );
    } catch {
      console.error("[MiBanda] Detalle del error (sin decodificar):", raw);
    }
  }, [searchParams]);

  return null;
}
