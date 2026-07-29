"use client";

import React, { useEffect } from "react";
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
    icon: "text-[var(--brand)]",
    button: "bg-[var(--brand)] hover:bg-[var(--brand-hover)]",
    iconGlyph: PlayIcon,
  },
  finalizar: {
    icon: "text-amber-600",
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
  const styles = variantStyles[variant];
  const Icon = styles.iconGlyph;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, loading, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
      role="presentation"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-cambio-estado-titulo"
        className="modal-bg flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-[var(--vz-border)] p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <Icon className={`h-7 w-7 shrink-0 ${styles.icon}`} aria-hidden />
          <h2
            id="confirm-cambio-estado-titulo"
            className="text-lg font-bold text-[var(--vz-black)]"
          >
            {titulo}
          </h2>
        </div>
        <div className="text-sm leading-relaxed text-[var(--app-fg-muted)]">{descripcion}</div>
        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="cursor-pointer rounded-lg border border-[var(--vz-border-strong)] px-4 py-2 text-[var(--app-fg)] transition-colors hover:bg-[var(--vz-surface)] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className={`cursor-pointer rounded-lg px-4 py-2 font-semibold text-white transition-colors disabled:opacity-50 ${styles.button}`}
          >
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmCambioEstadoEventoModal;
