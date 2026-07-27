"use client";

import SeccionAccesos from "@/component/dashboard/SeccionAccesos";
import SeccionBandasConfirmadas from "@/component/dashboard/SeccionBandasConfirmadas";
import SeccionEventosDelDia from "@/component/dashboard/SeccionEventosDelDia";
import SeccionSolicitudesDashboard from "@/component/dashboard/SeccionSolicitudesDashboard";
import InformacionEventoComponent from "@/component/informacion/ifnromacionEventoComponent/InformacionEventoComponet";
import OverleyModal from "@/component/modales/OverleyModal/Page";
import { RootState } from "@/app/store";
import {
  activarOverleyFormularioEditarEventos,
  desactivarOverleyInformacionEventos,
  activarOverleyInformacionEventos,
} from "@/feacture/Eventos/overleysEventosSlice";
import { setEventoSelecionado } from "@/feacture/Eventos/eventosSlice";
import { registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";
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

      <SeccionBandasConfirmadas
        eventosColumna={eventosBandasColumnas}
        bandasPorEvento={bandasPorEventoRelevante}
        fechaHoyISO={hoy}
        cargando={cargandoEventos}
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
    </div>
  );
}
