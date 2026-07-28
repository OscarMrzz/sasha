"use client";

import InformacionSolicitudRevicion from "@/components/informacion/informacionReviciones/InformacionSolicitudRevicion";
import { vistaSolicitudRevicionInterface } from "@/models";
import { useModalInformacionSolicitudRevicionesStore } from "@/store/revicionesStore/modalInformacionSolicitudRevicionStore";
import { EllipsisVerticalIcon } from "@heroicons/react/16/solid";
import { BellIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";

type Props = {
  solicitudes: vistaSolicitudRevicionInterface[];
  cargando: boolean;
  /** true mientras se vuelve a pedir la lista (sin ser la carga inicial) */
  refrescandoSolicitudes?: boolean;
  onRefrescarSolicitudes?: () => void | Promise<void>;
  /** Tras responder una solicitud desde el modal (refresco adicional). */
  onRespuestaEnviada?: () => void | Promise<void>;
  maxVisible?: number;
};

function textoContadorSolicitudes(n: number) {
  if (n > 99) return "99+";
  return String(n);
}

export default function SeccionSolicitudesDashboard({
  solicitudes,
  cargando,
  refrescandoSolicitudes = false,
  onRefrescarSolicitudes,
  onRespuestaEnviada,
  maxVisible = 80,
}: Props) {
  const {
    activadorModalInformacionSolicitudReviciones,
    desactivarModalInformacionSolicitudRevisar,
    activarModalInformacionSolicitudRevisar,
  } = useModalInformacionSolicitudRevicionesStore();

  const [seleccionada, setSeleccionada] = useState<vistaSolicitudRevicionInterface | null>(
    null
  );

  const lista = solicitudes.slice(0, maxVisible);
  const total = solicitudes.length;
  const iconoCargando = cargando || refrescandoSolicitudes;

  const abrir = (s: vistaSolicitudRevicionInterface) => {
    setSeleccionada(s);
    activarModalInformacionSolicitudRevisar();
  };

  return (
    <div className="rounded-xl border border-slate-600/40 bg-slate-800/40 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-[#00b4d8] pl-3">
        <h2 className="text-xl font-bold text-white">Solicitudes de revisión</h2>
        <div className="flex items-center gap-2 pr-1">
          <div
            className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/80 text-slate-200"
            title={`${total} solicitud${total === 1 ? "" : "es"}`}
          >
            <BellIcon className="h-5 w-5" aria-hidden />
            <span
              className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                total > 0
                  ? "bg-[#00b4d8] text-slate-900"
                  : "bg-slate-500/90 text-slate-100"
              }`}
            >
              {textoContadorSolicitudes(total)}
            </span>
          </div>
          {onRefrescarSolicitudes ? (
            <button
              type="button"
              onClick={() => void onRefrescarSolicitudes()}
              disabled={iconoCargando}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-500/50 bg-slate-700/80 px-3 text-sm font-medium text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              title="Actualizar solicitudes"
            >
              <ArrowPathIcon
                className={`h-5 w-5 shrink-0 ${iconoCargando ? "animate-spin" : ""}`}
                aria-hidden
              />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          ) : null}
        </div>
      </div>

      {seleccionada && (
        <InformacionSolicitudRevicion
          open={activadorModalInformacionSolicitudReviciones}
          onClose={desactivarModalInformacionSolicitudRevisar}
          solicitudRevicion={seleccionada}
          onRespuestaEnviada={onRespuestaEnviada}
        />
      )}

      <div className="max-h-[38rem] overflow-y-auto rounded-lg border border-slate-600/30 pr-1">
        {cargando ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-700" />
            ))}
          </div>
        ) : lista.length === 0 ? (
          <p className="p-6 text-center text-slate-400">No hay solicitudes registradas</p>
        ) : (
          <div className="flex flex-col gap-3 p-2">
            {lista.map((solicitud, index) => (
              <div
                key={solicitud.idSolicitud}
                onDoubleClick={() => abrir(solicitud)}
                className="flex cursor-pointer flex-row justify-between rounded-lg bg-slate-700 p-4 shadow-md transition-colors hover:bg-slate-600"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex gap-3">
                    <span className="text-2xl font-black text-slate-500">{index + 1}</span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{solicitud.nombreBanda}</h3>
                      <p className="truncate text-sm text-slate-400">
                        {solicitud.LugarEvento} · {solicitud.nombreRegion}
                      </p>
                      <p className="mt-1 line-clamp-2 text-gray-400">
                        Detalles: {solicitud.detallesSolicitud}
                      </p>
                      <p className="mt-1 text-xs uppercase text-[#00b4d8]/90">
                        Estado: {solicitud.estado}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <EllipsisVerticalIcon
                    onClick={() => abrir(solicitud)}
                    className="h-6 w-6 cursor-pointer text-gray-400 hover:text-gray-300"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
