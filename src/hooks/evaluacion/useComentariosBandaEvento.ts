"use client";

import type {
  bandaInterface,
  RegistroEventoInterface,
} from "@/interfaces/interfaces";
import RegistroComentariosServices from "@/lib/services/RegistroComentariosServices";
import { useQuery } from "@tanstack/react-query";

/** Comentarios de evaluación ligados a una banda y un evento concretos. */
export function useComentariosBandaEvento(
  bandaSelecionada: bandaInterface | undefined,
  eventoSeleccionado: RegistroEventoInterface | undefined
) {
  const idBanda = bandaSelecionada?.idBanda;
  const idEvento = eventoSeleccionado?.idEvento;

  const { data: comentariosList = [] } = useQuery({
    queryKey: ["evaluacion", "comentarios", "bandaEvento", idBanda, idEvento],
    queryFn: async () => {
      const svc = new RegistroComentariosServices();
      return svc.getPorBandaYEvento(idBanda!, idEvento!);
    },
    enabled: Boolean(idBanda && idEvento),
    staleTime: 30_000,
  });

  return { comentariosList };
}
