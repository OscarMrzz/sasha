"use client";

import { revalidarBandasDeEvento } from "@/actions/revalidarResultadosEvento";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { DashboardEventosPayload } from "@/hooks/dashboard/useDashboardData";

const DEFAULT_QUERY_KEY_EVENTOS = ["dashboard", "eventos"] as const;
const QUERY_KEY_SOLICITUDES = ["dashboard", "solicitudes"] as const;

/**
 * Fusión de estado de evento en el caché del dashboard + revalidación ISR
 * on-demand de páginas mi-banda-page solo para bandas del evento finalizado.
 */
export function useGestionEstadoEvento(
  eventosQueryKey: readonly unknown[] = DEFAULT_QUERY_KEY_EVENTOS,
) {
  const queryClient = useQueryClient();

  const fusionarYRevalidarEstadoEvento = useCallback(
    async (idEvento: string, estado_evento: "iniciado" | "finalizado") => {
      queryClient.setQueryData<DashboardEventosPayload>(eventosQueryKey, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          eventos: prev.eventos.map((e) =>
            e.idEvento === idEvento ? { ...e, estado_evento } : e,
          ),
        };
      });

      if (estado_evento === "finalizado") {
        try {
          await revalidarBandasDeEvento(idEvento);
        } catch (e) {
          console.error("Error al revalidar páginas de resultados tras finalizar evento:", e);
        }
      }
    },
    [queryClient, eventosQueryKey],
  );

  const refetchDashboard = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: eventosQueryKey }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_SOLICITUDES }),
    ]);
  }, [queryClient, eventosQueryKey]);

  return {
    fusionarYRevalidarEstadoEvento,
    refetchDashboard,
  };
}
