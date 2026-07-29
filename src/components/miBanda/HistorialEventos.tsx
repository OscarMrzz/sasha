"use client";

import type { resultadosEventoInterface } from "@/models";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export type HistorialEventosProps = {
  eventos: resultadosEventoInterface[];
  className?: string;
};

function rankBadge(rank: number) {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `${rank}°`;
}

export function HistorialEventos({
  eventos,
  className,
}: HistorialEventosProps) {
  const sorted = [...eventos].sort((a, b) =>
    String(b.fechaEvento).localeCompare(String(a.fechaEvento))
  );

  return (
    <section
      className={cn(
        "card-row-bg rounded-2xl border border-[var(--vz-border)] p-4 md:p-6",
        className
      )}
    >
      <h2 className="mb-1 text-lg font-semibold text-[var(--app-fg)]">
        Historial de eventos
      </h2>
      <p className="mb-4 text-xs text-[var(--app-fg-muted)]">
        Lugar y puntos por cada participación este año
      </p>
      {!sorted.length ? (
        <p className="py-8 text-center text-sm text-[var(--app-fg-muted)]">
          Aún no hay eventos registrados para esta temporada.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((e) => (
            <li
              key={e.idForaneaEvento}
              className="flex flex-col gap-2 rounded-xl border border-[var(--vz-border)] bg-[#fafafa] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{rankBadge(Number(e.rankin))}</span>
                  <span className="truncate font-medium text-[var(--app-fg)]">
                    {e.LugarEvento || "Evento"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 text-xs text-[var(--app-fg-muted)]">
                  <span>{e.fechaEvento}</span>
                  {e.nombreRegion && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {e.nombreRegion}
                    </span>
                  )}
                  {e.nombreCategoria && (
                    <span>{e.nombreCategoria}</span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-row gap-6 sm:flex-col sm:items-end sm:text-right">
                <div>
                  <p className="text-[10px] uppercase text-[var(--app-fg-muted)]">
                    Posición
                  </p>
                  <p className="text-lg font-bold tabular-nums text-amber-800">
                    {Number(e.rankin)}°
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-[var(--app-fg-muted)]">
                    Puntos
                  </p>
                  <p className="text-lg font-bold tabular-nums text-[var(--brand)]">
                    {Number(e.total ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
