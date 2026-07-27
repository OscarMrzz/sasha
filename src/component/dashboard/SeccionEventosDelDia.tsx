"use client";

import CardEventoEnCurso from "@/component/dashboard/CardEventoEnCurso";
import InformacionEventoComponent from "@/component/informacion/ifnromacionEventoComponent/InformacionEventoComponet";
import ModalDiaCancha from "@/component/informacion/ifnromacionEventoComponent/modaBandaCancha";
import ModalDisciplina from "@/component/informacion/ifnromacionEventoComponent/ModalDisciplina";
import ModalFiscal from "@/component/informacion/ifnromacionEventoComponent/ModalFiscal";
import ModalJurados from "@/component/informacion/ifnromacionEventoComponent/ModalJurados";
import OverleyModal from "@/component/modales/OverleyModal/Page";
import { registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";
import React, { useMemo, useState } from "react";

type ModalTipo = "ver" | "jurados" | "fiscal" | "disciplina" | "cancha" | null;

type Props = {
  fechaHoyISO: string;
  cargando: boolean;
  eventosBandasColumnas: registroEventoDatosAmpleosInterface[];
  progresoEvento: Record<string, { confirmadas: number; participaron: number }>;
  abrirDetalleEvento: (ev: registroEventoDatosAmpleosInterface) => void;
  onFusionarEstadoEvento: (idEvento: string, estado_evento: "iniciado" | "finalizado") => void;
  onRefresh?: () => void;
};

export default function SeccionEventosDelDia({
  fechaHoyISO,
  cargando,
  eventosBandasColumnas,
  progresoEvento,
  abrirDetalleEvento,
  onFusionarEstadoEvento,
  onRefresh,
}: Props) {
  const [eventoActivo, setEventoActivo] = useState<registroEventoDatosAmpleosInterface | null>(null);
  const [modalAbierto, setModalAbierto] = useState<ModalTipo>(null);

  const eventosDelDia = useMemo(
    () => eventosBandasColumnas.filter((ev) => ev.fechaEvento === fechaHoyISO),
    [eventosBandasColumnas, fechaHoyISO],
  );

  const abrirModal = (tipo: ModalTipo, evento: registroEventoDatosAmpleosInterface) => {
    setEventoActivo(evento);
    setModalAbierto(tipo);
  };

  const cerrarModal = () => {
    setModalAbierto(null);
    setEventoActivo(null);
  };

  return (
    <>
      <section className="rounded-xl border border-slate-600/40 bg-slate-800/40 p-5">
        <h2 className="mb-2 border-l-4 border-[#00b4d8] pl-3 text-xl font-bold text-white">
          Eventos ({fechaHoyISO})
        </h2>
        <p className="mb-4 text-sm text-slate-400">
          Progreso del evento, inicializacion y finalizacion de eventos.
        </p>
        <div className="max-h-[40rem] min-h-[14rem] overflow-y-auto pr-1">
          {cargando ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 animate-pulse rounded-xl bg-slate-700" />
              ))}
            </div>
          ) : eventosDelDia.length === 0 ? (
            <p className="py-8 text-center text-slate-400">
              No hay eventos programados para hoy
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {eventosDelDia.map((ev) => {
                const p = progresoEvento[ev.idEvento] ?? { confirmadas: 0, participaron: 0 };
                return (
                  <CardEventoEnCurso
                    key={ev.idEvento}
                    evento={ev}
                    confirmadas={p.confirmadas}
                    participaron={p.participaron}
                    onDoubleClick={abrirDetalleEvento}
                    onFusionarEstadoEvento={onFusionarEstadoEvento}
                    onVer={(evento) => abrirModal("ver", evento)}
                    onJurados={(evento) => abrirModal("jurados", evento)}
                    onFiscal={(evento) => abrirModal("fiscal", evento)}
                    onDisciplina={(evento) => abrirModal("disciplina", evento)}
                    onBandaEnCancha={(evento) => abrirModal("cancha", evento)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {eventoActivo ? (
        <>
          <OverleyModal open={modalAbierto === "ver"} onClose={cerrarModal}>
            <InformacionEventoComponent
              Evento={eventoActivo}
              onClose={cerrarModal}
              onRefresh={onRefresh}
              onFusionarEstadoEvento={onFusionarEstadoEvento}
              openFormEditar={() => {}}
              mostrarCambioEstadoEvento
              mostrarEquipoEvaluador={false}
            />
          </OverleyModal>

          <ModalJurados
            open={modalAbierto === "jurados"}
            onClose={cerrarModal}
            evento={eventoActivo}
            onRefresh={onRefresh}
          />

          <ModalFiscal
            open={modalAbierto === "fiscal"}
            onClose={cerrarModal}
            evento={eventoActivo}
            onRefresh={onRefresh}
          />

          <ModalDisciplina
            open={modalAbierto === "disciplina"}
            onClose={cerrarModal}
            evento={eventoActivo}
            onRefresh={onRefresh}
          />

          <ModalDiaCancha
            open={modalAbierto === "cancha"}
            onClose={cerrarModal}
            evento={eventoActivo}
            onRefresh={onRefresh}
          />
        </>
      ) : null}
    </>
  );
}
