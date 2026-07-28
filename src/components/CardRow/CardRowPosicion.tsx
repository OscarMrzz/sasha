"use client";

import { EyeIcon } from "@heroicons/react/24/outline";
import type { vistaResultadosPreliminaresInterface } from "@/models";

type Props = {
  resultado: vistaResultadosPreliminaresInterface;
  onVerDetalle: (resultado: vistaResultadosPreliminaresInterface) => void;
};

export default function CardRowPosicion({ resultado, onVerDetalle }: Props) {
  return (
    <div
      onDoubleClick={() => onVerDetalle(resultado)}
      className="flex min-h-25 w-full cursor-pointer items-center justify-between gap-2 rounded-lg bg-slate-700 p-4 shadow-md hover:bg-slate-600"
    >
      <div className="flex items-center justify-center gap-4">
        <div className="flex w-15 flex-col items-center justify-center ">
          <p className="w-full border-b-2 border-slate-400 text-center text-3xl font-black">
            {resultado.rankin}
          </p>
          <p className="w-full pl-2 text-center">{resultado.total}%</p>
        </div>
        <h2>{resultado.nombreBanda}</h2>
      </div>
      <div className="shrink-0">
        <button
          type="button"
          aria-label="Ver detalles"
          onClick={(e) => {
            e.stopPropagation();
            onVerDetalle(resultado);
          }}
          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-600/80 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primario)]"
        >
          <EyeIcon className="h-6 w-6" aria-hidden />
        </button>
      </div>
    </div>
  );
}
