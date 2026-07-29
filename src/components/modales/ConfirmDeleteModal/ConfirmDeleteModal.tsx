import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

type ConfirmDeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  nombreElemento: string;
  titulo?: string;
};

const ConfirmDeleteModal = ({
  open,
  onClose,
  onConfirm,
  nombreElemento,
  titulo = "Confirmar eliminación",
}: ConfirmDeleteModalProps) => {
  const [animar, setAnimar] = React.useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      setAnimar(false);
      setTimeout(() => {
        setAnimar(true);
        modalRef.current?.showModal();
      }, 10);
    } else {
      setAnimar(false);
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
            <ExclamationTriangleIcon className="w-7 h-7 text-red-400 shrink-0" />
            <h2 className="text-white text-lg font-bold">{titulo}</h2>
          </div>
          <p className="text-slate-300 text-sm">
            ¿Seguro que deseas eliminar a{" "}
            <span className="font-bold text-white">{nombreElemento}</span>?
          </p>
          <div className="flex justify-end gap-3 mt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white border-2 border-slate-500 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={async () => {
                await onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700 transition-colors font-semibold"
            >
              Eliminar
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

export default ConfirmDeleteModal;
