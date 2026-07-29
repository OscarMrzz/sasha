"use client";

import ListaEquipoEvaluadorLectura from "@/components/eventos/ListaEquipoEvaluadorLectura";
import { RegistroEventoInterface } from "@/models";
import { esEventoDelDia } from "@/helpers/fechas/eventosDelDia";
import { formatearFechaEvento } from "@/helpers/fechas/formatearFechaEvento";
import {
  CalendarDaysIcon,
  MapPinIcon,
  TagIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import React from "react";

const ETIQUETA_ESTADO_EVENTO: Record<RegistroEventoInterface["estado_evento"], string> = {
  pendiente: "Pendiente",
  iniciado: "En curso",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const ESTADO_BADGE_CLASS: Record<RegistroEventoInterface["estado_evento"], string> = {
  pendiente: "bg-amber-50 text-amber-800 ring-amber-200",
  iniciado: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  finalizado: "bg-[#f5f5f5] text-[var(--app-fg)] ring-[var(--vz-border)]",
  cancelado: "bg-rose-50 text-rose-800 ring-rose-200",
};

type Props = {
  evento: RegistroEventoInterface;
  index?: number;
};

export default function CardEventoAsignado({ evento, index = 0 }: Props) {
  const esHoy = esEventoDelDia(evento.fechaEvento);

  return (
    <article
      style={{ animationDelay: `${index * 70}ms` }}
      className="card-row-bg animate-fade-in overflow-hidden rounded-2xl shadow-sm"
    >
      <header className="border-b border-[var(--vz-border)] bg-[#fafafa] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-[var(--app-fg)]">
                {evento.LugarEvento}
              </h2>
              {esHoy ? (
                <span className="rounded-full border border-[var(--brand)]/30 bg-[#e8f8fb] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand)]">
                  Hoy
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm capitalize text-[var(--app-fg-muted)]">{evento.tipo_evento}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${ESTADO_BADGE_CLASS[evento.estado_evento]}`}
          >
            {ETIQUETA_ESTADO_EVENTO[evento.estado_evento]}
          </span>
        </div>
      </header>

      <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 text-sm text-[var(--app-fg)]">
          <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
              Lugar
            </p>
            <p className="font-medium text-[var(--app-fg)]">{evento.LugarEvento}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-sm text-[var(--app-fg)]">
          <CalendarDaysIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
              Fecha
            </p>
            <p className="font-medium text-[var(--app-fg)]">
              {formatearFechaEvento(evento.fechaEvento)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-sm text-[var(--app-fg)]">
          <TagIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand)]" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
              Tipo de evento
            </p>
            <p className="font-medium capitalize text-[var(--app-fg)]">{evento.tipo_evento}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-sm text-[var(--app-fg)]">
          <TagIcon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--app-fg-muted)]" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
              Cancha
            </p>
            <p className="font-medium capitalize text-[var(--app-fg)]">
              {evento.tipo_lugar} · {evento.dimensiones_cancha}
            </p>
          </div>
        </div>
      </div>

      <section className="border-t border-[var(--vz-border)] bg-[#fafafa] px-5 py-4">
        <div className="mb-3 flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-[var(--brand)]" aria-hidden />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--app-fg)]">
            Equipo evaluador
          </h3>
        </div>
        <ListaEquipoEvaluadorLectura idEvento={evento.idEvento} variant="embedded" />
      </section>
    </article>
  );
}
