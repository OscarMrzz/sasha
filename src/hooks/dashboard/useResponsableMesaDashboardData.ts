"use client";

import type {
  bandaInterface,
  detalleSolicitudCopaInterface,
  registroEventoDatosAmpleosInterface,
  vistaSolicitudRevicionInterface,
} from "@/models";
import ConfirmacionAsistenciaServices from "@/services/confirmacionAsistenciaServices";
import BandasServices from "@/services/bandasServices";
import RegistroEventossServices from "@/services/registroEventosServices";
import RegistroEquipoEvaluadorServices from "@/services/registroEquipoEvaluadorServices";
import SolicitudRevicionServices from "@/services/solicitudRevicionServices";
import { getDetalleSolicitudesCopas } from "@/services/solicitudCopasServices";
import { filtrarSolicitudesCopaActivas } from "@/helpers/solicitudCopa/filtrarSolicitudesCopaActivas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import {
  type DashboardEventosPayload,
  fechaHoyLocalISO,
} from "@/hooks/dashboard/useDashboardData";

export const RESPONSABLE_MESA_DASHBOARD_EVENTOS_QUERY_KEY = [
  "dashboard",
  "responsable-mesa",
  "eventos",
] as const;

const QUERY_KEY_SOLICITUDES = ["dashboard", "responsable-mesa", "solicitudes"] as const;
const QUERY_KEY_SOLICITUDES_COPA = [
  "dashboard",
  "responsable-mesa",
  "solicitudes-copa",
] as const;

async function cargarPayloadEventosResponsableMesa(): Promise<DashboardEventosPayload> {
  const reg = new RegistroEventossServices();
  await reg.initPerfil();
  const listaEventosCompleta = await reg.getDatosAmpleos();

  const equipoSvc = new RegistroEquipoEvaluadorServices();
  await equipoSvc.initPerfil();
  const idPerfil = reg.perfil?.idPerfil;
  if (!idPerfil) {
    return {
      eventos: [],
      progresoEvento: {},
      bandasPorEventoRelevante: {},
    };
  }

  const asignaciones = await equipoSvc.getporPerfil(idPerfil);
  const idsAsignados = new Set(asignaciones.map((a) => a.idForaneaEvento));
  const listaEventos = listaEventosCompleta.filter((e) => idsAsignados.has(e.idEvento));

  const bandasFedSvc = new BandasServices();
  await bandasFedSvc.initPerfil();
  const todasBandasFederacion = (await bandasFedSvc.get()) as bandaInterface[];

  const confirmacionSvc = new ConfirmacionAsistenciaServices();

  const hoyStr = fechaHoyLocalISO();
  const relevMap = new Map<string, registroEventoDatosAmpleosInterface>();
  for (const e of listaEventos) {
    if (
      e.fechaEvento === hoyStr ||
      e.estado_evento === "iniciado" ||
      e.estado_evento === "finalizado"
    ) {
      relevMap.set(e.idEvento, e);
    }
  }
  const columnas = Array.from(relevMap.values());

  const bandasMapAcumulado: Record<string, bandaInterface[]> = {};
  const entradas = await Promise.all(
    columnas.map(async (ev) => {
      try {
        const [bandasEvaluadas, bandasConfirmadasList] = await Promise.all([
          reg.getAsistenciaBandasEvento(ev.idEvento),
          confirmacionSvc.getBandasConfirmadasParaEvento(ev.idEvento, todasBandasFederacion),
        ]);
        bandasMapAcumulado[ev.idEvento] = bandasConfirmadasList;
        return [
          ev.idEvento,
          {
            confirmadas: bandasConfirmadasList.length,
            participaron: bandasEvaluadas.length,
          },
        ] as const;
      } catch {
        bandasMapAcumulado[ev.idEvento] = [];
        return [ev.idEvento, { confirmadas: 0, participaron: 0 }] as const;
      }
    }),
  );

  return {
    eventos: listaEventos,
    progresoEvento: Object.fromEntries(entradas) as Record<
      string,
      { confirmadas: number; participaron: number }
    >,
    bandasPorEventoRelevante: { ...bandasMapAcumulado },
  };
}

async function cargarSolicitudesDashboardResponsableMesa(): Promise<
  vistaSolicitudRevicionInterface[]
