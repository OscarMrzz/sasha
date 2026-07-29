"use client";

import ConfirmCambioAccesoModal from "@/components/modales/ConfirmCambioAccesoModal/ConfirmCambioAccesoModal";
import { categoriaInterface } from "@/models";
import { revalidarResultadosPorCategoria } from "@/actions/revalidarResultadosEvento";
import { cambiarAccesoPorEventoCategoria } from "@/services/controladoresServices";
import React, { useState } from "react";

type Props = {
  categoria: categoriaInterface;
  acceso: boolean;
  idEvento: string;
  onCambio: () => void | Promise<void>;
};

export default function CardRowCategoriaAcceso({
  categoria,
  acceso,
  idEvento,
  onCambio,
}: Props) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [activando, setActivando] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const abrirConfirmacion = () => {
    setActivando(!acceso);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    if (procesando) return;
    setModalAbierto(false);
  };

  const confirmarCambio = async () => {
    setProcesando(true);
    try {
      await cambiarAccesoPorEventoCategoria(idEvento, categoria.idCategoria);
      await revalidarResultadosPorCategoria(categoria.idCategoria);
      await onCambio();
      setModalAbierto(false);
    } catch (error) {
      console.error("Error al cambiar acceso:", error);
      alert(
        "No se pudo cambiar el acceso. Si eres responsable de mesa, ejecuta el script SQL de permisos en Supabase.",
      );
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <label className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-[var(--vz-border)] bg-white px-3 py-2.5 transition hover:border-[var(--vz-border-strong)] hover:bg-[#fafafa]">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={acceso}
          onChange={abrirConfirmacion}
          disabled={procesando}
        />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[var(--vz-black)]">
            {categoria.nombreCategoria || "—"}
          </span>
          <span
            className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
              acceso
                ? "bg-emerald-50 text-emerald-700"
                : "bg-[var(--vz-surface)] text-[var(--app-fg-muted)]"
            }`}
          >
            {acceso ? "Acceso activo" : "Acceso bloqueado"}
          </span>
        </div>
        <div
          className="relative h-8 w-[2.75rem] shrink-0 rounded-full bg-[var(--vz-border-strong)] transition-colors duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white peer-checked:bg-emerald-500 peer-disabled:opacity-50"
          aria-hidden
        >
          <span
            className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
              acceso ? "translate-x-[1.15rem]" : "translate-x-0"
            }`}
          />
        </div>
      </label>

      <ConfirmCambioAccesoModal
        open={modalAbierto}
        onClose={cerrarModal}
        onConfirmar={confirmarCambio}
        loading={procesando}
        nombreCategoria={categoria.nombreCategoria || "—"}
        activando={activando}
      />
    </>
  );
}
