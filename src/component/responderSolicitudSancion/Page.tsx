"use client";

import { useRef, useState } from "react";
import { vistaDetalleSolicitudSancionInterface } from "@/interfaces/interfaces";
import { updateSolicitudSancion } from "@/lib/services/solicituSancion";
import { createAplicacionSancion } from "@/lib/services/aplicacionSancionesServices";
import PerfilesServices from "@/lib/services/perfilesServices";
import { getEstadoSolicitudPill } from "@/component/solicitudSancion/estadoSolicitudPill";
import ConfirmSolicitudSancionModal from "@/component/modales/ConfirmSolicitudSancionModal/ConfirmSolicitudSancionModal";

type Props = {
  solicitud: vistaDetalleSolicitudSancionInterface;
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

export default function ResponderSolicitudSancion({
  solicitud,
  onSuccess,
  onError,
  onClose,
}: Props) {
  const perfilesServices = useRef(new PerfilesServices());
  const [procesando, setProcesando] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const pill = getEstadoSolicitudPill(solicitud.estado);
  const idSolicitud = solicitud.id_solicitud_sancion ?? "";

  const ejecutarAccion = async (accion: Exclude<ConfirmAction, null>) => {
    if (!idSolicitud) {
      onError("La solicitud no tiene identificador válido.");
      return;
    }
    if (!solicitud.id_sancion || !solicitud.idBanda) {
      onError("Faltan datos de la sanción o la banda para responder.");
      return;
    }

    setProcesando(true);
    try {
      if (accion === "denegar") {
        await updateSolicitudSancion(idSolicitud, { estado: false });
        onSuccess("Solicitud denegada.");
        onClose();
        return;
      }

      const perfil = await perfilesServices.current.getUsuarioLogiado();
      await updateSolicitudSancion(idSolicitud, { estado: true });
      await createAplicacionSancion({
        id_foranea_sancion: solicitud.id_sancion,
        id_foranea_banda: solicitud.idBanda,
        id_foranea_perfil: perfil.idPerfil,
        fecha: new Date().toISOString().slice(0, 10),
        justificacion: solicitud.justificacion ?? null,
      });
      onSuccess("Solicitud aprobada y sanción aplicada.");
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
      <ConfirmSolicitudSancionModal
        open={confirmAction !== null}
        accion={confirmAction ?? "aprobar"}
        nombreBanda={solicitud.nombreBanda}
        detalleSancion={solicitud.detalles_sancion}
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
          <h2 className="text-xl font-bold text-white">Responder solicitud</h2>
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
            Datos de la sanción
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
          </div>
          <div className="mt-3">
            <p className={labelClass}>Justificación</p>
            <p className={`${valueClass} whitespace-pre-wrap`}>
              {solicitud.justificacion?.trim() ? solicitud.justificacion : "—"}
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
