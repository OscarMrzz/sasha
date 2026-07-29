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
      <section className="rounded-2xl border border-amber-500/30 bg-transparent p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-500/15 p-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">
              Penalizaciones
            </h2>
            <p className="text-xs text-[var(--app-fg-muted)]">
              Registros de sanción en la federación
            </p>
            <p className="mt-2 text-3xl font-black tabular-nums text-amber-600">
              {penalizacionesCount}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#00b4d8]/30 bg-transparent p-4 md:p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-[#00b4d8]/15 p-2 text-[#00b4d8]">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">
              Eventos (temporada)
            </h2>
            <p className="text-xs text-[var(--app-fg-muted)]">
              Asistencia según ranking de temporada
            </p>
            <p className="mt-2 text-3xl font-black tabular-nums text-[#00b4d8]">
              {asistenciaEventos ?? "—"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
