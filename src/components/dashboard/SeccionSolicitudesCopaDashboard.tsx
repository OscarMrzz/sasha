"use client";

import { detalleSolicitudCopaInterface } from "@/models";
import OverleyModalFormulario from "@/components/modales/OverleyModalFormulario/Page";
import ResponderSolicitudCopa from "@/components/responderSolicitudCopa/Page";
import InformacionSolicitudCopa from "@/components/informacionSolicitudCopa/Page";
import ErrorMessage from "@/components/Message/ErrorMessage";
import ApprovateMessage from "@/components/Message/ApprovateMessage";
import CardRowSolicitudCopa from "@/components/CardRow/CardRowSolicitudCopa";
import { BellIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";

type Props = {
  solicitudes: detalleSolicitudCopaInterface[];
  cargando: boolean;
  refrescandoSolicitudes?: boolean;
  onRefrescarSolicitudes?: () => void | Promise<void>;
  onRespuestaEnviada?: () => void | Promise<void>;
  maxVisible?: number;
};

function textoContadorSolicitudes(n: number) {
  if (n > 99) return "99+";
  return String(n);
}

export default function SeccionSolicitudesCopaDashboard({
  solicitudes,
  cargando,
  refrescandoSolicitudes = false,
  onRefrescarSolicitudes,
  onRespuestaEnviada,
  maxVisible = 80,
}: Props) {
  const [seleccionada, setSeleccionada] =
    useState<detalleSolicitudCopaInterface | null>(null);
  const [openVer, setOpenVer] = useState(false);
  const [openResponder, setOpenResponder] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [openExito, setOpenExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const lista = solicitudes.slice(0, maxVisible);
  const total = solicitudes.length;
  const iconoCargando = cargando || refrescandoSolicitudes;

  const mostrarError = (msg: string) => {
    setMensajeError(msg);
    setOpenError(true);
  };

  const mostrarExito = (msg: string) => {
    setMensajeExito(msg);
    setOpenExito(true);
  };

  const refrescar = async () => {
    await onRefrescarSolicitudes?.();
    await onRespuestaEnviada?.();
  };

  const abrirVer = (s: detalleSolicitudCopaInterface) => {
    setSeleccionada(s);
    setOpenVer(true);
  };

  const abrirResponder = (s: detalleSolicitudCopaInterface) => {
    setSeleccionada(s);
    setOpenResponder(true);
  };

  return (
    <div className="rounded-xl border border-slate-600/40 bg-slate-800/40 p-5">
      <ErrorMessage
        titulo="Error"
        open={openError}
        onClose={() => setOpenError(false)}
        texto={mensajeError}
      />
      <ApprovateMessage
        titulo="Éxito"
        open={openExito}
        onClose={() => setOpenExito(false)}
        texto={mensajeExito}
      />

      <OverleyModalFormulario open={openVer} onClose={() => setOpenVer(false)}>
        {seleccionada ? (
          <InformacionSolicitudCopa
            solicitud={seleccionada}
            onClose={() => setOpenVer(false)}
          />
        ) : null}
      </OverleyModalFormulario>

      <OverleyModalFormulario
        open={openResponder}
        onClose={() => setOpenResponder(false)}
      >
        {seleccionada ? (
          <ResponderSolicitudCopa
            solicitud={seleccionada}
            onClose={() => setOpenResponder(false)}
            onError={mostrarError}
            onSuccess={async (msg) => {
              mostrarExito(msg);
              await refrescar();
            }}
          />
        ) : null}
      </OverleyModalFormulario>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-[#00b4d8] pl-3">
        <h2 className="text-xl font-bold text-white">Solicitudes de copa</h2>
        <div className="flex items-center gap-2 pr-1">
          <div
            className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/80 text-slate-200"
            title={`${total} solicitud${total === 1 ? "" : "es"} pendiente${total === 1 ? "" : "s"}`}
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
              title="Actualizar solicitudes de copa"
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

      <div className="max-h-[38rem] overflow-y-auto rounded-lg border border-slate-600/30 pr-1">
        {cargando ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-700" />
            ))}
          </div>
        ) : lista.length === 0 ? (
          <p className="p-6 text-center text-slate-400">
            No hay solicitudes de copa pendientes para hoy
          </p>
        ) : (
          <div className="flex flex-col gap-3 p-2">
            {lista.map((solicitud, index) => (
              <CardRowSolicitudCopa
                key={solicitud.id_solicitud_copa ?? `${solicitud.idBanda}-${index}`}
                solicitud={solicitud}
                onView={() => abrirVer(solicitud)}
                onResponder={() => abrirResponder(solicitud)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
