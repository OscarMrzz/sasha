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
  pendiente: "bg-amber-500/15 text-amber-200 ring-amber-400/30",
  iniciado: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
  finalizado: "bg-slate-500/20 text-slate-300 ring-slate-400/25",
  cancelado: "bg-red-500/15 text-red-200 ring-red-400/30",
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
      className="animate-fade-in overflow-hidden rounded-2xl border border-slate-600/45 bg-gradient-to-br from-slate-800/90 to-slate-900/80 shadow-lg shadow-black/20"
    >
      <header className="border-b border-slate-600/35 bg-slate-800/50 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-50">{evento.LugarEvento}</h2>
              {esHoy ? (
                <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-200 ring-1 ring-sky-400/35">
                  Hoy
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm capitalize text-slate-400">{evento.tipo_evento}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${ESTADO_BADGE_CLASS[evento.estado_evento]}`}
          >
            {ETIQUETA_ESTADO_EVENTO[evento.estado_evento]}
          </span>
        </div>
      </header>

      <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 text-sm text-slate-300">
          <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Lugar</p>
            <p className="font-medium text-slate-100">{evento.LugarEvento}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-sm text-slate-300">
          <CalendarDaysIcon className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Fecha</p>
            <p className="font-medium text-slate-100">{formatearFechaEvento(evento.fechaEvento)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-sm text-slate-300">
          <TagIcon className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tipo de evento</p>
            <p className="font-medium capitalize text-slate-100">{evento.tipo_evento}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-sm text-slate-300">
          <TagIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Cancha</p>
            <p className="font-medium capitalize text-slate-100">
              {evento.tipo_lugar} · {evento.dimensiones_cancha}
            </p>
          </div>
        </div>
      </div>

      <section className="border-t border-slate-600/35 bg-slate-900/35 px-5 py-4">
        <div className="mb-3 flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-sky-400" aria-hidden />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Equipo evaluador</h3>
        </div>
        <ListaEquipoEvaluadorLectura idEvento={evento.idEvento} variant="embedded" />
      </section>
    </article>
  );
}
