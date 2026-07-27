"use client";

import type {
  perfilDatosAmpleosInterface,
  RegistroEventoInterface,
} from "@/interfaces/interfaces";
import RegistroEventossServices from "@/lib/services/registroEventosServices";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Eventos a los que la banda del perfil asistió.
 * Útil en Mi Banda y cualquier flujo con `perfil.idForaneaBanda`.
 */
export function useEventosAsistidosPorBanda(
  perfil: perfilDatosAmpleosInterface,
  isPerfilPending = false
) {
  const idBanda = perfil?.idForaneaBanda;

  const { data: eventosList = [], isPending: isPendingEventos } = useQuery({
    queryKey: ["eventos", "asistidosPorBanda", idBanda],
    queryFn: async () => {
      const svc = new RegistroEventossServices();
      return svc.getEventosAsistidoByIdForaneaBanda(idBanda!);
    },
    enabled: Boolean(idBanda),
    staleTime: 60_000,
  });

  const [eventoSeleccionado, setEventoSeleccionado] =
    useState<RegistroEventoInterface>();

  const cargandoEventos =
    isPerfilPending || (Boolean(idBanda) && isPendingEventos);

  return {
    eventosList,
    cargandoEventos,
    eventoSeleccionado,
    setEventoSeleccionado,
  };
}
