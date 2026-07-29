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
      <section className="card-row-bg rounded-2xl border border-amber-300 bg-amber-50 p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--app-fg)]">
              Penalizaciones
            </h2>
            <p className="text-xs text-[var(--app-fg-muted)]">
              Registros de sanción en la federación
            </p>
            <p className="mt-2 text-3xl font-black tabular-nums text-amber-800">
              {penalizacionesCount}
            </p>
          </div>
        </div>
      </section>

      <section className="card-row-bg rounded-2xl border border-[var(--vz-border)] p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-[#00b4d8]/15 p-2 text-[var(--brand)]">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[var(--app-fg)]">
              Eventos (temporada)
            </h2>
            <p className="text-xs text-[var(--app-fg-muted)]">
              Asistencia según ranking de temporada
            </p>
            <p className="mt-2 text-3xl font-black tabular-nums text-[var(--brand)]">
              {asistenciaEventos ?? "—"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
