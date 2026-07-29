"use client";

import SeccionAccesos from "@/components/dashboard/SeccionAccesos";

import SeccionEventosDelDia from "@/components/dashboard/SeccionEventosDelDia";
import SeccionSolicitudesDashboard from "@/components/dashboard/SeccionSolicitudesDashboard";
import SeccionSolicitudesCopaDashboard from "@/components/dashboard/SeccionSolicitudesCopaDashboard";
import InformacionEventoComponent from "@/components/informacion/ifnromacionEventoComponent/InformacionEventoComponet";
import OverleyModal from "@/components/modales/OverleyModal/Page";
import { RootState } from "@/app/store";
import {
  activarOverleyFormularioEditarEventos,
  desactivarOverleyInformacionEventos,
  activarOverleyInformacionEventos,
} from "@/features/Eventos/overleysEventosSlice";
import { setEventoSelecionado } from "@/features/Eventos/eventosSlice";
import { registroEventoDatosAmpleosInterface } from "@/models";
import { useDashboardData } from "@/hooks/dashboard/useDashboardData";
import { useGestionEstadoEvento } from "@/hooks/eventos/useGestionEstadoEvento";
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const eventoSeleccionadoRedux = useSelector((s: RootState) => s.eventos.EventoSeleccionado);
  const abrirInfoEvento = useSelector(
    (s: RootState) => s.overleyEventos.activadorOverleyInformacionEventos,
  );

  const {
    hoy,
    eventosBandasColumnas,
    progresoEvento,
    bandasPorEventoRelevante,
    cargandoEventos,
    solicitudes,
    cargandoSolicitudes,
    refrescandoSolicitudes,
    refetchSolicitudes,
    solicitudesCopa,
    cargandoSolicitudesCopa,
    refrescandoSolicitudesCopa,
    refetchSolicitudesCopa,
  } = useDashboardData();

  const { fusionarYRevalidarEstadoEvento, refetchDashboard } = useGestionEstadoEvento();

  const cerrarInfoEvento = () => dispatch(desactivarOverleyInformacionEventos());

  const abrirDetalleEvento = (ev: registroEventoDatosAmpleosInterface) => {
    dispatch(setEventoSelecionado(ev));
    dispatch(activarOverleyInformacionEventos());
  };

  const irAEventosParaEditar = () => {
    cerrarInfoEvento();
    dispatch(activarOverleyFormularioEditarEventos());
    router.push("/PanelControlPage/eventosHomePage");
  };

  const irAEventosParaEquipo = () => {
    cerrarInfoEvento();
    router.push("/PanelControlPage/eventosHomePage");
  };

  return (
    <div className="w-full space-y-10 pb-16">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Panel · Dashboard</h1>
        <p className="text-sm text-slate-400">Resumen del día, eventos en curso, bandas y solicitudes</p>
      </header>

      <OverleyModal open={abrirInfoEvento} onClose={cerrarInfoEvento}>
        {eventoSeleccionadoRedux ? (
          <InformacionEventoComponent
            Evento={eventoSeleccionadoRedux}
            onClose={cerrarInfoEvento}
            onRefresh={refetchDashboard}
            onFusionarEstadoEvento={fusionarYRevalidarEstadoEvento}
            openFormEditar={irAEventosParaEditar}
            openFormAgregarEquipoEvaluador={irAEventosParaEquipo}
          />
        ) : null}
      </OverleyModal>

      <SeccionEventosDelDia
        fechaHoyISO={hoy}
        cargando={cargandoEventos}
        eventosBandasColumnas={eventosBandasColumnas}
        progresoEvento={progresoEvento}
        abrirDetalleEvento={abrirDetalleEvento}
        onFusionarEstadoEvento={fusionarYRevalidarEstadoEvento}
        onRefresh={refetchDashboard}
      />

    
      

      <SeccionAccesos
        eventos={eventosBandasColumnas}
        fechaHoyISO={hoy}
        cargando={cargandoEventos}
      />

      <SeccionSolicitudesDashboard
        solicitudes={solicitudes}
        cargando={cargandoSolicitudes}
        refrescandoSolicitudes={refrescandoSolicitudes}
        onRefrescarSolicitudes={() => void refetchSolicitudes()}
        onRespuestaEnviada={() => void refetchSolicitudes()}
      />

      <SeccionSolicitudesCopaDashboard
        solicitudes={solicitudesCopa}
        cargando={cargandoSolicitudesCopa}
        refrescandoSolicitudes={refrescandoSolicitudesCopa}
        onRefrescarSolicitudes={() => void refetchSolicitudesCopa()}
        onRespuestaEnviada={() => void refetchSolicitudesCopa()}
      />
    </div>
  );
}
