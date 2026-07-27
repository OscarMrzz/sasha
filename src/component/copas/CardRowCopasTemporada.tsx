import type { vistaCopasTemporadaInterface } from "@/interfaces/interfaces";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type FilaCopasTemporadaModel = vistaCopasTemporadaInterface & {
  posicion: number;
};

type Props = {
  fila: FilaCopasTemporadaModel;
  esMiBanda?: boolean;
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
    <div className="rounded-lg px-3 py-2 sm:px-4 sm:py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="mt-1 text-base font-semibold leading-snug text-white sm:text-lg">
        {children}
      </div>
    </div>
  );
}

export default function CardRowCopasTemporada({
  fila,
  esMiBanda = false,
  index,
}: Props) {
  const maxLugar = Math.max(1, Number(fila.max_lugar) || 3);
  const copasPorLugar = [
    { lugar: 1, cantidad: Number(fila.copas_1) || 0 },
    { lugar: 2, cantidad: Number(fila.copas_2) || 0 },
    { lugar: 3, cantidad: Number(fila.copas_3) || 0 },
    { lugar: 4, cantidad: Number(fila.copas_4) || 0 },
    { lugar: 5, cantidad: Number(fila.copas_5) || 0 },
  ].slice(0, maxLugar);

  return (
    <div
      data-testid="card-row-copas-temporada"
      data-codigo={fila.idBanda}
      className={cn(
        "flex w-full flex-col gap-4 rounded-xl bg-slate-700 p-5 shadow-md sm:gap-5 sm:p-6 animate-blurred-fade-in",
        esMiBanda
          ? "ring-2 ring-amber-400/55 ring-offset-2 ring-offset-slate-950"
          : "hover:bg-slate-600/95",
      )}
      style={
        index != null && index > 0
          ? { animationDelay: `${index * 0.1}s` }
          : undefined
      }
    >
      <div className="flex flex-row items-start gap-4">
        <span
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-black tabular-nums sm:h-16 sm:w-16 sm:text-2xl",
            fila.posicion <= 3
              ? "bg-amber-500/25 text-amber-100"
              : "bg-slate-600 text-slate-100",
          )}
          aria-label={`Posición ${fila.posicion}`}
        >
          {fila.posicion}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="break-words text-xl font-bold leading-snug text-white sm:text-2xl">
            {fila.nombreBanda}
            {esMiBanda && (
              <span className="ml-2 inline-block text-base font-normal text-amber-300 sm:text-lg">
                (tu banda)
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            {fila.nombreRegion} · {fila.nombreCategoria}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {copasPorLugar.map(({ lugar, cantidad }) => (
          <StatBlock key={lugar} label={`${lugar}º lugar`}>
            <span className="tabular-nums">{cantidad}</span>
          </StatBlock>
        ))}
    
      </div>
    </div>
  );
}
