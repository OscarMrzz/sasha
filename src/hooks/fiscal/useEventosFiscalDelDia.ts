"use client";

import type { registroEventoDatosAmpleosInterface } from "@/models";
import { cargarEventosAsignadosAlPerfil } from "@/helpers/eventos/cargarEventosAsignadosAlPerfil";
import { filtrarEventosDelDia } from "@/helpers/fechas/eventosDelDia";
import { useQuery } from "@tanstack/react-query";

export const EVENTOS_FISCAL_HOY_QUERY_KEY = [
  "fiscal",
  "eventos-hoy-iniciados",
] as const;

async function cargarEventosFiscalDelDia(): Promise<
  registroEventoDatosAmpleosInterface[]
> {
  const asignados = await cargarEventosAsignadosAlPerfil();
  return filtrarEventosDelDia(asignados).filter(
    (e) => e.estado_evento === "iniciado",
  );
}

export function useEventosFiscalDelDia() {
  const query = useQuery({
    queryKey: EVENTOS_FISCAL_HOY_QUERY_KEY,
    queryFn: cargarEventosFiscalDelDia,
    staleTime: 30_000,
  });

  return {
    eventosValidos: query.data ?? [],
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
