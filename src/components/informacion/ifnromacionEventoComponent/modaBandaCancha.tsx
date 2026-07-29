"use client";

import OverleyModal from "@/components/modales/OverleyModal/Page";
import type { confirmacionConBandaInterface, registroEventoDatosAmpleosInterface } from "@/models";
import ConfirmacionAsistenciaServices from "@/services/confirmacionAsistenciaServices";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

type Props = {
  open: boolean;
  onClose: () => void;
  evento: registroEventoDatosAmpleosInterface;
  onRefresh?: () => void;
};

type AccionPendiente =
  | { tipo: "seleccionar"; fila: confirmacionConBandaInterface }
  | { tipo: "repetir"; fila: confirmacionConBandaInterface }
  | { tipo: "finalizar"; fila: confirmacionConBandaInterface };

const selectClass =
  "w-full rounded-xl border border-[var(--vz-border-strong)] bg-white px-4 py-3 text-sm text-[var(--app-fg)] focus:border-[var(--brand)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]";

function CardRowBandaCancha({
  fila,
  onClick,
  atenuada = false,
}: {
  fila: confirmacionConBandaInterface;
  onClick: () => void;
  atenuada?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border border-[var(--vz-border)] bg-white p-4 text-left shadow-sm transition-colors hover:border-[var(--vz-border-strong)] hover:bg-[#fafafa] ${
        atenuada ? "opacity-70 hover:opacity-100" : ""
      }`}
    >
      <h3 className="text-base font-bold text-[var(--vz-black)]">{fila.nombreBanda}</h3>
      {fila.AliasBanda?.trim() ? (
        <p className="text-sm text-[var(--app-fg-muted)]">{fila.AliasBanda}</p>
      ) : null}
      <p className="mt-1 text-sm text-[var(--app-fg-muted)]">
        Categoría: <span className="font-medium text-[var(--app-fg)]">{fila.nombreCategoria}</span>
      </p>
    </button>
  );
}

function ConfirmacionAccionModal({
  open,
  onClose,
  onConfirm,
  titulo,
  mensaje,
  textoConfirmar,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => boolean | Promise<boolean>;
  titulo: string;
  mensaje: string;
  textoConfirmar: string;
}) {
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
        className="fixed inset-0 z-[200] m-auto flex border-0 bg-transparent outline-none backdrop:bg-black/40 backdrop:backdrop-blur-xs"
      >
        <div className="modal-bg flex w-sm max-w-[calc(100vw-2rem)] flex-col gap-4 rounded-2xl border border-[var(--vz-border)] p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-7 w-7 shrink-0 text-amber-500" />
            <h2 className="text-lg font-bold text-[var(--vz-black)]">{titulo}</h2>
          </div>
          <p className="text-sm text-[var(--app-fg-muted)]">{mensaje}</p>
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-lg border border-[var(--vz-border-strong)] px-4 py-2 text-[var(--app-fg)] transition-colors hover:bg-[var(--vz-surface)]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={async () => {
                const ok = await onConfirm();
                if (ok) onClose();
              }}
              className="cursor-pointer rounded-lg bg-[var(--brand)] px-4 py-2 font-semibold text-white transition-colors hover:bg-[var(--brand-hover)]"
            >
              {textoConfirmar}
            </button>
          </div>
        </div>
      </dialog>
    ) : null;

  return dialogNode && typeof document !== "undefined" ? createPortal(dialogNode, document.body) : null;
}

export default function ModalDiaCancha({ open, onClose, evento, onRefresh }: Props) {
  const queryClient = useQueryClient();
  const confirmacionServices = useRef(new ConfirmacionAsistenciaServices());

  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [mostrarFinalizadas, setMostrarFinalizadas] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState<AccionPendiente | null>(null);
  const [procesando, setProcesando] = useState(false);

  const { data: confirmaciones = [], refetch } = useQuery({
    queryKey: ["confirmacionesCancha", evento.idEvento],
    queryFn: async () =>
      confirmacionServices.current.getConfirmacionesConBandaParaEvento(evento.idEvento),
    enabled: open && Boolean(evento?.idEvento),
  });

  const categorias = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of confirmaciones) {
      if (c.idForaneaCategoria) {
        map.set(c.idForaneaCategoria, c.nombreCategoria);
      }
    }
    return [...map.entries()].map(([id, nombre]) => ({ id, nombre }));
  }, [confirmaciones]);

  const bandaEnCancha = useMemo(
    () => confirmaciones.find((c) => c.estado_cancha === "ya_en_cancha") ?? null,
    [confirmaciones],
  );

  const pendientes = useMemo(
    () =>
      confirmaciones.filter(
        (c) =>
          c.estado_cancha === "pendiente" &&
          (filtroCategoria ? c.idForaneaCategoria === filtroCategoria : true),
      ),
    [confirmaciones, filtroCategoria],
  );

  const finalizadas = useMemo(
    () =>
      confirmaciones.filter(
        (c) =>
          c.estado_cancha === "finalizado" &&
          (filtroCategoria ? c.idForaneaCategoria === filtroCategoria : true),
      ),
    [confirmaciones, filtroCategoria],
  );

  const handleConfirmar = async (): Promise<boolean> => {
    if (!accionPendiente) return false;
    setProcesando(true);
    try {
      const { fila, tipo } = accionPendiente;
      const nuevoEstado = tipo === "finalizar" ? "finalizado" : "ya_en_cancha";
      await confirmacionServices.current.marcarParticipacion(
        fila.id_confirmacion_asistencia,
        nuevoEstado,
      );
      await queryClient.invalidateQueries({ queryKey: ["confirmacionesCancha", evento.idEvento] });
      await refetch();
      onRefresh?.();
      setAccionPendiente(null);
      return true;
    } catch (error) {
      console.error("❌ Error al actualizar estado de cancha:", error);
      const codigo =
        error && typeof error === "object" && "code" in error
          ? String((error as { code: string }).code)
          : "";
      const mensajePermiso =
        codigo === "42501" || codigo === "PGRST116"
          ? "No tienes permiso para actualizar el estado de la banda en cancha."
          : "Error al actualizar el estado de la banda en cancha";
      alert(mensajePermiso);
      return false;
    } finally {
      setProcesando(false);
    }
  };

  const modalConfirmacion = accionPendiente
    ? {
        titulo:
          accionPendiente.tipo === "finalizar"
            ? "Finalizar participación"
            : accionPendiente.tipo === "repetir"
              ? "Banda ya participó"
              : "Confirmar banda en cancha",
        mensaje:
          accionPendiente.tipo === "finalizar"
            ? `¿Seguro que desea finalizar la participación de la banda "${accionPendiente.fila.nombreBanda}" en cancha?`
            : accionPendiente.tipo === "repetir"
              ? `La banda "${accionPendiente.fila.nombreBanda}" ya participó. ¿Seguro que desea que vuelva a cancha?`
              : `¿Confirmar que la banda "${accionPendiente.fila.nombreBanda}" entra en cancha?`,
        textoConfirmar:
          accionPendiente.tipo === "finalizar"
            ? procesando
              ? "Finalizando…"
              : "Finalizar"
            : procesando
              ? "Procesando…"
              : "Confirmar",
      }
    : null;

  return (
    <>
      <OverleyModal open={open} onClose={onClose}>
        <div className="flex max-h-[70vh] min-w-[min(100%,28rem)] flex-col text-[var(--app-fg)]">
          <header className="mb-4 border-b border-[var(--vz-border)] pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">
              Evento
            </p>
            <h2 className="mt-1 text-xl font-bold text-[var(--vz-black)]">Banda en cancha</h2>
            <p className="mt-2 text-sm text-[var(--app-fg-muted)]">
              {bandaEnCancha
                ? "La banda seleccionada está en cancha. Finalice su participación para continuar con la siguiente."
                : "Seleccione qué banda es la siguiente en cancha. Puede filtrar por categoría."}
            </p>
          </header>

          {bandaEnCancha ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
              <div className="w-full rounded-xl border border-[var(--brand)]/30 bg-[var(--brand)]/10 p-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand-hover)]">
                  Banda en cancha:
                </p>
                <h3 className="mt-3 text-2xl font-bold text-[var(--vz-black)]">
                  {bandaEnCancha.nombreBanda}
                </h3>
                {bandaEnCancha.AliasBanda?.trim() ? (
                  <p className="mt-1 text-sm text-[var(--app-fg-muted)]">{bandaEnCancha.AliasBanda}</p>
                ) : null}
                <p className="mt-2 text-sm text-[var(--app-fg-muted)]">
                  Categoría:{" "}
                  <span className="font-medium text-[var(--app-fg)]">
                    {bandaEnCancha.nombreCategoria}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAccionPendiente({ tipo: "finalizar", fila: bandaEnCancha })}
                className="rounded-xl bg-[var(--brand)] px-8 py-3 text-sm font-bold text-white transition hover:bg-[var(--brand-hover)]"
              >
                Finalizar
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                  Filtrar por categoría
                </label>
                <select
                  className={selectClass}
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex h-full flex-1 flex-col gap-3 overflow-y-auto pb-46 scrollbar-estetica">
                {pendientes.length === 0 ? (
                  <div className="rounded-xl border border-[var(--vz-border)] bg-[var(--vz-surface)] p-4 text-sm text-[var(--app-fg-muted)]">
                    No hay bandas pendientes de participar con el filtro actual.
                  </div>
                ) : (
                  pendientes.map((fila) => (
                    <CardRowBandaCancha
                      key={fila.id_confirmacion_asistencia}
                      fila={fila}
                      onClick={() => setAccionPendiente({ tipo: "seleccionar", fila })}
                    />
                  ))
                )}

                {finalizadas.length > 0 ? (
                  <div className="mt-4 border-t border-[var(--vz-border)] pt-4">
                    <button
                      type="button"
                      onClick={() => setMostrarFinalizadas((prev) => !prev)}
                      className="flex w-full items-center justify-between rounded-lg border border-[var(--vz-border)] bg-[var(--vz-surface)] px-4 py-3 text-sm font-medium text-[var(--app-fg)] transition hover:bg-[#eeeeee]"
                    >
                      <span>Bandas que ya participaron ({finalizadas.length})</span>
                      {mostrarFinalizadas ? (
                        <ChevronUpIcon className="h-5 w-5 text-[var(--app-fg-muted)]" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-[var(--app-fg-muted)]" />
                      )}
                    </button>

                    {mostrarFinalizadas ? (
                      <div className="mt-3 flex flex-col gap-3">
                        {finalizadas.map((fila) => (
                          <CardRowBandaCancha
                            key={fila.id_confirmacion_asistencia}
                            fila={fila}
                            atenuada
                            onClick={() => setAccionPendiente({ tipo: "repetir", fila })}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </OverleyModal>

      <ConfirmacionAccionModal
        open={Boolean(accionPendiente)}
        onClose={() => !procesando && setAccionPendiente(null)}
        onConfirm={handleConfirmar}
        titulo={modalConfirmacion?.titulo ?? ""}
        mensaje={modalConfirmacion?.mensaje ?? ""}
        textoConfirmar={modalConfirmacion?.textoConfirmar ?? "Confirmar"}
      />
    </>
  );
}
