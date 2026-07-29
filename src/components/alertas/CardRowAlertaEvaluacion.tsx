import React from "react";
import MenuMasOpcionesResolver from "@/components/ui/MenuMasOpcionesResolver";
import type { AlertaEvaluacionInterface } from "@/services/alertasEvaluacionServices";

type Props = {
  alerta: AlertaEvaluacionInterface;
  onResolver: () => void;
  resolviendo?: boolean;
};

function formatearFechaEvento(fecha: string | null): string {
  if (!fecha) return "—";
  return String(fecha).slice(0, 10);
}

function tituloAlerta(alerta: AlertaEvaluacionInterface): string {
  if (alerta.tipo === "rubrica_duplicada") {
    return `Rúbrica duplicada: ${alerta.nombreRubrica ?? "Sin nombre"}`;
  }
  return `Criterio duplicado: ${alerta.nombreCriterio ?? "Sin nombre"}`;
}

function subtituloAlerta(alerta: AlertaEvaluacionInterface): string {
  const evento = [alerta.LugarEvento, formatearFechaEvento(alerta.fechaEvento)].filter(Boolean).join(" · ");
  const rubrica =
    alerta.tipo === "cumplimiento_duplicado" && alerta.nombreRubrica
      ? ` · Rúbrica: ${alerta.nombreRubrica}`
      : "";
  return `${alerta.nombreBanda ?? "Banda sin nombre"}${evento ? ` · ${evento}` : ""}${rubrica}`;
}

export default function CardRowAlertaEvaluacion({ alerta, onResolver, resolviendo = false }: Props) {
  return (
    <div className="flex min-h-[5rem] w-full flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/40 card-row-bg p-4 shadow-md">
      <div className="min-w-0 flex-1 pr-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{tituloAlerta(alerta)}</h2>
          <span className="rounded-full border border-amber-500/50 bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-800">
            {alerta.cantidad_duplicados} duplicado{alerta.cantidad_duplicados === 1 ? "" : "s"}
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--app-fg-muted)]">{subtituloAlerta(alerta)}</p>
        <p className="mt-1 text-xs text-[var(--app-fg-muted)]">
          {alerta.tipo === "rubrica_duplicada"
            ? "Hay más de un comentario de evaluación para la misma banda, evento y rúbrica."
            : "Hay más de un registro de cumplimiento para la misma banda, criterio y evento."}
        </p>
      </div>
      <div>
        <MenuMasOpcionesResolver onResolver={onResolver} deshabilitado={resolviendo} />
      </div>
    </div>
  );
}
