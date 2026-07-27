"use client";

import type { registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";
import RegistroEventossServices from "@/lib/services/registroEventosServices";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export const EVENTOS_RESPONSABLE_EVENTOS_QUERY_KEY = ["responsable-eventos", "eventos"] as const;

async function cargarTodosLosEventos(): Promise<registroEventoDatosAmpleosInterface[]> {
  const reg = new RegistroEventossServices();
  await reg.initPerfil();
  return reg.getDatosAmpleos();
}

export function useEventosResponsableEventos(
  queryKey: readonly unknown[] = EVENTOS_RESPONSABLE_EVENTOS_QUERY_KEY
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: cargarTodosLosEventos,
    staleTime: 30_000,
  });

  const refrescar = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  const lista = query.data ?? [];

  return {
    eventos: lista,
    eventosOriginales: lista,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refrescar,
  };
}
