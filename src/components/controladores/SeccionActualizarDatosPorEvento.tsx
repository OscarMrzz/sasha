"use client";

import { ComboBoxEventos } from "@/components/ComboBox/ComboBoxEventos";
import ConfirmRefrescarDatosModal from "@/components/controladores/ConfirmRefrescarDatosModal";
import type { registroEventoDatosAmpleosInterface } from "@/models";
import { revalidarResultadosPorEvento } from "@/actions/revalidarResultadosEvento";
import RegistroEventossServices from "@/services/registroEventosServices";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function etiquetaEvento(e: registroEventoDatosAmpleosInterface): string {
  const lugar = e.LugarEvento?.trim() || "Sin lugar";
  const fecha = e.fechaEvento?.trim();
  return fecha ? `${lugar} — ${fecha}` : lugar;
}

export default function SeccionActualizarDatosPorEvento() {
  const [eventosFinalizados, setEventosFinalizados] = useState<
    registroEventoDatosAmpleosInterface[]
  >([]);
  const [cargando, setCargando] = useState(true);
  const [idEventoSeleccionado, setIdEventoSeleccionado] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eventosSvc = useRef(new RegistroEventossServices());

  const eventoSeleccionado = useMemo(
    () => eventosFinalizados.find((e) => e.idEvento === idEventoSeleccionado),
    [eventosFinalizados, idEventoSeleccionado],
  );

  const cargarEventosFinalizados = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      await eventosSvc.current.initPerfil();
      const lista = await eventosSvc.current.getDatosAmpleos();
      const finalizados = lista
        .filter((e) => e.estado_evento === "finalizado")
        .sort((a, b) =>
          String(b.fechaEvento ?? "").localeCompare(String(a.fechaEvento ?? "")),
        );
      setEventosFinalizados(finalizados);
    } catch (e) {
      console.error("[SeccionActualizarDatosPorEvento]", e);
      setError("No se pudieron cargar los eventos finalizados.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarEventosFinalizados();
  }, [cargarEventosFinalizados]);

  const ejecutarConfirmacion = async () => {
    if (!idEventoSeleccionado) return;
    setModalLoading(true);
    setError(null);
    setMensaje(null);
    try {
      const cantidad = await revalidarResultadosPorEvento(idEventoSeleccionado);
      const nombre = eventoSeleccionado
        ? etiquetaEvento(eventoSeleccionado)
        : "el evento";
      setMensaje(
        `Datos actualizados para ${cantidad} banda${cantidad === 1 ? "" : "s"} del evento «${nombre}».`,
      );
      setConfirmOpen(false);
    } catch (e) {
      console.error(e);
      setError(
        "No se pudo actualizar la caché. Revisa la consola o las variables de servidor.",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const mensajeModal = eventoSeleccionado
    ? `¿Seguro que quieres refrescar el evento «${etiquetaEvento(eventoSeleccionado)}»? Se actualizarán los datos de mi-banda de todas las bandas que participaron en ese evento.`
    : "";

  return (
    <section className="space-y-6 border-t border-slate-700/60 pt-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <EncabezadoActualizarPorEvento />
        <button
          type="button"
          onClick={() => void cargarEventosFinalizados()}
          disabled={cargando}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-500/60 bg-slate-800/80 px-3 py-2 text-xs font-medium text-white transition hover:border-[var(--color-primario)]/50 hover:bg-slate-800 disabled:opacity-50 sm:self-auto"
        >
          <ArrowPathIcon
            className={`h-3.5 w-3.5 ${cargando ? "animate-spin" : ""}`}
            aria-hidden
          />
          Actualizar lista
        </button>
      </header>

      {mensaje ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {mensaje}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {cargando ? (
        <div className="h-32 animate-pulse rounded-2xl border border-slate-700/40 bg-slate-800/40" />
      ) : (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Evento finalizado
          </h3>
          <FormularioRefrescoPorEvento
            eventosFinalizados={eventosFinalizados}
            idEventoSeleccionado={idEventoSeleccionado}
            onChangeEvento={setIdEventoSeleccionado}
            onSolicitarRefresco={() => setConfirmOpen(true)}
            modalLoading={modalLoading}
          />
        </div>
      )}

      <ConfirmRefrescarDatosModal
        open={confirmOpen}
        onClose={() => {
          if (!modalLoading) setConfirmOpen(false);
        }}
        onConfirm={ejecutarConfirmacion}
        loading={modalLoading}
        titulo="Confirmar actualización por evento"
        mensaje={mensajeModal}
      />
    </section>
  );
}

function EncabezadoActualizarPorEvento() {
  return (
    <div className="space-y-1">
      <h2 className="text-2xl font-bold tracking-tight text-white">
        Actualizar por evento
      </h2>
      <p className="text-sm text-slate-400">
        Solo aparecen eventos en estado finalizado. Refresca la caché de
        resultados, estadísticas y tablas para las bandas de ese evento.
      </p>
    </div>
  );
}

function FormularioRefrescoPorEvento({
  eventosFinalizados,
  idEventoSeleccionado,
  onChangeEvento,
  onSolicitarRefresco,
  modalLoading,
}: {
  eventosFinalizados: registroEventoDatosAmpleosInterface[];
  idEventoSeleccionado: string;
  onChangeEvento: (id: string) => void;
  onSolicitarRefresco: () => void;
  modalLoading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4">
      {eventosFinalizados.length === 0 ? (
        <p className="text-sm text-slate-400">
          No hay eventos finalizados en la federación.
        </p>
      ) : (
        <>
          <label
            htmlFor="combo-evento-refresco"
            className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400"
          >
            Evento
          </label>
          <ComboBoxEventos
            id="combo-evento-refresco"
            eventos={eventosFinalizados}
            value={idEventoSeleccionado}
            onChange={onChangeEvento}
            placeholder="Seleccionar evento finalizado"
            emptyLabel="No hay eventos finalizados que coincidan"
          />
          <button
            type="button"
            disabled={!idEventoSeleccionado || modalLoading}
            onClick={onSolicitarRefresco}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primario)] px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <ArrowPathIcon className="h-4 w-4" aria-hidden />
            Actualizar bandas del evento
          </button>
        </>
      )}
    </div>
  );
}
