"use client";

import type { registroEventoDatosAmpleosInterface } from "@/models";
import { cargarEventosDisciplinaAsignados } from "@/helpers/eventos/cargarEventosDisciplinaAsignados";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const EVENTOS_DISCIPLINA_QUERY_KEY = ["diciplina", "mis-eventos"] as const;

export function useEventosDisciplina() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: EVENTOS_DISCIPLINA_QUERY_KEY,
    queryFn: cargarEventosDisciplinaAsignados,
    staleTime: 30_000,
  });

  const fusionarEstadoEvento = useCallback(
    async (idEvento: string, estado_evento: "iniciado" | "finalizado") => {
      queryClient.setQueryData<registroEventoDatosAmpleosInterface[]>(
        EVENTOS_DISCIPLINA_QUERY_KEY,
        (prev) =>
          (prev ?? []).map((e) =>
            e.idEvento === idEvento ? { ...e, estado_evento } : e,
          ),
      );
    },
    [queryClient],
  );

  const refrescar = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: EVENTOS_DISCIPLINA_QUERY_KEY });
  }, [queryClient]);

  return {
    eventosAsignados: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    fusionarEstadoEvento,
    refrescar,
  };
}
