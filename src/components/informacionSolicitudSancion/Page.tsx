"use client";

import { vistaDetalleSolicitudSancionInterface } from "@/models";
import { getEstadoSolicitudPill } from "@/components/solicitudSancion/estadoSolicitudPill";

type Props = {
  solicitud: vistaDetalleSolicitudSancionInterface;
  onClose?: () => void;
};

const labelClass = "text-xs uppercase text-slate-400";
const valueClass = "text-sm text-white";

function Campo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className={valueClass}>{value?.trim() ? value : "—"}</p>
    </div>
  );
}

export default function InformacionSolicitudSancion({ solicitud, onClose }: Props) {
  const pill = getEstadoSolicitudPill(solicitud.estado);
  const fechaSolicitud = solicitud.created_at_solicitud_sancion
    ? String(solicitud.created_at_solicitud_sancion).slice(0, 10)
    : "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold text-white">Detalle de solicitud</h2>
        <span
          className={`rounded-full border px-3 py-0.5 text-xs font-medium ${pill.cls}`}
        >
          {pill.txt}
        </span>
      </div>

      <section className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-300">
          Datos de la banda
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo label="Banda" value={solicitud.nombreBanda} />
          <Campo label="Categoría" value={solicitud.nombreCategoria} />
          <Campo label="Región" value={solicitud.nombreRegion} />
          <Campo label="Fecha solicitud" value={fechaSolicitud} />
        </div>
      </section>

      <section className="rounded-xl border border-sky-500/25 bg-slate-800/70 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-300">
          Justificación de la solicitud
        </h3>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
          {solicitud.justificacion?.trim() ? solicitud.justificacion : "—"}
        </p>
      </section>

      <section className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-300">
          Sanción solicitada
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo label="Detalle" value={solicitud.detalles_sancion} />
          <Campo
            label="Puntos"
            value={
              solicitud.puntos_sancion != null
                ? String(solicitud.puntos_sancion)
                : null
            }
          />
          <Campo label="Versión" value={solicitud.version} />
          <Campo
            label="Fecha creación sanción"
            value={
              solicitud.fecha_creacion_sancion
                ? String(solicitud.fecha_creacion_sancion).slice(0, 10)
                : null
            }
          />
        </div>
      </section>

      {onClose ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border-2 border-slate-500 px-4 py-2 text-white hover:bg-slate-600"
          >
            Cerrar
          </button>
        </div>
      ) : null}
    </div>
  );
}
