"use client";

import IndicadorEstadoEvento from "@/component/eventos/IndicadorEstadoEvento";
import ListaEquipoEvaluadorLectura from "@/component/eventos/ListaEquipoEvaluadorLectura";
import OverleyModal from "@/component/modales/OverleyModal/Page";
import { registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";
import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  evento: registroEventoDatosAmpleosInterface;
};

const ETIQUETA_ESTADO_EVENTO: Record<string, string> = {
  pendiente: "Pendiente",
  iniciado: "En curso",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export default function ModalVerEvento({ open, onClose, evento }: Props) {
  const etiquetaEstado =
    ETIQUETA_ESTADO_EVENTO[evento.estado_evento] ?? evento.estado_evento ?? "—";

  return (
    <OverleyModal open={open} onClose={onClose}>
      <div className="h-full w-full min-w-0 max-w-xl overflow-y-auto text-slate-100 scrollbar-estetica">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Información del evento
        </h2>

        <header className="mt-4 border-b border-slate-500/45 pb-6">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3
                data-testid="informacion-evento-lugar"
                className="text-balance text-xl font-bold leading-tight text-white sm:text-2xl"
              >
                {evento.LugarEvento || "—"}
              </h3>
              <IndicadorEstadoEvento iniciado={evento.estado_evento === "iniciado"} />
            </div>
            <p className="mt-2 text-sm text-white/70">
              <span data-testid="informacion-evento-region">
                {evento.regiones?.nombreRegion ? `${evento.regiones.nombreRegion} · ` : ""}
              </span>
              <span data-testid="informacion-evento-fecha">{evento.fechaEvento || "—"}</span>
            </p>
          </div>
        </header>

        <section className="pt-6">
          <h4 className="text-sm font-semibold tracking-tight text-white">Estado</h4>
          <p
            data-testid="informacion-evento-estado"
            className="mt-2 text-sm text-white/80"
          >
            {etiquetaEstado}
          </p>
        </section>

        <section className="pt-6">
          <h4 className="text-sm font-semibold tracking-tight text-white">Equipo evaluador</h4>
          <ListaEquipoEvaluadorLectura idEvento={evento.idEvento} />
        </section>
      </div>
    </OverleyModal>
  );
}
