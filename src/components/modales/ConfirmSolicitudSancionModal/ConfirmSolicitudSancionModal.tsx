import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

type AccionSolicitud = "aprobar" | "denegar";

type ConfirmSolicitudSancionModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  accion: AccionSolicitud;
  nombreBanda?: string | null;
  detalleSancion?: string | null;
  procesando?: boolean;
};

export default function ConfirmSolicitudSancionModal({
  open,
  onClose,
  onConfirm,
  accion,
  nombreBanda,
  detalleSancion,
  procesando = false,
}: ConfirmSolicitudSancionModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const esAprobar = accion === "aprobar";

  useEffect(() => {
    if (open) {
      setTimeout(() => modalRef.current?.showModal(), 10);
    } else {
      modalRef.current?.close();
    }
  }, [open]);

  const titulo = esAprobar ? "Confirmar aprobación" : "Confirmar denegación";
  const confirmLabel = esAprobar ? "Aprobar" : "Denegar";

  const dialogNode =
    open && typeof document !== "undefined" ? (
      <dialog
        ref={modalRef}
        onClose={onClose}
        className="fixed z-[250] inset-0 m-auto flex border-0 outline-none bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-xs animate-zoom-in duration-500"
      >
        <div className="flex w-sm flex-col gap-4 rounded-2xl bg-slate-700 p-6">
          <div className="flex items-center gap-3">
            {esAprobar ? (
              <CheckCircleIcon className="h-7 w-7 shrink-0 text-emerald-400" />
            ) : (
              <ExclamationTriangleIcon className="h-7 w-7 shrink-0 text-red-400" />
            )}
            <h2 className="text-lg font-bold text-white">{titulo}</h2>
          </div>

          <p className="text-sm text-slate-300">
            {esAprobar ? (
              <>
                ¿Confirmas aprobar la solicitud de sanción
                {detalleSancion ? (
                  <>
                    {" "}
                    <span className="font-bold text-white">{detalleSancion}</span>
                  </>
                ) : null}
                {nombreBanda ? (
                  <>
                    {" "}
                    para la banda{" "}
                    <span className="font-bold text-white">{nombreBanda}</span>
                  </>
                ) : null}
                ? Se registrará la aplicación de la sanción.
              </>
            ) : (
              <>
                ¿Confirmas denegar la solicitud
                {nombreBanda ? (
                  <>
                    {" "}
                    de la banda{" "}
                    <span className="font-bold text-white">{nombreBanda}</span>
                  </>
                ) : null}
                ? No se aplicará ninguna sanción.
              </>
            )}
          </p>

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              disabled={procesando}
              onClick={onClose}
              className="cursor-pointer rounded-lg border-2 border-slate-500 px-4 py-2 text-white transition-colors hover:bg-slate-600 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={procesando}
              onClick={async () => {
                await onConfirm();
                onClose();
              }}
              className={`cursor-pointer rounded-lg px-4 py-2 font-semibold text-white transition-colors disabled:opacity-50 ${
                esAprobar
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {procesando ? "Procesando…" : confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    ) : null;

  return (
    <>
      {dialogNode && typeof document !== "undefined"
        ? createPortal(dialogNode, document.body)
        : null}
    </>
  );
}
