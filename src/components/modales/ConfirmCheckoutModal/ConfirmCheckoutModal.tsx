import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";

type AccionCheckout = "confirmar" | "denegar";
type TipoConfirmacion = "llegada" | "ingreso";

type ConfirmCheckoutModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  accion: AccionCheckout;
  tipo: TipoConfirmacion;
  nombreBanda?: string | null;
  horaReferencia?: string | null;
  procesando?: boolean;
};

export default function ConfirmCheckoutModal({
  open,
  onClose,
  onConfirm,
  accion,
  tipo,
  nombreBanda,
  horaReferencia,
  procesando = false,
}: ConfirmCheckoutModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const esConfirmar = accion === "confirmar";
  const etiquetaTipo = tipo === "llegada" ? "llegada" : "ingreso";

  useEffect(() => {
    if (open) {
      setTimeout(() => modalRef.current?.showModal(), 10);
    } else {
      modalRef.current?.close();
    }
  }, [open]);

  const titulo = esConfirmar
    ? `Confirmar ${etiquetaTipo}`
    : `Denegar ${etiquetaTipo}`;
  const confirmLabel = esConfirmar ? "Confirmar" : "Denegar";

  const dialogNode =
    open && typeof document !== "undefined" ? (
      <dialog
        ref={modalRef}
        onClose={onClose}
        className="fixed z-[250] inset-0 m-auto flex border-0 outline-none bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-xs animate-zoom-in duration-500"
      >
        <div className="flex w-sm flex-col gap-4 rounded-2xl bg-slate-700 p-6">
          <div className="flex items-center gap-3">
            {esConfirmar ? (
              <CheckCircleIcon className="h-7 w-7 shrink-0 text-emerald-400" />
            ) : (
              <ExclamationTriangleIcon className="h-7 w-7 shrink-0 text-red-400" />
            )}
            <h2 className="text-lg font-bold text-white">{titulo}</h2>
          </div>

          <p className="text-sm text-slate-300">
            {esConfirmar ? (
              <>
                ¿Seguro que deseas confirmar la hora de {etiquetaTipo}
                {nombreBanda ? (
                  <>
                    {" "}
                    de la banda{" "}
                    <span className="font-bold text-white">{nombreBanda}</span>
                  </>
                ) : null}
                {horaReferencia ? (
                  <>
                    {" "}
                    ({horaReferencia})?
                  </>
                ) : (
                  "?"
                )}
              </>
            ) : (
              <>
                ¿Seguro que deseas denegar la hora de {etiquetaTipo}
                {nombreBanda ? (
                  <>
                    {" "}
                    de la banda{" "}
                    <span className="font-bold text-white">{nombreBanda}</span>
                  </>
                ) : null}
                ?
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
                esConfirmar
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
