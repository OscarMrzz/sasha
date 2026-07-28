"use client";

import type { bandaInterface, RegistroEventoInterface } from "@/models";
import { ResultadosService } from "@/services/resultadosServices";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook unificado para el panel admin: obtiene resultados, rúbricas y comentarios
 * de una banda en un evento dado, en una sola query paralela.
 */
export function useResultadosDetalladosAdmin(
  bandaSelecionada: bandaInterface | undefined,
  eventoSeleccionado: RegistroEventoInterface | undefined
) {
  const idBanda = bandaSelecionada?.idBanda;
  const idEvento = eventoSeleccionado?.idEvento;
  const idCategoria = bandaSelecionada?.idForaneaCategoria;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "resultadosCompletos", idBanda, idEvento],
    queryFn: async () => {
      const svc = new ResultadosService();
      await svc.initPerfil();
      // idCategoria es opcional: si falta, el servicio la infiere desde los resultados
      return svc.getResultadosCompletos(idBanda!, idEvento!, idCategoria ?? undefined);
    },
    // Solo requerimos banda y evento; idCategoria puede estar vacía y el servicio lo resuelve
    enabled: Boolean(idBanda && idEvento),
    staleTime: 30_000,
  });

  return {
    resultados: data?.resultados ?? [],
    rubricasList: data?.rubricasList ?? [],
    comentariosList: data?.comentariosList ?? [],
    puntosRubricas: data?.puntosRubricas ?? {},
    totalGeneral: data?.totalGeneral ?? 0,
    cargandoResultados: isLoading,
  };
}
