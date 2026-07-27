"use client";

import { detalleSolicitudCopaInterface } from "@/interfaces/interfaces";
import { getEstadoSolicitudPill } from "@/component/solicitudSancion/estadoSolicitudPill";
import {
  etiquetaLugarSolicitudCopa,
  etiquetaTipoSolicitudCopa,
} from "@/lib/solicitudCopa/lugarSolicitudCopa";

type Props = {
  solicitud: detalleSolicitudCopaInterface;
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

export default function InformacionSolicitudCopa({ solicitud, onClose }: Props) {
  const pill = getEstadoSolicitudPill(solicitud.estado);
  const fechaSolicitud = solicitud.created_at_solicitud_copa
    ? String(solicitud.created_at_solicitud_copa).slice(0, 10)
    : "—";
  const fechaEvento = solicitud.fechaEvento
    ? String(solicitud.fechaEvento).slice(0, 10)
    : "—";
  const solicitante = [solicitud.nombre_solicitante, solicitud.apelli_solicitante]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold text-white">Detalle de solicitud de copa</h2>
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

      <section className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-300">
          Datos del evento
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo label="Lugar del evento" value={solicitud.LugarEvento} />
          <Campo label="Fecha del evento" value={fechaEvento} />
          <Campo label="Estado del evento" value={solicitud.estado_evento} />
          <Campo label="Solicitante" value={solicitante || null} />
        </div>
      </section>

      <section className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-300">
          Datos de la copa solicitada
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo
            label="Lugar"
            value={etiquetaLugarSolicitudCopa(solicitud.lugar_solicitud_copas)}
          />
          <Campo
            label="Tipo"
            value={etiquetaTipoSolicitudCopa(solicitud.tipo_solicitud_copa)}
          />
        </div>
        <div className="mt-3">
          <p className={labelClass}>Justificación</p>
          <p className={`${valueClass} whitespace-pre-wrap`}>
            {solicitud.justificacion_solicitud_copa?.trim()
              ? solicitud.justificacion_solicitud_copa
              : "—"}
          </p>
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
