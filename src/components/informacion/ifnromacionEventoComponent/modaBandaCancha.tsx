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
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-primario/80 focus:outline-none focus:ring-2 focus:ring-primario/35";

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
      className={`w-full rounded-lg bg-slate-600 p-4 text-left shadow-md transition hover:bg-slate-500 ${
        atenuada ? "opacity-60 hover:opacity-80" : ""
      }`}
    >
      <h3 className="text-lg font-bold text-white">{fila.nombreBanda}</h3>
      {fila.AliasBanda?.trim() ? <p className="text-sm text-slate-300">{fila.AliasBanda}</p> : null}
      <p className="mt-1 text-sm text-slate-200">Categoría: {fila.nombreCategoria}</p>
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
        className="fixed z-[200] inset-0 m-auto flex border-0 outline-none bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-xs"
      >
        <div className="bg-slate-700 rounded-2xl w-sm flex flex-col gap-4 p-6">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-7 h-7 text-amber-400 shrink-0" />
            <h2 className="text-white text-lg font-bold">{titulo}</h2>
          </div>
          <p className="text-slate-300 text-sm">{mensaje}</p>
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white border-2 border-slate-500 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={async () => {
                const ok = await onConfirm();
                if (ok) onClose();
              }}
              className="px-4 py-2 bg-primario text-[#0a1628] rounded-lg cursor-pointer hover:brightness-110 transition-colors font-semibold"
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
        <div className="flex max-h-[70vh] min-w-[min(100%,28rem)] flex-col text-white">
          <header className="mb-4 border-b border-white/10 pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Evento</p>
            <h2 className="mt-1 text-xl font-bold">Banda en cancha</h2>
            <p className="mt-2 text-sm text-white/60">
              {bandaEnCancha
                ? "La banda seleccionada está en cancha. Finalice su participación para continuar con la siguiente."
                : "Seleccione qué banda es la siguiente en cancha. Puede filtrar por categoría."}
            </p>
          </header>

          {bandaEnCancha ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
              <div className="w-full rounded-xl border border-primario/30 bg-primario/10 p-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-primario">
                  Banda en cancha:
                </p>
                <h3 className="mt-3 text-2xl font-bold text-white">{bandaEnCancha.nombreBanda}</h3>
                {bandaEnCancha.AliasBanda?.trim() ? (
                  <p className="mt-1 text-sm text-slate-300">{bandaEnCancha.AliasBanda}</p>
                ) : null}
                <p className="mt-2 text-sm text-slate-200">
                  Categoría: {bandaEnCancha.nombreCategoria}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAccionPendiente({ tipo: "finalizar", fila: bandaEnCancha })}
                className="rounded-xl bg-primario px-8 py-3 text-sm font-bold text-[#0a1628] transition hover:brightness-110"
              >
                Finalizar
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70">
                  Filtrar por categoría
                </label>
                <select
                  className={selectClass}
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                >
                  <option className="bg-slate-800 text-slate-100" value="">
                    Todas las categorías
                  </option>
                  {categorias.map((cat) => (
                    <option className="bg-slate-800 text-slate-100" key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto scrollbar-estetica h-full pb-46">
                {pendientes.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
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
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <button
                      type="button"
                      onClick={() => setMostrarFinalizadas((prev) => !prev)}
                      className="flex w-full items-center justify-between rounded-lg bg-white/5 px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10"
                    >
                      <span>Bandas que ya participaron ({finalizadas.length})</span>
                      {mostrarFinalizadas ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
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
