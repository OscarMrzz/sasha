"use client";

import GestorCopas from "@/component/copas/GestorCopas";
import RegistroEventossServices from "@/lib/services/registroEventosServices";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

export default function CopasHomePage() {
  const eventosServices = useRef(new RegistroEventossServices());

  const { data: eventos = [], isPending } = useQuery({
    queryKey: ["panel-control", "copas", "eventos"],
    queryFn: async () => {
      await eventosServices.current.initPerfil();
      return eventosServices.current.getDatosAmpleos();
    },
  });

  return (
    <GestorCopas
      eventosFuente={eventos}
      cargandoEventos={isPending}
      filtrarSoloHoyIniciados
      titulo="Copas"
    />
  );
}
