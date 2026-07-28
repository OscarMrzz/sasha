"use client";

import type { vistaResultadosTenporadaInterface } from "@/models";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export type TablaGeneralProps = {
  filas: vistaResultadosTenporadaInterface[];
  idMiBanda?: string;
  className?: string;
};

export function TablaGeneral({
  filas,
  idMiBanda,
  className,
}: TablaGeneralProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-700/50 bg-slate-700/60 backdrop-blur-sm",
        className
      )}
    >
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-4 md:px-6">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Tabla de posiciones
            </h2>
            <p className="text-xs text-slate-400">
              Todas las bandas de tu categoría en la temporada actual
            </p>
          </div>
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition group-open:rotate-180" />
        </summary>
        <div className="border-t border-slate-700/50 px-2 pb-4 pt-2 md:px-4">
          {!filas.length ? (
            <p className="py-6 text-center text-sm text-slate-500">
              No hay datos de tabla para mostrar.
            </p>
          ) : (
            <ul className="flex max-h-[480px] flex-col gap-2 overflow-y-auto pr-1">
              {filas.map((r, index) => {
                const mine = idMiBanda && r.idBanda === idMiBanda;
                return (
                  <li
                    key={`${r.idBanda}-${r.idCategoria}-${index}`}
                    className={cn(
                      "flex min-h-[4.5rem] flex-row gap-3 rounded-xl border p-3 shadow-sm",
                      mine
                        ? "border-amber-500/40 bg-amber-950/20 ring-1 ring-amber-500/30"
                        : "border-slate-600/40 bg-slate-900/40"
                    )}
                  >
                    <div className="flex w-14 shrink-0 flex-col items-center justify-center border-r border-slate-600/50 pr-3">
                      <span
                        className={cn(
                          "text-xl font-bold tabular-nums",
                          r.rankin != null && r.rankin <= 3
                            ? "text-amber-200"
                            : "text-slate-200"
                        )}
                      >
                        {r.rankin}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-1">
                      <span className="truncate font-semibold text-white">
                        {r.nombreBanda}
                        {mine && (
                          <span className="ml-2 text-xs font-normal text-amber-400">
                            (tú)
                          </span>
                        )}
                      </span>
                      <div className="flex flex-wrap gap-x-3 text-xs text-slate-400">
                        <span>Promedio: {Number(r.promedio).toFixed(2)}%</span>
                        <span>
                          Total: {Number(r.total_despues_sanciones).toFixed(2)}
                        </span>
                        {Number(r.sanciones) > 0 && (
                          <span className="text-amber-400/90">
                            −{Number(r.sanciones).toFixed(2)} sanc.
                          </span>
                        )}
                     
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </details>
    </section>
  );
}
