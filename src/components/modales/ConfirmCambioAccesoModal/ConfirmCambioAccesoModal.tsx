"use client";

import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirmar: () => void | Promise<void>;
  loading?: boolean;
  nombreCategoria: string;
  activando: boolean;
};

export default function ConfirmCambioAccesoModal({
  open,
  onClose,
  onConfirmar,
  loading = false,
  nombreCategoria,
  activando,
}: Props) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const Icon = activando ? LockOpenIcon : LockClosedIcon;

  useEffect(() => {
    if (open) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [open]);

  const titulo = activando ? "Dar acceso" : "Quitar acceso";
  const descripcion = activando
    ? `¿Seguro que deseas dar acceso a los usuarios de la categoría ${nombreCategoria}? Si presiona confirmar, todos podrán entrar y ver los resultados.`
    : `¿Seguro que quieres quitar acceso a los usuarios de la categoría ${nombreCategoria}? Los usuarios de esta categoría no podrán entrar a la plataforma.`;

  const dialogNode =
    open && typeof document !== "undefined" ? (
      <dialog
        ref={modalRef}
        onClose={onClose}
        className="fixed z-[200] inset-0 m-auto flex border-0 outline-none bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-xs animate-zoom-in duration-500"
      >
        <div className="modal-bg rounded-2xl w-sm max-w-[calc(100vw-2rem)] flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <Icon
              className={`h-7 w-7 shrink-0 ${activando ? "text-emerald-400" : "text-amber-400"}`}
              aria-hidden
            />
            <h2 className="text-white text-lg font-bold">{titulo}</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{descripcion}</p>
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2 text-white border-2 border-slate-500 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => void onConfirmar()}
              className={`px-4 py-2 text-white rounded-lg cursor-pointer transition-colors font-semibold disabled:opacity-50 ${
                activando ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {loading ? "…" : "Confirmar"}
            </button>
          </div>
        </div>
      </dialog>
    ) : null;

  return dialogNode && typeof document !== "undefined"
    ? createPortal(dialogNode, document.body)
    : null;
}
