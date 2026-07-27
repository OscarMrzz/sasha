import React from "react";
import { detalleSolicitudCopaInterface } from "@/interfaces/interfaces";
import MenuMasOpcionesVerResponder from "@/components/ui/MenuMasOpcionesVerResponder";
import { getEstadoSolicitudPill } from "@/component/solicitudSancion/estadoSolicitudPill";
import {
  etiquetaLugarSolicitudCopa,
  etiquetaTipoSolicitudCopa,
} from "@/lib/solicitudCopa/lugarSolicitudCopa";

type Props = {
  solicitud: detalleSolicitudCopaInterface;
  onView: () => void;
  onResponder?: () => void;
};

export default function CardRowSolicitudCopa({
  solicitud,
  onView,
  onResponder,
}: Props) {
  const pill = getEstadoSolicitudPill(solicitud.estado);
  const fechaSolicitud = solicitud.created_at_solicitud_copa
    ? String(solicitud.created_at_solicitud_copa).slice(0, 10)
    : "—";
  const fechaEvento = solicitud.fechaEvento
    ? String(solicitud.fechaEvento).slice(0, 10)
    : "—";

  return (
    <div
      onDoubleClick={onView}
      className="flex min-h-[5rem] w-full flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-700 p-4 shadow-md cursor-pointer hover:bg-slate-600"
    >
      <div className="min-w-0 flex-1 pr-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-white">
            {solicitud.nombreBanda ?? "Banda sin nombre"}
          </h2>
          <span
            className={`rounded-full border px-3 py-0.5 text-xs font-medium ${pill.cls}`}
          >
            {pill.txt}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-300">
          {solicitud.LugarEvento ?? "Evento sin lugar"} ·{" "}
          {etiquetaLugarSolicitudCopa(solicitud.lugar_solicitud_copas)} ·{" "}
          {etiquetaTipoSolicitudCopa(solicitud.tipo_solicitud_copa)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {solicitud.nombreCategoria ?? "—"} · {solicitud.nombreRegion ?? "—"}
          {` · Evento: ${fechaEvento} · Solicitud: ${fechaSolicitud}`}
        </p>
        {solicitud.justificacion_solicitud_copa ? (
          <p className="mt-1 line-clamp-2 text-xs text-slate-400">
            {solicitud.justificacion_solicitud_copa}
          </p>
        ) : null}
      </div>
      <div>
        <MenuMasOpcionesVerResponder onView={onView} onResponder={onResponder} />
      </div>
    </div>
  );
}
