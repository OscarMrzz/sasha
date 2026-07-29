"use client";

import ConfirmCambioEstadoEventoModal from "@/components/modales/ConfirmCambioEstadoEventoModal/ConfirmCambioEstadoEventoModal";
import { RootState } from "@/app/store";
import { setEventoSelecionado } from "@/features/Eventos/eventosSlice";
import { registroEventoDatosAmpleosInterface } from "@/models";
import RegistroEventossServices from "@/services/registroEventosServices";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

type Props = {
  evento: registroEventoDatosAmpleosInterface;
  /** Fusiona sólo ese evento en memoria/caché; evita recargar toda la vista (sin parpadeo) */
  onFusionarEstadoEvento?: (idEvento: string, estado_evento: "iniciado" | "finalizado") => void;
  compact?: boolean;
  className?: string;
};

export default function ControlesIniciarPararEvento({
  evento,
  onFusionarEstadoEvento,
  compact = false,
  className = "",
}: Props) {
  const dispatch = useDispatch();
  const seleccionRedux = useSelector((s: RootState) => s.eventos.EventoSeleccionado);
  const registroSvc = useRef(new RegistroEventossServices());

  const [confirmCambio, setConfirmCambio] = useState<null | "iniciar" | "finalizar">(null);
  /** true si `iniciar` se abrió desde `finalizado` (texto del modal diferente) */
  const [iniciarEsReanudacion, setIniciarEsReanudacion] = useState(false);
  const [loading, setLoading] = useState(false);

  const estado = evento.estado_evento;

  if (estado === "cancelado") {
    return null;
  }

  const accionPermitida =
    estado === "pendiente" || estado === "iniciado" || estado === "finalizado";

  const cerrarConfirm = () => {
    if (!loading) {
      setConfirmCambio(null);
      setIniciarEsReanudacion(false);
    }
  };

  const solicitar = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!accionPermitida) return;
    if (estado === "iniciado") {
      setIniciarEsReanudacion(false);
      setConfirmCambio("finalizar");
      return;
    }
    /* pendiente o finalizado → mismo API iniciarEvento */
    setIniciarEsReanudacion(estado === "finalizado");
    setConfirmCambio("iniciar");
  };

  const ejecutar = async () => {
    if (!confirmCambio) return;
    setLoading(true);
    try {
      const svc = registroSvc.current;
      await svc.initPerfil();
      if (confirmCambio === "iniciar") {
        await svc.iniciarEvento(evento.idEvento);
        if (seleccionRedux?.idEvento === evento.idEvento) {
          dispatch(setEventoSelecionado({ ...evento, estado_evento: "iniciado" }));
        }
        onFusionarEstadoEvento?.(evento.idEvento, "iniciado");
      } else {
        await svc.finalizarEvento(evento.idEvento);
        if (seleccionRedux?.idEvento === evento.idEvento) {
          dispatch(setEventoSelecionado({ ...evento, estado_evento: "finalizado" }));
        }
        onFusionarEstadoEvento?.(evento.idEvento, "finalizado");
      }
      setConfirmCambio(null);
      setIniciarEsReanudacion(false);
    } catch (err) {
      console.error("❌ Error al cambiar el estado del evento:", err);
      const mensaje =
        err instanceof Error ? err.message : "No se pudo cambiar el estado del evento.";
      alert(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const labelAccion =
    estado === "iniciado" ? "Finalizar" : estado === "finalizado" ? "Iniciar de nuevo" : "Iniciar";

  const modalTituloIniciar =
    iniciarEsReanudacion && confirmCambio === "iniciar"
      ? "¿Volver a iniciar el evento?"
      : "¿Iniciar el evento?";

  const btnCls =
    estado === "iniciado"
      ? compact
        ? "inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
        : "inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
      : compact
        ? "inline-flex items-center gap-1.5 rounded-lg border border-[var(--brand)]/35 bg-[var(--brand)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--brand-hover)] transition hover:bg-[var(--brand)]/18"
        : "inline-flex items-center gap-2 rounded-lg border border-[var(--brand)]/35 bg-[var(--brand)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--brand-hover)] transition hover:bg-[var(--brand)]/18";

  return (
    <div className={className} onDoubleClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={(e) => solicitar(e)}
        aria-label={
          estado === "iniciado" ? "Finalizar evento" : estado === "finalizado" ? "Iniciar de nuevo" : "Iniciar evento"
        }
        className={btnCls}
      >
        {estado === "iniciado" ? (
          <PauseIcon className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
        ) : (
          <PlayIcon className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
        )}
        {labelAccion}
      </button>

      <ConfirmCambioEstadoEventoModal
        open={confirmCambio !== null}
        onClose={cerrarConfirm}
        onConfirm={ejecutar}
        loading={loading}
        variant={confirmCambio === "finalizar" ? "finalizar" : "iniciar"}
        titulo={
          confirmCambio === "finalizar"
            ? "¿Finalizar el evento?"
            : modalTituloIniciar
        }
        confirmLabel={
          confirmCambio === "finalizar" ? "Sí, finalizar" : iniciarEsReanudacion ? "Sí, iniciar de nuevo" : "Sí, iniciar"
        }
        descripcion={
          confirmCambio === "finalizar" ? (
            <>
              El evento en{" "}
              <span className="font-semibold text-[var(--vz-black)]">
                {evento.LugarEvento || "este lugar"}
              </span>{" "}
              pasará a{" "}
              <span className="font-semibold text-[var(--vz-black)]">finalizado</span>. Confirma solo
              si la jornada ha concluido.
            </>
          ) : iniciarEsReanudacion ? (
            <>
              Este evento en{" "}
              <span className="font-semibold text-[var(--vz-black)]">
                {evento.LugarEvento || "este lugar"}
              </span>{" "}
              está <span className="font-semibold text-[var(--vz-black)]">finalizado</span>. Al
              confirmar pasará de nuevo a{" "}
              <span className="font-semibold text-[var(--vz-black)]">iniciado</span> para continuar
              usando el evento.
            </>
          ) : (
            <>
              Vas a marcar como{" "}
              <span className="font-semibold text-[var(--vz-black)]">iniciado</span> el evento en{" "}
              <span className="font-semibold text-[var(--vz-black)]">
                {evento.LugarEvento || "este lugar"}
              </span>
              {evento.fechaEvento ? (
                <>
                  {" "}
                  (<span className="text-[var(--app-fg)]">{evento.fechaEvento}</span>)
                </>
              ) : null}
              .
            </>
          )
        }
      />
    </div>
  );
}
