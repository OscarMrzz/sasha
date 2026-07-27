"use client";

import { categoriaInterface, registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";
import {
  estaActivadoAccesoPorEventoCategoria,
  getCategoriasPorEvento,
} from "@/lib/services/controladoresServices";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export type AccesoCategoriaEvento = {
  categoria: categoriaInterface;
  acceso: boolean;
};

export type AccesosPorEvento = Record<string, AccesoCategoriaEvento[]>;

function accesosEventoQueryKey(eventoIds: string[]) {
  return ["accesos-evento", ...eventoIds.sort()] as const;
}

async function cargarAccesosPorEventos(
  eventos: registroEventoDatosAmpleosInterface[],
): Promise<AccesosPorEvento> {
  const result: AccesosPorEvento = {};

  await Promise.all(
    eventos.map(async (evento) => {
      const categorias = await getCategoriasPorEvento(evento.idEvento);
      const accesos = await Promise.all(
        categorias.map(async (categoria) => ({
          categoria,
          acceso: await estaActivadoAccesoPorEventoCategoria(
            evento.idEvento,
            categoria.idCategoria,
          ),
        })),
      );
      result[evento.idEvento] = accesos;
    }),
  );

  return result;
}

export function useAccesosEvento(eventos: registroEventoDatosAmpleosInterface[]) {
  const queryClient = useQueryClient();
  const eventoIds = useMemo(
    () => eventos.map((evento) => evento.idEvento),
    [eventos],
  );

  const query = useQuery({
    queryKey: accesosEventoQueryKey(eventoIds),
    queryFn: () => cargarAccesosPorEventos(eventos),
    enabled: eventos.length > 0,
    staleTime: 30_000,
  });

  const refetchAccesos = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: accesosEventoQueryKey(eventoIds) });
  }, [eventoIds, queryClient]);

  return {
    accesosPorEvento: query.data ?? {},
    cargandoAccesos: query.isPending,
    refetchAccesos,
  };
}
