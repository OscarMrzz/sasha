"use client";

import { ArrowPathIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  titulo?: string;
  mensaje: string;
  textoBotonConfirmar?: string;
  textoBotonCancelar?: string;
  variante?: "default" | "peligro";
};

export default function ConfirmRefrescarDatosModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  titulo = "Confirmar actualización",
  mensaje,
  textoBotonConfirmar = "Sí, actualizar",
  textoBotonCancelar = "Cancelar",
  variante = "default",
}: Props) {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [open]);

  const dialogNode =
    open && typeof document !== "undefined" ? (
      <dialog
        ref={modalRef}
        onClose={onClose}
        className="fixed inset-0 z-[200] m-auto flex animate-zoom-in border-0 bg-transparent outline-none backdrop:bg-black/50 backdrop:backdrop-blur-xs duration-500"
      >
        <div className="flex w-sm max-w-[calc(100vw-2rem)] flex-col gap-4 rounded-2xl bg-slate-700 p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-400/40 bg-sky-500/15">
              <ArrowPathIcon className="h-5 w-5 text-sky-300" aria-hidden />
            </span>
            <h2 className="text-lg font-bold text-white">{titulo}</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-300">{mensaje}</p>
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="cursor-pointer rounded-lg border-2 border-slate-500 px-4 py-2 text-white transition-colors hover:bg-slate-600 disabled:opacity-50"
            >
              {textoBotonCancelar}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                await onConfirm();
              }}
              className={[
                "inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-semibold transition disabled:opacity-50",
                variante === "peligro"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-[var(--color-primario)] text-slate-950 hover:brightness-110",
              ].join(" ")}
            >
              {variante === "default" && (
                <ArrowPathIcon
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  aria-hidden
                />
              )}
              {loading ? "Procesando…" : textoBotonConfirmar}
            </button>
          </div>
        </div>
      </dialog>
    ) : null;

  return createPortal(dialogNode, document.body);
}
