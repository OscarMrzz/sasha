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
  "rounded-lg border border-slate-500/60 px-2 py-1.5 text-xs font-medium text-white transition hover:border-[#00b4d8]/60 hover:bg-slate-600/80";

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
      className="relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-slate-600/50 bg-slate-700 p-4 shadow-md transition-colors hover:bg-slate-600"
    >
      <div className="absolute right-3 top-3 z-[1]" onDoubleClick={(e) => e.stopPropagation()}>
        <IndicadorEstadoEvento iniciado={evento.estado_evento === "iniciado"} />
      </div>
      <CirculoProgreso porcentaje={porcentaje} size={100} stroke={9} />
      <div className="min-w-0 flex-1">
        <h3 className=" text-lg font-bold text-white">{evento.LugarEvento || "—"}</h3>
        <p className="mt-1 text-sm text-slate-400">
          Región: {evento.regiones?.nombreRegion ?? "—"}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          <span className="font-semibold text-[#00b4d8]">{participaron}</span>
          <span className="text-slate-500"> / </span>
          <span className="font-medium">{confirmadas}</span>
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
