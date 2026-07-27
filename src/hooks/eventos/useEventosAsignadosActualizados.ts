"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  perfilDatosAmpleosInterface,
  RegistroEventoInterface,
  registroEquipoEvaluadorDatosAmpleosInterface,
} from "@/interfaces/interfaces";
import { filtrarEventosDelDia } from "@/lib/fechas/eventosDelDia";
import RegistroEquipoEvaluadorServices from "@/lib/services/registroEquipoEvaluadorServices";
import { useEventosStore } from "@/Store/EventosStore/listEventosStore";

type RefrescarEventosOptions = {
  detectarInicio?: boolean;
  marcarCargaInicial?: boolean;
};

type UseEventosAsignadosActualizadosOptions = {
  refrescarAlMontar?: boolean;
  autoRefreshIntervalMs?: number;
  detectarInicioEnAutoRefresh?: boolean;
};

const obtenerPerfilActivo = (): perfilDatosAmpleosInterface | null => {
  if (typeof window === "undefined") return null;

  const perfilCookie = document.cookie
    .split(";")
    .find((cookie) => cookie.trim().startsWith("perfilActivo="));
  const perfilBruto = perfilCookie ? decodeURIComponent(perfilCookie.split("=")[1]) : null;

  if (!perfilBruto) return null;

  try {
    return JSON.parse(perfilBruto) as perfilDatosAmpleosInterface;
  } catch (error) {
    console.error("No se pudo leer el perfil activo desde la cookie:", error);
    return null;
  }
};

const extraerEventosUnicos = (
  registros: registroEquipoEvaluadorDatosAmpleosInterface[],
): RegistroEventoInterface[] => {
  const eventosPorId = new Map<string, RegistroEventoInterface>();

  registros.forEach((registro) => {
    if (registro.registroEventos?.idEvento) {
      eventosPorId.set(registro.registroEventos.idEvento, registro.registroEventos);
    }
  });

  return Array.from(eventosPorId.values());
};

export function useEventosAsignadosActualizados({
  refrescarAlMontar = true,
  autoRefreshIntervalMs,
  detectarInicioEnAutoRefresh = true,
}: UseEventosAsignadosActualizadosOptions = {}) {
  const { listEventosStore, setEventosStore } = useEventosStore();
  const equipoEvaluadorServices = useRef(new RegistroEquipoEvaluadorServices());
  const primeraCargaEjecutada = useRef(false);

  const [refrescandoEventos, setRefrescandoEventos] = useState(false);
  const [cargaInicialCompletada, setCargaInicialCompletada] = useState(!refrescarAlMontar);
  const [inicioDetectado, setInicioDetectado] = useState(false);
  const [errorRefresco, setErrorRefresco] = useState<string | null>(null);

  const eventosIniciados = useMemo(
    () => listEventosStore.filter((evento) => evento.estado_evento === "iniciado"),
    [listEventosStore],
  );

  const eventosAsignadosHoy = useMemo(
    () => filtrarEventosDelDia(listEventosStore),
    [listEventosStore],
  );

  const refrescarEventos = useCallback(
    async ({
      detectarInicio = true,
      marcarCargaInicial = false,
    }: RefrescarEventosOptions = {}) => {
      setRefrescandoEventos(true);
      setErrorRefresco(null);

      try {
        const perfilActivo = obtenerPerfilActivo();

        if (!perfilActivo?.idPerfil) {
          throw new Error("No hay perfil activo para refrescar eventos asignados.");
        }

        await equipoEvaluadorServices.current.initPerfil();
        const registrosAsignados = await equipoEvaluadorServices.current.getporPerfil(
          perfilActivo.idPerfil,
        );
        const eventosActualizados = extraerEventosUnicos(registrosAsignados);
        const habiaEventosIniciados = listEventosStore.some(
          (evento) => evento.estado_evento === "iniciado",
        );
        const hayEventosIniciadosActualizados = eventosActualizados.some(
          (evento) => evento.estado_evento === "iniciado",
        );

        setEventosStore(eventosActualizados);

        if (detectarInicio && !habiaEventosIniciados && hayEventosIniciadosActualizados) {
          setInicioDetectado(true);
        }

        return eventosActualizados;
      } catch (error) {
        console.error("No se pudieron refrescar los eventos asignados:", error);
        setErrorRefresco("No se pudieron refrescar los eventos. Intenta de nuevo.");
        return listEventosStore;
      } finally {
        setRefrescandoEventos(false);
        if (marcarCargaInicial) {
          setCargaInicialCompletada(true);
        }
      }
    },
    [listEventosStore, setEventosStore],
  );

  useEffect(() => {
    if (!refrescarAlMontar || primeraCargaEjecutada.current) return;

    primeraCargaEjecutada.current = true;
    void refrescarEventos({ detectarInicio: false, marcarCargaInicial: true });
  }, [refrescarAlMontar, refrescarEventos]);

  useEffect(() => {
    if (!autoRefreshIntervalMs || autoRefreshIntervalMs <= 0) return;

    const intervalId = window.setInterval(() => {
      void refrescarEventos({ detectarInicio: detectarInicioEnAutoRefresh });
    }, autoRefreshIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoRefreshIntervalMs, detectarInicioEnAutoRefresh, refrescarEventos]);

  const confirmarInicioDetectado = useCallback(() => {
    setInicioDetectado(false);
  }, []);

  return {
    eventosAsignados: listEventosStore,
    eventosAsignadosHoy,
    eventosIniciados,
    hayEventosIniciados: eventosIniciados.length > 0,
    refrescarEventos,
    refrescandoEventos,
    cargaInicialCompletada,
    cargandoEventosAsignados: !cargaInicialCompletada || refrescandoEventos,
    inicioDetectado,
    confirmarInicioDetectado,
    errorRefresco,
  };
}
