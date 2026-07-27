"use client";

import { useState } from "react";
import { detalleSolicitudCopaInterface } from "@/interfaces/interfaces";
import { updateSolicitudCopa } from "@/lib/services/solicitudCopasServices";
import CopasServices from "@/lib/services/copasServices";
import { getEstadoSolicitudPill } from "@/component/solicitudSancion/estadoSolicitudPill";
import ConfirmSolicitudCopaModal from "@/component/modales/ConfirmSolicitudCopaModal/ConfirmSolicitudCopaModal";
import {
  etiquetaLugarSolicitudCopa,
  etiquetaTipoSolicitudCopa,
} from "@/lib/solicitudCopa/lugarSolicitudCopa";

type Props = {
  solicitud: detalleSolicitudCopaInterface;
  onSuccess: (mensaje: string) => void;
  onError: (msg: string) => void;
  onClose: () => void;
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

type ConfirmAction = "aprobar" | "denegar" | null;

export default function ResponderSolicitudCopa({
  solicitud,
  onSuccess,
  onError,
  onClose,
}: Props) {
  const [procesando, setProcesando] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const pill = getEstadoSolicitudPill(solicitud.estado);
  const idSolicitud = solicitud.id_solicitud_copa ?? "";

  const ejecutarAccion = async (accion: Exclude<ConfirmAction, null>) => {
    if (!idSolicitud) {
      onError("La solicitud no tiene identificador válido.");
      return;
    }
    if (!solicitud.idEvento || !solicitud.idBanda) {
      onError("Faltan datos del evento o la banda para responder.");
      return;
    }
    if (solicitud.lugar_solicitud_copas == null) {
      onError("Falta el lugar de la copa en la solicitud.");
      return;
    }
    if (!solicitud.tipo_solicitud_copa) {
      onError("Falta el tipo de copa en la solicitud.");
      return;
    }

    setProcesando(true);
    try {
      if (accion === "denegar") {
        await updateSolicitudCopa(idSolicitud, { estado: false });
        onSuccess("Solicitud denegada.");
        onClose();
        return;
      }

      await updateSolicitudCopa(idSolicitud, { estado: true });

      const copas = new CopasServices();
      await copas.initPerfil();
      await copas.create({
        id_foranea_evento: solicitud.idEvento,
        id_foranea_banda: solicitud.idBanda,
        lugar: solicitud.lugar_solicitud_copas,
        tipo: solicitud.tipo_solicitud_copa as "directo" | "desempate",
      });

      onSuccess("Solicitud aprobada y copa registrada.");
      onClose();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "No se pudo procesar la solicitud.";
      onError(msg);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <ConfirmSolicitudCopaModal
        open={confirmAction !== null}
        accion={confirmAction ?? "aprobar"}
        nombreBanda={solicitud.nombreBanda}
        lugarCopa={etiquetaLugarSolicitudCopa(solicitud.lugar_solicitud_copas)}
        procesando={procesando}
        onClose={() => {
          if (!procesando) setConfirmAction(null);
        }}
        onConfirm={async () => {
          if (confirmAction) await ejecutarAccion(confirmAction);
        }}
      />

      <div className="flex flex-col gap-6 p-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold text-white">Responder solicitud de copa</h2>
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
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-sky-300">
            Datos del evento
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="Lugar del evento" value={solicitud.LugarEvento} />
            <Campo
              label="Fecha del evento"
              value={
                solicitud.fechaEvento
                  ? String(solicitud.fechaEvento).slice(0, 10)
                  : null
              }
            />
            <Campo label="Estado del evento" value={solicitud.estado_evento} />
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

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={procesando}
            onClick={() => setConfirmAction("denegar")}
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
          >
            Denegar
          </button>
          <button
            type="button"
            disabled={procesando}
            onClick={() => setConfirmAction("aprobar")}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Aprobar
          </button>
        </div>
      </div>
    </>
  );
}
