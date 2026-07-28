"use client";

import type { registroEventoDatosAmpleosInterface } from "@/models";
import { revalidarBandasDeEvento } from "@/actions/revalidarResultadosEvento";
import { cargarEventosAsignadosAlPerfil } from "@/helpers/eventos/cargarEventosAsignadosAlPerfil";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const EVENTOS_RESPONSABLE_MESA_QUERY_KEY = ["responsable-mesa", "eventos"] as const;

export function useEventosResponsableMesa() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: EVENTOS_RESPONSABLE_MESA_QUERY_KEY,
    queryFn: cargarEventosAsignadosAlPerfil,
    staleTime: 30_000,
  });

  const fusionarEstadoEvento = useCallback(
    async (idEvento: string, estado_evento: "iniciado" | "finalizado") => {
      queryClient.setQueryData<registroEventoDatosAmpleosInterface[]>(
        EVENTOS_RESPONSABLE_MESA_QUERY_KEY,
        (prev) => (prev ?? []).map((e) => (e.idEvento === idEvento ? { ...e, estado_evento } : e)),
      );

      if (estado_evento === "finalizado") {
        try {
          await revalidarBandasDeEvento(idEvento);
        } catch (e) {
          console.error(
            "Error al revalidar páginas de resultados tras finalizar evento:",
            e,
          );
        }
      }
    },
    [queryClient],
  );

  const refrescar = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: EVENTOS_RESPONSABLE_MESA_QUERY_KEY });
  }, [queryClient]);

  return {
    eventosAsignados: query.data ?? [],
    eventosOriginales: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    fusionarEstadoEvento,
    refrescar,
  };
}
