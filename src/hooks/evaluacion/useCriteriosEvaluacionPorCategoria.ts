"use client";

import type { categoriaInterface } from "@/models";
import CriteriosServices from "@/services/criteriosServices";
import { useQuery } from "@tanstack/react-query";

/** Criterios de evaluación asociados a una categoría. */
export function useCriteriosEvaluacionPorCategoria(
  categoriaSelecionada: categoriaInterface | undefined
) {
  const idCategoria = categoriaSelecionada?.idCategoria;

  const { data: criteriosList = [] } = useQuery({
    queryKey: ["evaluacion", "criterios", "porCategoria", idCategoria],
    queryFn: async () => {
      try {
        const svc = new CriteriosServices();
        return await svc.getByCategoria(idCategoria!);
      } catch (error) {
        console.error("Error al obtener los criterios:", error);
        return [];
      }
    },
    enabled: Boolean(idCategoria),
    staleTime: 60_000,
  });

  return { criteriosList };
}
