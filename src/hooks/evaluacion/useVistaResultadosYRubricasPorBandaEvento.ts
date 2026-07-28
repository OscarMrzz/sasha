"use client";

import type {
  bandaInterface,
  categoriaInterface,
  RegistroEventoInterface,
} from "@/models";
import RegistroCumplimientoServices from "@/services/RegistroCumplimientosServices";
import RubricasServices from "@/services/rubricasServices";
import { useQuery } from "@tanstack/react-query";

/**
 * Vista de cumplimientos/resultados por banda y evento, más catálogo de rúbricas por categoría.
 * Pensado para reportes y tableros; las claves de caché son neutras.
 */
export function useVistaResultadosYRubricasPorBandaEvento(
  bandaSelecionada: bandaInterface | undefined,
  eventoSeleccionado: RegistroEventoInterface | undefined,
  categoriaSelecionada: categoriaInterface | undefined
) {
  const idBanda = bandaSelecionada?.idBanda;
  const idEvento = eventoSeleccionado?.idEvento;
  const idCategoria = categoriaSelecionada?.idCategoria;

  const { data: resultados = [] } = useQuery({
    queryKey: ["evaluacion", "vistaResultados", "bandaEvento", idBanda, idEvento],
    queryFn: async () => {
      try {
        const svc = new RegistroCumplimientoServices();
        const cumplimientos =
          await svc.getVistaResultadosByIdBandaYEvento(
            idBanda!,
            idEvento!
          );
        return cumplimientos ?? [];
      } catch (error) {
        console.error("Error al obtener resultados por banda y evento:", error);
        return [];
      }
    },
    enabled: Boolean(idBanda && idEvento),
    staleTime: 30_000,
  });

  const { data: rubricasList = [] } = useQuery({
    queryKey: ["evaluacion", "rubricas", "porCategoria", idCategoria],
    queryFn: async () => {
      try {
        const svc = new RubricasServices();
        return await svc.getPorCategoria(idCategoria!);
      } catch (error) {
        console.error("Error al obtener las rubricas:", error);
        return [];
      }
    },
    enabled: Boolean(idCategoria),
    staleTime: 60_000,
  });

  return { resultados, rubricasList };
}
