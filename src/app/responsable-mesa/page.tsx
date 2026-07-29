"use client";

import SeccionAccesos from "@/components/dashboard/SeccionAccesos";
import SeccionBandasConfirmadas from "@/components/dashboard/SeccionBandasConfirmadas";
import SeccionEventosDelDia from "@/components/dashboard/SeccionEventosDelDia";
import SeccionSolicitudesDashboard from "@/components/dashboard/SeccionSolicitudesDashboard";
import SeccionSolicitudesCopaDashboard from "@/components/dashboard/SeccionSolicitudesCopaDashboard";
import InformacionEventoComponent from "@/components/informacion/ifnromacionEventoComponent/InformacionEventoComponet";
import InformacionRegistroEquipoEvaluadorComponent from "@/components/informacion/informacionRegistroEquipoEvaluador/InformacionRegistroEquipoEvaluador";
import FormularioEquipoEvaluadorAgregar from "@/components/formularios/FormularioEquipoEvaluador/FormularioEquipoEvaluadorAgregar";
import FormularioEquipoEvaluadorEditar from "@/components/formularios/FormularioEquipoEvaluador/FormularioEquipoEvaluadorEditar";
import OverleyModal from "@/components/modales/OverleyModal/Page";
import OverleyModalFormulario from "@/components/modales/OverleyModalFormulario/Page";
import { RootState } from "@/app/store";
import {
  activarOverleyFormularioEditarEventos,
  desactivarOverleyInformacionEventos,
  activarOverleyInformacionEventos,
} from "@/features/Eventos/overleysEventosSlice";
import {
  desactivarOverleyFormularioAgregarRegistroEquipoEvaluador,
  desactivarOverleyFormularioEditarRegistroEquipoEvaluador,
  desactivarOverleyInformacionRegistroEquipoEvaluador,
} from "@/features/EquipoEvaluador/OverleyEquipoEvaluador";
import { setEventoSelecionado } from "@/features/Eventos/eventosSlice";
import {
  RESPONSABLE_MESA_DASHBOARD_EVENTOS_QUERY_KEY,
  useResponsableMesaDashboardData,
} from "@/hooks/dashboard/useResponsableMesaDashboardData";
import { useGestionEstadoEvento } from "@/hooks/eventos/useGestionEstadoEvento";
import { registroEventoDatosAmpleosInterface } from "@/models";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";