> {
  const sol = new SolicitudRevicionServices();
  await sol.initPerfil();

  const idPerfil = sol.perfil?.idPerfil;
  if (!idPerfil) return [];

  const equipoSvc = new RegistroEquipoEvaluadorServices();
  await equipoSvc.initPerfil();
  const asignaciones = await equipoSvc.getporPerfil(idPerfil);
  const idsEventos = asignaciones.map((a) => a.idForaneaEvento);

  return sol.getVistaPendientesDelDiaPorEventos(idsEventos, fechaHoyLocalISO());
}

async function cargarSolicitudesCopaDashboardResponsableMesa(): Promise<
  detalleSolicitudCopaInterface[]
> {
  const equipoSvc = new RegistroEquipoEvaluadorServices();
  await equipoSvc.initPerfil();
  const idPerfil = equipoSvc.perfil?.idPerfil;
  if (!idPerfil) return [];

  const asignaciones = await equipoSvc.getporPerfil(idPerfil);
  const idsEventos = asignaciones.map((a) => a.idForaneaEvento);
  const solicitudes = await getDetalleSolicitudesCopas();

  return filtrarSolicitudesCopaActivas(
    solicitudes,
    fechaHoyLocalISO(),
    idsEventos
  );
}

export function useResponsableMesaDashboardData() {
  const queryClient = useQueryClient();

  const eventosQuery = useQuery({
    queryKey: RESPONSABLE_MESA_DASHBOARD_EVENTOS_QUERY_KEY,
    queryFn: cargarPayloadEventosResponsableMesa,
    staleTime: 30_000,
  });

  const solicitudesQuery = useQuery({
    queryKey: QUERY_KEY_SOLICITUDES,
    queryFn: cargarSolicitudesDashboardResponsableMesa,
    staleTime: 30_000,
  });

  const solicitudesCopaQuery = useQuery({
    queryKey: QUERY_KEY_SOLICITUDES_COPA,
    queryFn: cargarSolicitudesCopaDashboardResponsableMesa,
    staleTime: 30_000,
  });

  const hoy = fechaHoyLocalISO();

  const eventos = eventosQuery.data?.eventos ?? [];
  const progresoEvento = eventosQuery.data?.progresoEvento ?? {};
  const bandasPorEventoRelevante = eventosQuery.data?.bandasPorEventoRelevante ?? {};

  const eventosBandasColumnas = useMemo(() => {
    const map = new Map<string, registroEventoDatosAmpleosInterface>();
    for (const e of eventos) {
      if (
        e.fechaEvento === hoy ||
        e.estado_evento === "iniciado" ||
        e.estado_evento === "finalizado"
      ) {
        map.set(e.idEvento, e);
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      const d = (a.fechaEvento || "").localeCompare(b.fechaEvento || "");
      if (d !== 0) return d;
      return (a.LugarEvento || "").localeCompare(b.LugarEvento || "");
    });
  }, [eventos, hoy]);

  const fusionarEstadoEventoDashboard = useCallback(
    (idEvento: string, estado_evento: "iniciado" | "finalizado") => {
      queryClient.setQueryData<DashboardEventosPayload>(
        RESPONSABLE_MESA_DASHBOARD_EVENTOS_QUERY_KEY,
        (prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            eventos: prev.eventos.map((e) =>
              e.idEvento === idEvento ? { ...e, estado_evento } : e,
            ),
          };
        },
      );
    },
    [queryClient],
  );

  const refetchDashboard = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: RESPONSABLE_MESA_DASHBOARD_EVENTOS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_SOLICITUDES }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_SOLICITUDES_COPA }),
    ]);
  }, [queryClient]);

  return {
    hoy,
    eventosBandasColumnas,
    progresoEvento,
    bandasPorEventoRelevante,
    cargandoEventos: eventosQuery.isPending,
    solicitudes: solicitudesQuery.data ?? [],
    cargandoSolicitudes: solicitudesQuery.isPending,
    refrescandoSolicitudes:
      solicitudesQuery.isFetching && !solicitudesQuery.isPending,
    refetchSolicitudes: solicitudesQuery.refetch,
    solicitudesCopa: solicitudesCopaQuery.data ?? [],
    cargandoSolicitudesCopa: solicitudesCopaQuery.isPending,
    refrescandoSolicitudesCopa:
      solicitudesCopaQuery.isFetching && !solicitudesCopaQuery.isPending,
    refetchSolicitudesCopa: solicitudesCopaQuery.refetch,
    fusionarEstadoEventoDashboard,
    refetchDashboard,
  };
}
