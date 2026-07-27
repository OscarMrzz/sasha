"use client";

import ConfirmCambioEstadoEventoModal from "@/component/modales/ConfirmCambioEstadoEventoModal/ConfirmCambioEstadoEventoModal";
import { setEventoSelecionado } from "@/feacture/Eventos/eventosSlice";
import { registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";
import RegistroEventossServices from "@/lib/services/registroEventosServices";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";
import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";

type Props = {
  Evento: registroEventoDatosAmpleosInterface;
  onRefresh?: () => void;
  onFusionarEstadoEvento?: (idEvento: string, estado_evento: "iniciado" | "finalizado") => void;
};

export default function BotonCambioEstadoEvento({
  Evento,
  onRefresh,
  onFusionarEstadoEvento,
}: Props) {
  const dispatch = useDispatch();
  const registroEventosServices = useRef(new RegistroEventossServices());

  const [confirmCambioEstado, setConfirmCambioEstado] = useState<null | "iniciar" | "finalizar">(
    null,
  );
  const [loadingCambioEstado, setLoadingCambioEstado] = useState(false);

  const solicitarCambioEstadoEvento = () => {
    if (Evento.estado_evento === "iniciado") {
      setConfirmCambioEstado("finalizar");
    } else if (Evento.estado_evento === "pendiente" || Evento.estado_evento === "finalizado") {
      setConfirmCambioEstado("iniciar");
    }
  };

  const ejecutarCambioEstadoEvento = async () => {
    if (!confirmCambioEstado) return;
    setLoadingCambioEstado(true);
    try {
      const svc = registroEventosServices.current;
      await svc.initPerfil();
      if (confirmCambioEstado === "iniciar") {
        await svc.iniciarEvento(Evento.idEvento);
        dispatch(setEventoSelecionado({ ...Evento, estado_evento: "iniciado" }));
        onFusionarEstadoEvento?.(Evento.idEvento, "iniciado");
      } else {
        await svc.finalizarEvento(Evento.idEvento);
        dispatch(setEventoSelecionado({ ...Evento, estado_evento: "finalizado" }));
        onFusionarEstadoEvento?.(Evento.idEvento, "finalizado");
      }
      if (!onFusionarEstadoEvento) {
        await Promise.resolve(onRefresh?.());
      }
      setConfirmCambioEstado(null);
    } catch (e) {
      console.error("❌ Error al cambiar el estado del evento:", e);
    } finally {
      setLoadingCambioEstado(false);
    }
  };

  return (
    <>
      <ConfirmCambioEstadoEventoModal
        open={confirmCambioEstado !== null}
        onClose={() => {
          if (!loadingCambioEstado) setConfirmCambioEstado(null);
        }}
        onConfirm={ejecutarCambioEstadoEvento}
        loading={loadingCambioEstado}
        variant={confirmCambioEstado === "finalizar" ? "finalizar" : "iniciar"}
        titulo={
          confirmCambioEstado === "finalizar"
            ? "¿Finalizar el evento?"
            : Evento.estado_evento === "finalizado"
              ? "¿Volver a iniciar el evento?"
              : "¿Iniciar el evento?"
        }
        confirmLabel={
          confirmCambioEstado === "finalizar"
            ? "Sí, finalizar"
            : Evento.estado_evento === "finalizado"
              ? "Sí, iniciar de nuevo"
              : "Sí, iniciar"
        }
        descripcion={
          confirmCambioEstado === "finalizar" ? (
            <>
              El evento en{" "}
              <span className="font-semibold text-white">{Evento.LugarEvento || "este lugar"}</span>{" "}
              pasará a <span className="font-semibold text-white">finalizado</span>. Esta acción actualiza el estado en el
              sistema; confirma solo si la jornada ha concluido.
            </>
          ) : confirmCambioEstado === "iniciar" && Evento.estado_evento === "finalizado" ? (
            <>
              Este evento en{" "}
              <span className="font-semibold text-white">{Evento.LugarEvento || "este lugar"}</span> está{" "}
              <span className="font-semibold text-white">finalizado</span>. Al confirmar pasará de nuevo a{" "}
              <span className="font-semibold text-white">iniciado</span> para continuar usando el evento.
            </>
          ) : (
            <>
              Vas a marcar como <span className="font-semibold text-white">iniciado</span> el evento en{" "}
              <span className="font-semibold text-white">{Evento.LugarEvento || "este lugar"}</span>
              {Evento.fechaEvento ? (
                <>
                  {" "}
                  (<span className="text-white/90">{Evento.fechaEvento}</span>)
                </>
              ) : null}
              . Los evaluadores podrán trabajar con el evento en curso según las reglas de tu federación.
            </>
          )
        }
      />

      <section className="flex w-full flex-col items-center justify-center gap-3 py-4">
        {Evento.estado_evento === "cancelado" ? (
          <div className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 text-center text-sm text-white/85">
            <span className="font-semibold text-white">Evento cancelado</span>
            <p className="mt-1 text-white/60">No se puede iniciar ni finalizar desde aquí.</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={solicitarCambioEstadoEvento}
            aria-label={
              Evento.estado_evento === "iniciado"
                ? "Finalizar evento"
                : Evento.estado_evento === "finalizado"
                  ? "Iniciar de nuevo"
                  : "Iniciar evento"
            }
            className="group relative flex h-36 w-36 flex-col items-center justify-center gap-1.5 rounded-full border-2 border-sky-100/80 bg-primario/25   text-[#0a1628] shadow-lg shadow-black/20 ring-2 ring-white/25 ring-offset-2 ring-offset-slate-900/80 transition hover:scale-105 hover:shadow-xl hover:brightness-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300/60"
          >
            {Evento.estado_evento === "iniciado" ? (
              <PauseIcon className="h-12 w-12 shrink-0 drop-shadow-sm text-slate-300" aria-hidden />
            ) : (
              <PlayIcon className="h-12 w-12 shrink-0 drop-shadow-sm text-slate-300" aria-hidden />
            )}
            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
              {Evento.estado_evento === "iniciado"
                ? "Finalizar"
                : Evento.estado_evento === "finalizado"
                  ? "Iniciar de nuevo"
                  : "Iniciar"}
            </span>
          </button>
        )}
      </section>
    </>
  );
}