export default function ResponsableMesaPage() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const eventoSeleccionadoRedux = useSelector((s: RootState) => s.eventos.EventoSeleccionado);
  const abrirInfoEvento = useSelector(
    (s: RootState) => s.overleyEventos.activadorOverleyInformacionEventos,
  );
  const activadorInformacionRegistroEquipoEvaluador = useSelector(
    (s: RootState) => s.overleyRegistroEquipoEvaluador.activadorOverleyInformacionRegistroEquipoEvaluador,
  );
  const activadorOverleyFormularioEditarRegistroEquipoEvaluador = useSelector(
    (s: RootState) =>
      s.overleyRegistroEquipoEvaluador.activadorOverleyFormularioEditarRegistroEquipoEvaluador,
  );
  const activadorOverleyFormularioAgregarRegistroEquipoEvaluador = useSelector(
    (s: RootState) =>
      s.overleyRegistroEquipoEvaluador.activadorOverleyFormularioAgregarRegistroEquipoEvaluador,
  );
  const registroEquipoEvaluadorSeleccionado = useSelector(
    (s: RootState) => s.registrosEquipoEvaliador.registrosEquipoEvaliadorSeleccionado,
  );

  const [openFormularioAgregarMiembroEquipoEvaluador, setOpenFormularioAgregarMiembroEquipoEvaluador] =
    useState(false);

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
    refetchDashboard,
  } = useResponsableMesaDashboardData();

  const { fusionarYRevalidarEstadoEvento } = useGestionEstadoEvento(RESPONSABLE_MESA_DASHBOARD_EVENTOS_QUERY_KEY);

  const cerrarInfoEvento = () => dispatch(desactivarOverleyInformacionEventos());

  const abrirDetalleEvento = (ev: registroEventoDatosAmpleosInterface) => {
    dispatch(setEventoSelecionado(ev));
    dispatch(activarOverleyInformacionEventos());
  };

  const refrescarEquipoEvaluadorEvento = async (idEvento: string) => {
    await queryClient.invalidateQueries({ queryKey: ["equipoEvaluador", idEvento] });
  };

  const irAEventosParaEditar = () => {
    cerrarInfoEvento();
    dispatch(activarOverleyFormularioEditarEventos());
  };

  const cerrarInformacionRegistroEquipoEvaluador = () => {
    dispatch(desactivarOverleyInformacionRegistroEquipoEvaluador());
  };
  const cerrarFormularioEditarRegistroEquipoEvaluador = () => {
    dispatch(desactivarOverleyFormularioEditarRegistroEquipoEvaluador());
  };
  const cerrarFormularioAgregarRegistroEquipoEvaluador = () => {
    dispatch(desactivarOverleyFormularioAgregarRegistroEquipoEvaluador());
  };

  return (
    <>
      <section id="modales-responsable-mesa">
        <OverleyModal open={activadorInformacionRegistroEquipoEvaluador} onClose={cerrarInformacionRegistroEquipoEvaluador}>
          {registroEquipoEvaluadorSeleccionado ? (
            <InformacionRegistroEquipoEvaluadorComponent
              registroEquipoEvaluador={registroEquipoEvaluadorSeleccionado}
            />
          ) : null}
        </OverleyModal>

        <OverleyModalFormulario
          open={activadorOverleyFormularioAgregarRegistroEquipoEvaluador}
          onClose={cerrarFormularioAgregarRegistroEquipoEvaluador}
        >
          {eventoSeleccionadoRedux ? (
            <FormularioEquipoEvaluadorAgregar
              onClose={cerrarFormularioAgregarRegistroEquipoEvaluador}
              idEvento={eventoSeleccionadoRedux.idEvento}
              refresacar={async () => {
                await refrescarEquipoEvaluadorEvento(eventoSeleccionadoRedux.idEvento);
              }}
            />
          ) : null}
        </OverleyModalFormulario>

        <OverleyModalFormulario
          open={activadorOverleyFormularioEditarRegistroEquipoEvaluador}
          onClose={cerrarFormularioEditarRegistroEquipoEvaluador}
        >
          {registroEquipoEvaluadorSeleccionado ? (
            <FormularioEquipoEvaluadorEditar
              registroEquipoEvaluacionAEditar={registroEquipoEvaluadorSeleccionado}
              onClose={cerrarFormularioEditarRegistroEquipoEvaluador}
              refresacar={async () => {
                await refrescarEquipoEvaluadorEvento(registroEquipoEvaluadorSeleccionado.idForaneaEvento);
              }}
            />
          ) : null}
        </OverleyModalFormulario>
      </section>

      <div className="w-full space-y-10 pb-16">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Resumen del día, eventos donde participas en el equipo evaluador, bandas y solicitudes
          </p>
        </header>

        <OverleyModal open={abrirInfoEvento} onClose={cerrarInfoEvento}>
          {eventoSeleccionadoRedux ? (
            <InformacionEventoComponent
              Evento={eventoSeleccionadoRedux}
              onClose={cerrarInfoEvento}
              onRefresh={refetchDashboard}
              onFusionarEstadoEvento={fusionarYRevalidarEstadoEvento}
              openFormEditar={irAEventosParaEditar}
              openFormAgregarEquipoEvaluador={() => setOpenFormularioAgregarMiembroEquipoEvaluador(true)}
            />
          ) : null}
        </OverleyModal>

        <OverleyModalFormulario
          open={openFormularioAgregarMiembroEquipoEvaluador}
          onClose={() => setOpenFormularioAgregarMiembroEquipoEvaluador(false)}
        >
          {eventoSeleccionadoRedux ? (
            <FormularioEquipoEvaluadorAgregar
              onClose={() => setOpenFormularioAgregarMiembroEquipoEvaluador(false)}
              idEvento={eventoSeleccionadoRedux.idEvento}
              refresacar={async () => {
                await refrescarEquipoEvaluadorEvento(eventoSeleccionadoRedux.idEvento);
                await refetchDashboard();
              }}
            />
          ) : null}
        </OverleyModalFormulario>

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
    </>
  );
}
