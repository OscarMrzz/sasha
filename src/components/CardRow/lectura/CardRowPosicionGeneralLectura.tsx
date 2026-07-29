"use client";

import { EyeIcon } from "@heroicons/react/24/outline";
import type { resultadosEventoInterface } from "@/models";

type Props = {
  resultado: resultadosEventoInterface;
};

export default function CardRowPosicionGeneralLectura({ resultado }: Props) {
  return (
    <div
  
      className="flex min-h-25 w-full cursor-pointer items-center justify-between gap-2 rounded-lg card-row-bg p-4 shadow-md"
    >
      <div className="flex items-center justify-center gap-4">
        <div className="flex w-15 flex-col items-center justify-center">
          <p className="w-full border-b-2 border-slate-400 text-center text-3xl font-black">
            {resultado.rankin}
          </p>
          <p className="w-full pl-2 text-center">{resultado.total}%</p>
        </div>
        <h2>{resultado.nombreBanda}</h2>
      </div>

    </div>
  );
}
