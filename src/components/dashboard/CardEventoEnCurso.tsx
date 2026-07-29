"use client";

import ControlesIniciarPararEvento from "@/components/eventos/ControlesIniciarPararEvento";
import IndicadorEstadoEvento from "@/components/eventos/IndicadorEstadoEvento";
import { registroEventoDatosAmpleosInterface } from "@/models";
import React from "react";
import CirculoProgreso from "./CirculoProgreso";

type Props = {
  evento: registroEventoDatosAmpleosInterface;
  confirmadas: number;
  participaron: number;
  onDoubleClick?: (evento: registroEventoDatosAmpleosInterface) => void;
  onFusionarEstadoEvento?: (idEvento: string, estado_evento: "iniciado" | "finalizado") => void;
  onVer?: (evento: registroEventoDatosAmpleosInterface) => void;
  onJurados?: (evento: registroEventoDatosAmpleosInterface) => void;
  onFiscal?: (evento: registroEventoDatosAmpleosInterface) => void;
  onDisciplina?: (evento: registroEventoDatosAmpleosInterface) => void;
  onBandaEnCancha?: (evento: registroEventoDatosAmpleosInterface) => void;
};

const btnClass =
  "rounded-lg border border-[var(--vz-border-strong)] px-2 py-1.5 text-xs font-medium transition hover:border-[#00b4d8]/60 hover:bg-[#f5f5f5]";

export default function CardEventoEnCurso({
  evento,
  confirmadas,
  participaron,
  onDoubleClick,
  onFusionarEstadoEvento,
  onVer,
  onJurados,
  onFiscal,
  onDisciplina,
  onBandaEnCancha,
}: Props) {
  const porcentaje =
    confirmadas > 0 ? Math.min(100, Math.round((participaron / confirmadas) * 100)) : 0;

  const handleBtn =
    (fn?: (ev: registroEventoDatosAmpleosInterface) => void) =>
    (e: React.MouseEvent) => {
      e.stopPropagation();
      fn?.(evento);
    };

  return (
    <div
      onDoubleClick={() => onDoubleClick?.(evento)}
      className="relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-[var(--vz-border-strong)] bg-white p-4 transition-colors hover:bg-[#fafafa]"
    >
      <div className="absolute right-2 top-2 z-[1] overflow-visible" onDoubleClick={(e) => e.stopPropagation()}>
        <IndicadorEstadoEvento iniciado={evento.estado_evento === "iniciado"} />
      </div>
      <CirculoProgreso porcentaje={porcentaje} size={100} stroke={9} />
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-bold">{evento.LugarEvento || "—"}</h3>
        <p className="mt-1 text-sm text-[var(--app-fg-muted)]">
          Región: {evento.regiones?.nombreRegion ?? "—"}
        </p>
        <p className="mt-2 text-sm">
          <span className="font-semibold text-[#00b4d8]">{participaron}</span>
          <span className="text-[var(--app-fg-muted)]"> / </span>
          <span className="font-medium">{confirmadas}</span>
          <span className="mt-0.5 block text-xs text-[var(--app-fg-muted)]">
            participaron / confirmadas
          </span>
        </p>
      </div>
      <div onDoubleClick={(e) => e.stopPropagation()} className="w-full shrink-0">
        <ControlesIniciarPararEvento
          evento={evento}
          onFusionarEstadoEvento={onFusionarEstadoEvento}
          className="flex justify-center"
        />
      </div>
      <div
        className="grid w-full grid-cols-1 gap-2"
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={btnClass} onClick={handleBtn(onVer)}>
          Ver
        </button>
        <button type="button" className={btnClass} onClick={handleBtn(onJurados)}>
          Jurados
        </button>
        <button type="button" className={btnClass} onClick={handleBtn(onFiscal)}>
          Fiscal
        </button>
        <button type="button" className={btnClass} onClick={handleBtn(onDisciplina)}>
          Disciplina
        </button>
        <button type="button" className={btnClass} onClick={handleBtn(onBandaEnCancha)}>
          Banda en cancha
        </button>
      </div>
    </div>
  );
}
