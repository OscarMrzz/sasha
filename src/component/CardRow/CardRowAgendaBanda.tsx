"use client";

import React, { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import MenuMasOpcionesAsistencia from "@/components/ui/MenuMasOpcionesAsistencia";
import ConfirmAsistenciaModal from "@/component/modales/ConfirmAsistenciaModal/ConfirmAsistenciaModal";
import NegarAsistenciaModal from "@/component/modales/ConfirmAsistenciaModal/NegarAsistenciaModal";
import ConfirmacionAsistenciaServices from "@/lib/services/confirmacionAsistenciaServices";
import { registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";

function fechaSoloLocal(isoOrDate: string): Date {
  const raw = isoOrDate.split("T")[0];
  const [y, m, d] = raw.split("-").map((n) => Number(n));
  return new Date(y, (m || 1) - 1, d || 1);
}

type AsistenciaEtiqueta = "confirmado" | "denegado" | "pendiente";

function PastillaAsistencia({
  estado,
  tenue,
}: {
  estado: AsistenciaEtiqueta;
  tenue?: boolean;
}) {
  const base =
    "shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide sm:text-xs";
  if (estado === "confirmado") {
    return (
      <span
        className={`${base} border-emerald-500/50 ${
          tenue
            ? "bg-emerald-950/35 text-emerald-600/95"
            : "bg-emerald-500/15 text-emerald-200"
        }`}
      >
        Confirmado
      </span>
    );
  }
  if (estado === "denegado") {
    return (
      <span
        className={`${base} border-red-500/50 ${
          tenue ? "bg-red-950/40 text-red-500/90" : "bg-red-500/15 text-red-200"
        }`}
      >
        Denegado
      </span>
    );
  }
  return (
    <span
      className={`${base} border-amber-500/45 ${
        tenue ? "bg-amber-950/35 text-amber-600/90" : "bg-amber-500/12 text-amber-100/95"
      }`}
    >
      Pendiente
    </span>
  );
}

function resolverEtiquetaAsistencia(
  idBanda: string | null,
  idEvento: string,
  map: Map<string, boolean>,
): AsistenciaEtiqueta | null {
  if (!idBanda?.trim()) return null;
  if (!map.has(idEvento)) return "pendiente";
  return map.get(idEvento) ? "confirmado" : "denegado";
}

type CardProps = {
  evento: registroEventoDatosAmpleosInterface;
  tenue?: boolean;
  idBanda: string | null;
  /** Clave: `id_foranea_evento`; valor: `estado_asistencia` en `confirmacion_asistencia`. */
  estadoAsistenciaPorEventoId?: Map<string, boolean>;
  queryKey?: unknown[];
};

export default function CardRowAgendaBanda({
  evento,
  tenue,
  idBanda,
  estadoAsistenciaPorEventoId,
  queryKey = ["mi-banda-eventos-agenda"],
}: CardProps) {
  const queryClient = useQueryClient();
  const svcRef = useRef(new ConfirmacionAsistenciaServices());
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [modalDenegar, setModalDenegar] = useState(false);
  const [loading, setLoading] = useState(false);

  const d = fechaSoloLocal(evento.fechaEvento);
  const dia = d.getDate();
  const mesCorto = d.toLocaleDateString("es", { month: "short" });
  const nombreEvento = evento.LugarEvento?.trim() || "—";
  const mostrarMenu = !tenue && Boolean(idBanda?.trim());
  const mapAsistencia = estadoAsistenciaPorEventoId ?? new Map<string, boolean>();
  const etiquetaAsistencia = resolverEtiquetaAsistencia(idBanda, evento.idEvento, mapAsistencia);

  const cardClass = tenue
    ? "border-slate-600/60 bg-slate-800/35 text-slate-500"
    : "border-slate-600/90 bg-slate-700/55 text-slate-100 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]";

  const ejecutarConfirmar = async () => {
    if (!idBanda?.trim()) return;
    setLoading(true);
    try {
      await svcRef.current.confirmacionAsistencia(idBanda, evento.idEvento);
      await queryClient.invalidateQueries({ queryKey });
      setModalConfirmar(false);
    } catch (e) {
      console.error("Error al actualizar asistencia:", e);
      window.alert("No se pudo guardar la asistencia. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const ejecutarDenegar = async () => {
    if (!idBanda?.trim()) return;
    setLoading(true);
    try {
      await svcRef.current.denegarAsistencia(idBanda, evento.idEvento);
      await queryClient.invalidateQueries({ queryKey });
      setModalDenegar(false);
    } catch (e) {
      console.error("Error al actualizar asistencia:", e);
      window.alert("No se pudo guardar la asistencia. Inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <article
        className={`relative flex gap-3 rounded-xl border px-3 py-3 sm:gap-4 sm:px-4 ${cardClass}`}
      >
        <div
          className={`flex min-w-[3rem] flex-col items-center justify-center rounded-lg border px-2 py-2 text-center sm:min-w-[3.5rem] ${
            tenue
              ? "border-slate-600/50 bg-slate-900/40"
              : "border-[var(--color-primario)]/35 bg-slate-900/70"
          }`}
        >
          <span
            className={`text-xl font-black tabular-nums leading-none sm:text-2xl ${
              tenue ? "text-slate-500" : "text-[var(--color-primario)]"
            }`}
          >
            {dia}
          </span>
          <span
            className={`mt-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              tenue ? "text-slate-600" : "text-slate-400"
            }`}
          >
            {mesCorto}
          </span>
        </div>
        <div className="min-w-0 flex-1 border-l border-slate-600/50 pl-3 sm:pl-4 flex gap-2 sm:gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-row justify-between items-center gap-2 gap-y-1 min-w-0">
              <h2
                className={`min-w-0 flex-1 basis-full sm:basis-auto truncate text-base font-semibold leading-snug sm:text-lg ${
                  tenue ? "text-slate-500" : "text-white"
                }`}
              >
                {nombreEvento}
              </h2>
              {etiquetaAsistencia ? (
                <PastillaAsistencia estado={etiquetaAsistencia} tenue={tenue} />
              ) : null}
            </div>
            <p className={`mt-1 text-xs sm:text-sm ${tenue ? "text-slate-600" : "text-slate-400"}`}>
              <span className="font-medium text-slate-500">Región:</span>{" "}
              {evento.regiones?.nombreRegion ?? "—"}
            </p>
            <p className={`text-xs sm:text-sm ${tenue ? "text-slate-600" : "text-slate-400"}`}>
              {d.toLocaleDateString("es", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          {mostrarMenu ? (
            <div
              className="self-start pt-0.5"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <MenuMasOpcionesAsistencia
                onConfirmar={() => setModalConfirmar(true)}
                onDenegar={() => setModalDenegar(true)}
                iconColor="rgb(148 163 184)"
              />
            </div>
          ) : null}
        </div>
      </article>

      <ConfirmAsistenciaModal
        open={modalConfirmar}
        nombreEvento={nombreEvento}
        onClose={() => setModalConfirmar(false)}
        onConfirm={ejecutarConfirmar}
        loading={loading}
      />
      <NegarAsistenciaModal
        open={modalDenegar}
        nombreEvento={nombreEvento}
        onClose={() => setModalDenegar(false)}
        onConfirm={ejecutarDenegar}
        loading={loading}
      />
    </>
  );
}
