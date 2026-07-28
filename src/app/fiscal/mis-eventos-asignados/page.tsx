"use client";

import BuscadorRow from "@/components/buscadores/BuscadorRow";
import CardEventoAsignado from "@/components/eventos/CardEventoAsignado";
import { useEventosAsignadosActualizados } from "@/hooks/eventos/useEventosAsignadosActualizados";
import { coincideBusqueda } from "@/helpers/busqueda/normalizarTextoBusqueda";
import Link from "next/link";
import React, { useMemo, useState } from "react";

export default function MisEventosAsignadosFiscalPage() {
  const [busqueda, setBusqueda] = useState("");
  const { eventosAsignados, cargaInicialCompletada, refrescandoEventos, refrescarEventos } =
    useEventosAsignadosActualizados({ autoRefreshIntervalMs: 30000, detectarInicioEnAutoRefresh: false });

  const eventosFiltrados = useMemo(() => {
    return [...eventosAsignados]
      .sort((a, b) => b.fechaEvento.localeCompare(a.fechaEvento))
      .filter(
        (evento) =>
          coincideBusqueda(evento.LugarEvento, busqueda) ||
          coincideBusqueda(evento.tipo_evento, busqueda),
      );
  }, [busqueda, eventosAsignados]);

  if (!cargaInicialCompletada) {
    return <div className="h-full min-h-[40vh] w-full" />;
  }

  if (eventosAsignados.length === 0) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 px-4">
        <p className="max-w-md text-center text-lg text-slate-300">
          No tienes eventos asignados en este momento.
        </p>
        <Link href="/fiscal" className="text-sm font-semibold text-sky-300 hover:text-sky-200">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Mis eventos asignados</h1>
          <p className="mt-2 text-sm text-slate-400">
            Todos los eventos en los que participas como fiscal ({eventosAsignados.length}).
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refrescarEventos({ detectarInicio: false })}
          disabled={refrescandoEventos}
          className="rounded-xl border border-sky-300/40 bg-sky-400/15 px-4 py-2 text-sm font-semibold text-sky-100 disabled:opacity-60"
        >
          {refrescandoEventos ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      <div className="mb-4">
        <BuscadorRow filtrarBuscador={(e) => setBusqueda(e.target.value)} />
      </div>

      <div className="flex flex-col gap-6">
        {eventosFiltrados.length === 0 && (
          <p className="rounded-md bg-slate-800/60 p-4 text-slate-300">
            No hay eventos que coincidan con tu búsqueda.
          </p>
        )}
        {eventosFiltrados.map((evento, index) => (
          <CardEventoAsignado key={evento.idEvento} evento={evento} index={index} />
        ))}
      </div>
    </div>
  );
}
