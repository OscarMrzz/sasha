"use client";

import {
  bandaInterface,
  detalleSolicitudCopaInterface,
  registroEventoDatosAmpleosInterface,
  vistaSolicitudRevicionInterface,
} from "@/interfaces/interfaces";
import ConfirmacionAsistenciaServices from "@/lib/services/confirmacionAsistenciaServices";
import BandasServices from "@/lib/services/bandasServices";
import RegistroEventossServices from "@/lib/services/registroEventosServices";
import SolicitudRevicionServices from "@/lib/services/solicitudRevicionServices";
import { getDetalleSolicitudesCopas } from "@/lib/services/solicitudCopasServices";
import {
  filtrarSolicitudesRevisionActivas,
  mapaEstadoEventos,
} from "@/lib/solicitudesRevicion/filtrarSolicitudesActivas";
import { filtrarSolicitudesCopaActivas } from "@/lib/solicitudCopa/filtrarSolicitudesCopaActivas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

export type DashboardEventosPayload = {
  eventos: registroEventoDatosAmpleosInterface[];
  progresoEvento: Record<string, { confirmadas: number; participaron: number }>;
  bandasPorEventoRelevante: Record<string, bandaInterface[]>;
};

export function fechaHoyLocalISO(): string {
  const hoy = new Date();
  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  const d = String(hoy.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const QUERY_KEY_EVENTOS = ["dashboard", "eventos"] as const;
const QUERY_KEY_SOLICITUDES = ["dashboard", "solicitudes"] as const;
const QUERY_KEY_SOLICITUDES_COPA = ["dashboard", "solicitudes-copa"] as const;

async function cargarPayloadEventosDashboard(): Promise<DashboardEventosPayload> {
  const reg = new RegistroEventossServices();
  await reg.initPerfil();
  const listaEventos = await reg.getDatosAmpleos();

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

async function cargarSolicitudesDashboard(): Promise<vistaSolicitudRevicionInterface[]> {
  const sol = new SolicitudRevicionServices();
  await sol.initPerfil();
  const vistas = await sol.getVista();
  return vistas ?? [];
}

async function cargarSolicitudesCopaDashboard(): Promise<
  detalleSolicitudCopaInterface[]
> {
  return getDetalleSolicitudesCopas();
}

export function useDashboardData() {
  const queryClient = useQueryClient();

  const eventosQuery = useQuery({
    queryKey: QUERY_KEY_EVENTOS,
    queryFn: cargarPayloadEventosDashboard,
    staleTime: 30_000,
  });

  const solicitudesQuery = useQuery({
    queryKey: QUERY_KEY_SOLICITUDES,
    queryFn: cargarSolicitudesDashboard,
    staleTime: 30_000,
  });

  const solicitudesCopaQuery = useQuery({
    queryKey: QUERY_KEY_SOLICITUDES_COPA,
    queryFn: cargarSolicitudesCopaDashboard,
    staleTime: 30_000,
  });

  const hoy = fechaHoyLocalISO();

  const eventos = eventosQuery.data?.eventos ?? [];
  const progresoEvento = eventosQuery.data?.progresoEvento ?? {};
  const bandasPorEventoRelevante = eventosQuery.data?.bandasPorEventoRelevante ?? {};

  const solicitudesActivas = useMemo(() => {
    const mapa = mapaEstadoEventos(eventos);
    return filtrarSolicitudesRevisionActivas(solicitudesQuery.data ?? [], mapa);
  }, [eventos, solicitudesQuery.data]);

  const solicitudesCopaActivas = useMemo(
    () => filtrarSolicitudesCopaActivas(solicitudesCopaQuery.data ?? [], hoy),
    [solicitudesCopaQuery.data, hoy]
  );

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
      queryClient.setQueryData<DashboardEventosPayload>(QUERY_KEY_EVENTOS, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          eventos: prev.eventos.map((e) =>
            e.idEvento === idEvento ? { ...e, estado_evento } : e,
          ),
        };
      });
    },
    [queryClient],
  );

  const refetchDashboard = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_EVENTOS }),
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
    solicitudes: solicitudesActivas,
    cargandoSolicitudes: solicitudesQuery.isPending,
    refrescandoSolicitudes:
      solicitudesQuery.isFetching && !solicitudesQuery.isPending,
    refetchSolicitudes: solicitudesQuery.refetch,
    solicitudesCopa: solicitudesCopaActivas,
    cargandoSolicitudesCopa: solicitudesCopaQuery.isPending,
    refrescandoSolicitudesCopa:
      solicitudesCopaQuery.isFetching && !solicitudesCopaQuery.isPending,
    refetchSolicitudesCopa: solicitudesCopaQuery.refetch,
    fusionarEstadoEventoDashboard,
    refetchDashboard,
  };
}
