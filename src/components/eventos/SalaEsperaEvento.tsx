"use client";

import CirculoOnda from "@/components/circuloAnimado/CirculoOlnda";
import type { RegistroEventoInterface } from "@/models";
import { ArrowPathIcon, ArrowRightCircleIcon } from "@heroicons/react/24/solid";
import React from "react";

type ModoSalaEsperaEvento =
  | "espera"
  | "inicio-detectado"
  | "evento-no-disponible"
  | "espera-siguiente-banda";

type Props = {
  modo: ModoSalaEsperaEvento;
  estadoEvento?: RegistroEventoInterface["estado_evento"];
  nombreEvento?: string;
  nombreBandaEnCancha?: string;
  nombreRubrica?: string;
  mensajeAuxiliar?: string | null;
  nuevaBandaLista?: boolean;
  refrescando?: boolean;
  mensajeError?: string | null;
  onRefrescar?: () => void | Promise<void>;
  onContinuar?: () => void;
  onVolver?: () => void;
};

const contenidoPorEstado: Record<
  RegistroEventoInterface["estado_evento"],
  { titulo: string; descripcion: string }
> = {
  pendiente: {
    titulo: "Evento en espera",
    descripcion: "El evento ya no está iniciado. Espera a que vuelva a iniciar para continuar.",
  },
  iniciado: {
    titulo: "Evento no disponible",
    descripcion: "No se pudo confirmar que este evento siga disponible para continuar.",
  },
  finalizado: {
    titulo: "Evento finalizado",
    descripcion: "La jornada de este evento finalizó. Ya no puedes continuar trabajando en él.",
  },
  cancelado: {
    titulo: "Evento cancelado",
    descripcion: "Este evento fue cancelado. Ya no está disponible para evaluación o revisión.",
  },
};

export default function SalaEsperaEvento({
  modo,
  estadoEvento,
  nombreEvento,
  nombreBandaEnCancha,
  nombreRubrica,
  mensajeAuxiliar,
  nuevaBandaLista = false,
  refrescando = false,
  mensajeError,
  onRefrescar,
  onContinuar,
  onVolver,
}: Props) {
  const esEsperaSiguienteBanda = modo === "espera-siguiente-banda";
  const esInicioDetectado = modo === "inicio-detectado";
  const esListoParaContinuar = esInicioDetectado || (esEsperaSiguienteBanda && nuevaBandaLista);
  const esEventoNoDisponible = modo === "evento-no-disponible";
  const contenidoEstado = estadoEvento ? contenidoPorEstado[estadoEvento] : null;

  const titulo = esEsperaSiguienteBanda
    ? esListoParaContinuar
      ? "Nueva banda en cancha"
      : "Evaluación registrada"
    : esInicioDetectado
      ? "Evento iniciado"
      : esEventoNoDisponible
        ? contenidoEstado?.titulo ?? "Evento no disponible"
        : "Bienvenido";

  const descripcion = esEsperaSiguienteBanda
    ? esListoParaContinuar
      ? "Hay una nueva banda lista para evaluar con tu rúbrica. Presiona continuar."
      : "Esperando la siguiente banda en cancha. Presiona Actualizar cuando el responsable de mesa indique el cambio."
    : esInicioDetectado
      ? "El evento que elegiste ya inició. Presiona continuar para evaluar."
      : esEventoNoDisponible
        ? contenidoEstado?.descripcion ?? "El evento ya no está disponible para continuar."
        : "El evento aún no ha dado inicio. Refresca para verificar si ya fue iniciado.";

  return (
    <section className="flex min-h-[60vh] w-full items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 rounded-3xl border border-slate-600/40 bg-slate-900/45 px-6 py-10 text-center shadow-2xl shadow-black/20 backdrop-blur-sm">
        <div className="flex min-h-36 items-center justify-center">
          {esListoParaContinuar ? (
            <CirculoOnda size="grande" />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-slate-500/50 bg-slate-800/70">
              <ArrowPathIcon
                className={`h-12 w-12 text-sky-300 ${refrescando ? "animate-spin" : ""}`}
                aria-hidden
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">
            {esListoParaContinuar ? "Listo para continuar" : "Sala de espera"}
          </p>
          <h1 className="text-3xl font-bold text-white">{titulo}</h1>
          {nombreEvento ? (
            <p className="text-base font-semibold text-slate-200">{nombreEvento}</p>
          ) : null}
          {esEsperaSiguienteBanda && nombreBandaEnCancha ? (
            <p className="text-sm text-slate-300">
              Banda en cancha: <span className="font-semibold text-slate-100">{nombreBandaEnCancha}</span>
              {nombreRubrica ? (
                <>
                  {" "}
                  · Rúbrica: <span className="font-semibold text-slate-100">{nombreRubrica}</span>
                </>
              ) : null}
            </p>
          ) : null}
          <p className="mx-auto max-w-md text-sm leading-6 text-slate-300">{descripcion}</p>
          {mensajeAuxiliar ? (
            <p className="mx-auto max-w-md text-sm font-medium text-amber-200/90">{mensajeAuxiliar}</p>
          ) : null}
          {mensajeError ? <p className="text-sm font-medium text-red-300">{mensajeError}</p> : null}
        </div>

        <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {esListoParaContinuar ? (
            <button
              type="button"
              onClick={onContinuar}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-bold text-slate-900 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:w-auto"
            >
              Continuar
              <ArrowRightCircleIcon className="h-5 w-5" aria-hidden />
            </button>
          ) : null}
          {!esListoParaContinuar ? (
            <button
              type="button"
              onClick={onRefrescar}
              disabled={refrescando || !onRefrescar}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-sky-300/40 bg-sky-400/15 px-6 text-sm font-bold text-sky-100 transition hover:bg-sky-400/25 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:w-auto"
            >
              <ArrowPathIcon className={`h-5 w-5 ${refrescando ? "animate-spin" : ""}`} aria-hidden />
              {refrescando
                ? "Actualizando..."
                : esEsperaSiguienteBanda
                  ? "Actualizar"
                  : "Refrescar"}
            </button>
          ) : null}
        
        </div>
      </div>
    </section>
  );
}
