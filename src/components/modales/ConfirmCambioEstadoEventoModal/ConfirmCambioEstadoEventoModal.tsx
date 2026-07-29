import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";

export type ConfirmCambioEstadoEventoVariant = "iniciar" | "finalizar";

type ConfirmCambioEstadoEventoModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading: boolean;
  titulo: string;
  descripcion: React.ReactNode;
  confirmLabel: string;
  variant: ConfirmCambioEstadoEventoVariant;
};

const variantStyles: Record<
  ConfirmCambioEstadoEventoVariant,
  { icon: string; button: string; iconGlyph: typeof PlayIcon }
> = {
  iniciar: {
    icon: "text-sky-400",
    button: "bg-sky-600 hover:bg-sky-700",
    iconGlyph: PlayIcon,
  },
  finalizar: {
    icon: "text-amber-400",
    button: "bg-amber-600 hover:bg-amber-700",
    iconGlyph: PauseIcon,
  },
};

const ConfirmCambioEstadoEventoModal = ({
  open,
  onClose,
  onConfirm,
  loading,
  titulo,
  descripcion,
  confirmLabel,
  variant,
}: ConfirmCambioEstadoEventoModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);
  const styles = variantStyles[variant];
  const Icon = styles.iconGlyph;

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
        <div className="modal-bg rounded-2xl w-sm max-w-[calc(100vw-2rem)] flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <Icon className={`h-7 w-7 shrink-0 ${styles.icon}`} aria-hidden />
            <h2 className="text-white text-lg font-bold">{titulo}</h2>
          </div>
          <div className="text-slate-300 text-sm leading-relaxed">{descripcion}</div>
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
              className={`px-4 py-2 text-white rounded-lg cursor-pointer transition-colors font-semibold disabled:opacity-50 ${styles.button}`}
            >
              {loading ? "…" : confirmLabel}
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

export default ConfirmCambioEstadoEventoModal;
