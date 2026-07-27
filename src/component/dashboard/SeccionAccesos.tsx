"use client";

import CardAccesosEvento from "@/component/dashboard/CardAccesosEvento";
import { useAccesosEvento } from "@/hooks/dashboard/useAccesosEvento";
import { registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";
import React, { useMemo } from "react";

type Props = {
  eventos: registroEventoDatosAmpleosInterface[];
  fechaHoyISO: string;
  cargando: boolean;
};

export default function SeccionAccesos({ eventos, fechaHoyISO, cargando }: Props) {
  const eventosDelDia = useMemo(
    () => eventos.filter((ev) => ev.fechaEvento === fechaHoyISO),
    [eventos, fechaHoyISO],
  );
  const { accesosPorEvento, cargandoAccesos, refetchAccesos } = useAccesosEvento(eventosDelDia);
  const cargandoSeccion = cargando || cargandoAccesos;

  return (
    <section className="rounded-xl border border-slate-600/40 bg-slate-800/40 p-5">
      <div className="mb-4">
        <h2 className="border-l-4 border-[#00b4d8] pl-3 text-xl font-bold text-white">Accesos</h2>
        <p className="mt-2 text-sm text-slate-400">
          Activa o desactiva el acceso a la plataforma por categoría en cada evento.
        </p>
      </div>

      <div className="max-h-[40rem] min-h-[14rem] overflow-y-auto pr-1">
        {cargandoSeccion ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-600/40 bg-slate-700/50"
              >
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
            No hay eventos para hoy con accesos que gestionar
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {eventosDelDia.map((evento) => (
              <CardAccesosEvento
                key={evento.idEvento}
                evento={evento}
                categorias={accesosPorEvento[evento.idEvento] ?? []}
                fechaHoyISO={fechaHoyISO}
                onRefresh={refetchAccesos}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
