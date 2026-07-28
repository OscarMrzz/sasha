import StartRakingComponet from "@/components/StartRankin/StartRakingComponet";
import type { vistaResultadosTenporadaInterface } from "@/models";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type FilaPosicionModel = vistaResultadosTenporadaInterface & {
  posicionRegional: number;
};

type Props = {
  fila: FilaPosicionModel;
  esMiBanda: boolean;
  index?: number;
};

function StatBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg  px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="mt-1.5 text-base font-semibold leading-snug text-white sm:text-lg">
        {children}
      </div>
    </div>
  );
}

export default function CardRowPosicionRegional({ fila, esMiBanda, index }: Props) {
  const promedioNum = Number(fila.promedio);

  return (
    <div
      data-testid="card-row-posicion"
      data-codigo={fila.idBanda}
      className={cn(
        "flex w-full flex-col gap-5 rounded-xl bg-slate-700 p-5 shadow-md sm:p-6 animate-blurred-fade-in",
        esMiBanda
          ? "ring-2 ring-amber-400/55 ring-offset-2 ring-offset-slate-950"
          : "hover:bg-slate-600/95",
      )}
      style={index != null && index > 0 ? { animationDelay: `${index * 0.1}s` } : undefined}
    >
      <div className="flex flex-row items-start gap-4">
        <span
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-black tabular-nums sm:h-16 sm:w-16 sm:text-2xl",
            fila.posicionRegional <= 3
              ? "bg-amber-500/25 text-amber-100"
              : "bg-slate-600 text-slate-100",
          )}
          aria-label={`Posición ${fila.posicionRegional}`}
        >
          {fila.posicionRegional}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="text-xl font-bold leading-snug text-white break-words sm:text-2xl">
            {fila.nombreBanda}
            {esMiBanda && (
              <span className="ml-2 inline-block text-base font-normal text-amber-300 sm:text-lg">
                (tu banda)
              </span>
            )}
          </h2>
        </div>
      </div>

      <div className="flex flex-row gap-2 justify-between">
        <StatBlock label="Total puntos">
          <span className="tabular-nums text-sky-100">
            {Number(fila.total_despues_sanciones).toFixed(2)}
          </span>
        </StatBlock>
        <StartRakingComponet promedio={promedioNum} size="w-6" />
      </div>
    </div>
  );
}
