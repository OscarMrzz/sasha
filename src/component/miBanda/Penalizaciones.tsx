"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, CalendarDays } from "lucide-react";

export type PenalizacionesProps = {
  penalizacionesCount: number;
  asistenciaEventos?: number;
  className?: string;
};

export function Penalizaciones({
  penalizacionesCount,
  asistenciaEventos,
  className,
}: PenalizacionesProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2",
        className
      )}
    >
      <section className="rounded-2xl border border-amber-500/20 bg-slate-700/60 p-4 backdrop-blur-sm md:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-500/15 p-2 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Penalizaciones
            </h2>
            <p className="text-xs text-slate-400">
              Registros de sanción en la federación
            </p>
            <p className="mt-2 text-3xl font-black tabular-nums text-amber-200">
              {penalizacionesCount}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-500/20 bg-slate-700/60 p-4 backdrop-blur-sm md:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-500/15 p-2 text-blue-400">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Eventos (temporada)
            </h2>
            <p className="text-xs text-slate-400">
              Asistencia según ranking de temporada
            </p>
            <p className="mt-2 text-3xl font-black tabular-nums text-blue-200">
              {asistenciaEventos ?? "—"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
