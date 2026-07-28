"use client";

import ListaBandasColumna from "@/components/dashboard/ListaBandasColumna";
import { etiquetasEventoDashboard } from "@/components/dashboard/etiquetasEventoDashboard";
import { bandaInterface, registroEventoDatosAmpleosInterface } from "@/models";
import React, { useMemo } from "react";

type Props = {
  eventosColumna: registroEventoDatosAmpleosInterface[];
  bandasPorEvento: Record<string, bandaInterface[]>;
  fechaHoyISO: string;
  cargando: boolean;
};

export default function SeccionBandasConfirmadas({
  eventosColumna,
  bandasPorEvento,
  fechaHoyISO,
  cargando,
}: Props) {
  const eventosDelDia = useMemo(
    () => eventosColumna.filter((evento) => evento.fechaEvento === fechaHoyISO),
    [eventosColumna, fechaHoyISO],
  );

  return (
    <div className="rounded-xl border border-slate-600/40 bg-slate-800/40 p-5">
      <div className="mb-4">
        <h2 className="border-l-4 border-[#00b4d8] pl-3 text-xl font-bold text-white">
          Bandas confirmadas
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Lista de bandas confirmadas para cada evento.
        </p>
      </div>

      <div className="min-h-[18rem] max-h-[40rem] overflow-y-auto pr-1">
        {cargando ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-xl border border-slate-600/40 bg-slate-700/50">
                <div className="h-16 animate-pulse bg-slate-600/50" />
                <div className="space-y-2 p-2">
                  <div className="h-12 animate-pulse rounded-lg bg-slate-700" />
                  <div className="h-12 animate-pulse rounded-lg bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : eventosDelDia.length === 0 ? (
          <p className="py-10 text-center text-slate-400">
            No hay eventos para hoy con bandas que mostrar
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {eventosDelDia.map((ev) => {
              const tags = etiquetasEventoDashboard(ev, fechaHoyISO);
              const bandas = bandasPorEvento[ev.idEvento] ?? [];
              return (
                <article
                  key={ev.idEvento}
                  className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-600/50 bg-slate-700/40 shadow-md"
                >
                  <header className="shrink-0 border-b border-slate-600/50 bg-slate-800/60 px-3 py-3">
                    <h3 className="line-clamp-2 text-base font-bold leading-tight text-white">
                      {ev.LugarEvento || "—"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {ev.regiones?.nombreRegion ?? "—"} · {ev.fechaEvento ?? "—"}
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
                  <div className="max-h-[26rem] min-h-[10rem] flex-1 overflow-y-auto xl:max-h-[30rem]">
                    <ListaBandasColumna bandas={bandas} />
                  </div>
                  <p className="shrink-0 border-t border-slate-600/40 px-3 py-2 text-center text-xs text-slate-500">
                    {bandas.length} banda{bandas.length !== 1 ? "s" : ""}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
