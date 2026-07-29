import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

type ConfirmAsistenciaModalProps = {
  open: boolean;
  nombreEvento: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading: boolean;
};

const ConfirmAsistenciaModal = ({
  open,
  nombreEvento,
  onClose,
  onConfirm,
  loading,
}: ConfirmAsistenciaModalProps) => {
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
        className="fixed z-[200] inset-0 m-auto flex border-0 outline-none bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-xs animate-zoom-in duration-500"
      >
        <div className="modal-bg rounded-2xl w-sm flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-7 h-7 shrink-0 text-sky-400" />
            <h2 className="text-white text-lg font-bold">Confirmar asistencia</h2>
          </div>
          <p className="text-slate-300 text-sm">
            ¿Seguro que desea confirmar la asistencia al evento{" "}
            <span className="font-bold text-white">{nombreEvento}</span>?
          </p>
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
              onClick={() => void onConfirm()}
              className="px-4 py-2 text-white rounded-lg cursor-pointer transition-colors font-semibold disabled:opacity-50 bg-sky-600 hover:bg-sky-700"
            >
              {loading ? "…" : "Confirmar"}
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
};

export default ConfirmAsistenciaModal;
