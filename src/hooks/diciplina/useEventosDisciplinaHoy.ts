"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { cargarEventosDisciplinaAsignados } from "@/lib/eventos/cargarEventosDisciplinaAsignados";
import { EVENTOS_DISCIPLINA_QUERY_KEY } from "@/hooks/diciplina/useEventosDisciplina";
import PerfilesServices from "@/lib/services/perfilesServices";
import { fechaHoyISO, normalizarFechaEvento } from "@/component/diciplina/checkoutUtils";

export function useEventosDisciplinaHoy() {
  const hoy = fechaHoyISO();

  const { data: perfil, isPending: cargandoPerfil } = useQuery({
    queryKey: ["perfil-logueado-checkout"],
    queryFn: async () => {
      const svc = new PerfilesServices();
      return svc.getUsuarioLogiado();
    },
  });

  const {
    data: eventosAsignados = [],
    isPending: cargandoEventos,
    isError,
    error,
  } = useQuery({
    queryKey: EVENTOS_DISCIPLINA_QUERY_KEY,
    queryFn: cargarEventosDisciplinaAsignados,
    enabled: Boolean(perfil?.idPerfil),
  });

  const eventosHoy = useMemo(
    () =>
      eventosAsignados.filter(
        (ev) => normalizarFechaEvento(ev.fechaEvento) === hoy,
      ),
    [eventosAsignados, hoy],
  );

  const eventoActivo = eventosHoy[0] ?? null;

  return {
    hoy,
    perfil,
    idPerfil: perfil?.idPerfil ?? "",
    eventosHoy,
    eventoActivo,
    eventosAsignados,
    cargando: cargandoPerfil || cargandoEventos,
    sinEventos:
      !cargandoPerfil &&
      !cargandoEventos &&
      !isError &&
      eventosHoy.length === 0,
    isError,
    error,
  };
}
