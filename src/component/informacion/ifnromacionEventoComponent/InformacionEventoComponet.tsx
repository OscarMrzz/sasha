"use client";

import BotonCambioEstadoEvento from "@/component/informacion/ifnromacionEventoComponent/BotonCambioEstadoEvento";
import SeccionEquipoEvaluadorEvento from "@/component/informacion/ifnromacionEventoComponent/SeccionEquipoEvaluadorEvento";
import CirculoOnda from "@/component/circuloAnimado/CirculoOlnda";
import { registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";
import React from "react";

type Props = {
  Evento: registroEventoDatosAmpleosInterface;
  onClose: () => void;
  onRefresh?: () => void;
  onFusionarEstadoEvento?: (idEvento: string, estado_evento: "iniciado" | "finalizado") => void;
  openFormEditar: () => void;
  openFormAgregarEquipoEvaluador?: () => void;
  /** Mostrar iniciar / parar / finalizar y revalidaciones. Por defecto: true */
  mostrarCambioEstadoEvento?: boolean;
  /** Sección equipo evaluador. Por defecto: true si se proporciona openFormAgregarEquipoEvaluador */
  mostrarEquipoEvaluador?: boolean;
};

export default function InformacionEventoComponent({
  Evento,
  onClose: _onClose,
  onRefresh,
  onFusionarEstadoEvento,
  openFormEditar: _openFormEditar,
  openFormAgregarEquipoEvaluador,
  mostrarCambioEstadoEvento = true,
  mostrarEquipoEvaluador,
}: Props) {
  const mostrarEquipo = mostrarEquipoEvaluador ?? Boolean(openFormAgregarEquipoEvaluador);
  return (
    <div className="h-full w-full min-w-0 max-w-xl overflow-y-auto text-slate-100 scrollbar-estetica">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Información del evento</h2>

      <header className="mt-4 border-b border-slate-500/45 pb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 justify-between">
            <h3
              data-testid="informacion-evento-lugar"
              className="text-balance text-xl font-bold leading-tight text-white sm:text-2xl"
            >
              {Evento.LugarEvento || "—"}
            </h3>
            <div>
              {Evento.estado_evento === "iniciado" ? (
                <CirculoOnda size="mini" />
              ) : (
                <div className="mr-2 h-6 w-6 rounded-full bg-slate-400" />
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-white/70">
            <span data-testid="informacion-evento-region">
              {Evento.regiones?.nombreRegion ? `${Evento.regiones.nombreRegion} · ` : ""}
            </span>
            <span data-testid="informacion-evento-fecha">{Evento.fechaEvento || "—"}</span>
          </p>
        </div>
      </header>

      {mostrarCambioEstadoEvento ? (
        <BotonCambioEstadoEvento
          Evento={Evento}
          onRefresh={onRefresh}
          onFusionarEstadoEvento={onFusionarEstadoEvento}
        />
      ) : null}

      {mostrarEquipo && openFormAgregarEquipoEvaluador ? (
        <SeccionEquipoEvaluadorEvento Evento={Evento} openFormAgregarEquipoEvaluador={openFormAgregarEquipoEvaluador} />
      ) : null}
    </div>
  );
}
