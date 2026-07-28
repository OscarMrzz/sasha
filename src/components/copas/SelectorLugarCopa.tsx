"use client";

import { cn } from "@/lib/utils";

const LUGARES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

type Props = {
  lugarSeleccionado: number | null;
  onSeleccionar: (lugar: number) => void;
  lugaresOcupados?: number[];
  deshabilitado?: boolean;
};

export default function SelectorLugarCopa({
  lugarSeleccionado,
  onSeleccionar,
  lugaresOcupados = [],
  deshabilitado = false,
}: Props) {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm text-slate-400">
        Toca el lugar de la copa (1 = primer lugar, 10 = décimo).
      </p>
      <div className="flex flex-col gap-3">
        {LUGARES.map((lugar, index) => {
          const ocupado = lugaresOcupados.includes(lugar);
          const seleccionado = lugarSeleccionado === lugar;

          return (
            <button
              key={lugar}
              type="button"
              disabled={deshabilitado || (ocupado && !seleccionado)}
              onClick={() => onSeleccionar(lugar)}
              style={{ animationDelay: `${index * 80}ms` }}
              className={cn(
                "animate-zoom-in flex min-h-16 w-full cursor-pointer flex-row items-center gap-4 rounded-lg border-2 p-3 text-left transition-colors",
                seleccionado
                  ? "evaluar-cumplimiento-neon-selected border-amber-400/60"
                  : ocupado
                    ? "cursor-not-allowed border-slate-600 bg-slate-800/50 opacity-50"
                    : "border-transparent bg-slate-700 hover:bg-slate-600",
                deshabilitado && "pointer-events-none opacity-60",
              )}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-slate-400 text-xl font-black tabular-nums">
                {lugar}
              </span>
              <span className="text-lg font-semibold text-slate-100">
                {lugar === 1
                  ? "Primer lugar"
                  : lugar === 2
                    ? "Segundo lugar"
                    : lugar === 3
                      ? "Tercer lugar"
                      : `${lugar}º lugar`}
              </span>
              {ocupado && !seleccionado && (
                <span className="ml-auto text-xs text-slate-500">Ocupado</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
