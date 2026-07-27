"use client";

import CardRowCategoriaAcceso from "@/component/dashboard/CardRowCategoriaAcceso";
import { etiquetasEventoDashboard } from "@/component/dashboard/etiquetasEventoDashboard";
import { AccesoCategoriaEvento } from "@/hooks/dashboard/useAccesosEvento";
import { registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";
import React from "react";

type Props = {
  evento: registroEventoDatosAmpleosInterface;
  categorias: AccesoCategoriaEvento[];
  fechaHoyISO: string;
  onRefresh: () => void | Promise<void>;
};

export default function CardAccesosEvento({
  evento,
  categorias,
  fechaHoyISO,
  onRefresh,
}: Props) {
  const tags = etiquetasEventoDashboard(evento, fechaHoyISO);

  return (
    <article className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-600/50 bg-slate-700/40 shadow-md">
      <header className="shrink-0 border-b border-slate-600/50 bg-slate-800/60 px-3 py-3">
        <h3 className="line-clamp-2 text-base font-bold leading-tight text-white">
          {evento.LugarEvento || "—"}
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          {evento.regiones?.nombreRegion ?? "—"} · {evento.fechaEvento ?? "—"}
        </p>
        {tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#00b4d8]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#00b4d8]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div className="max-h-[26rem] min-h-[10rem] flex-1 space-y-2 overflow-y-auto p-2 xl:max-h-[30rem]">
        {categorias.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">
            No hay categorías con bandas confirmadas en este evento
          </p>
        ) : (
          categorias.map(({ categoria, acceso }) => (
            <CardRowCategoriaAcceso
              key={categoria.idCategoria}
              categoria={categoria}
              acceso={acceso}
              idEvento={evento.idEvento}
              onCambio={onRefresh}
            />
          ))
        )}
      </div>

      <p className="shrink-0 border-t border-slate-600/40 px-3 py-2 text-center text-xs text-slate-500">
        {categorias.length} categoría{categorias.length !== 1 ? "s" : ""}
      </p>
    </article>
  );
}
