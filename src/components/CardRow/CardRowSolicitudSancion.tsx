import React from "react";
import { vistaDetalleSolicitudSancionInterface } from "@/models";
import MenuMasOpcionesVerResponder from "@/components/ui/MenuMasOpcionesVerResponder";
import { getEstadoSolicitudPill } from "@/components/solicitudSancion/estadoSolicitudPill";

type Props = {
  solicitud: vistaDetalleSolicitudSancionInterface;
  onView: () => void;
  onResponder?: () => void;
};

export default function CardRowSolicitudSancion({
  solicitud,
  onView,
  onResponder,
}: Props) {
  const pill = getEstadoSolicitudPill(solicitud.estado);
  const fechaSolicitud = solicitud.created_at_solicitud_sancion
    ? String(solicitud.created_at_solicitud_sancion).slice(0, 10)
    : "—";

  return (
    <div
      onDoubleClick={onView}
      className="flex min-h-[5rem] w-full flex-wrap items-center justify-between gap-3 rounded-lg card-row-bg p-4 shadow-md cursor-pointer"
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
          {solicitud.detalles_sancion ?? "Sanción sin detalle"}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {solicitud.nombreCategoria ?? "—"} · {solicitud.nombreRegion ?? "—"}
          {solicitud.puntos_sancion != null ? ` · -${solicitud.puntos_sancion} pts` : ""}
          {` · ${fechaSolicitud}`}
        </p>
        {solicitud.justificacion ? (
          <p className="mt-1 line-clamp-2 text-xs text-slate-400">
            {solicitud.justificacion}
          </p>
        ) : null}
      </div>
      <div>
        <MenuMasOpcionesVerResponder onView={onView} onResponder={onResponder} />
      </div>
    </div>
  );
}
