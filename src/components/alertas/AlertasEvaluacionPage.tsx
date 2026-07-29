"use client";

import React, { useCallback, useRef, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import CardRowAlertaEvaluacion from "@/components/alertas/CardRowAlertaEvaluacion";
import ConfirmRefrescarDatosModal from "@/components/controladores/ConfirmRefrescarDatosModal";
import ApprovateMessage from "@/components/Message/ApprovateMessage";
import ErrorMessage from "@/components/Message/ErrorMessage";
import AlertasEvaluacionServices, {
  type AlertaEvaluacionInterface,
} from "@/services/alertasEvaluacionServices";

export default function AlertasEvaluacionPage() {
  const servicio = useRef(new AlertasEvaluacionServices());
  const [alertas, setAlertas] = useState<AlertaEvaluacionInterface[]>([]);
  const [cargando, setCargando] = useState(true);
  const [resolviendo, setResolviendo] = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<AlertaEvaluacionInterface | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const cargarAlertas = useCallback(async () => {
    setCargando(true);
    setMensajeError(null);
    try {
      const datos = await servicio.current.obtenerAlertas();
      setAlertas(datos);
    } catch (error) {
      console.error("Error al cargar alertas:", error);
      setMensajeError(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las alertas. Verifica permisos en alertas_evaluacion."
      );
      setAlertas([]);
    } finally {
      setCargando(false);
    }
  }, []);

  React.useEffect(() => {
    void cargarAlertas();
  }, [cargarAlertas]);

  const confirmarResolver = async () => {
    if (!alertaSeleccionada) return;

    setResolviendo(true);
    setMensajeError(null);
    try {
      const borradas = await servicio.current.resolverAlerta(alertaSeleccionada.tipo);
      setMensajeExito(
        borradas > 0
          ? `Se eliminaron ${borradas} registro${borradas === 1 ? "" : "s"} duplicado${borradas === 1 ? "" : "s"}.`
          : "No había registros duplicados que eliminar."
      );
      setAlertaSeleccionada(null);
      await cargarAlertas();
    } catch (error) {
      console.error("Error al resolver alerta:", error);
      setMensajeError(
        error instanceof Error
          ? error.message
          : "No se pudo resolver la alerta. Verifica permiso EXECUTE en alertas_evaluacion."
      );
    } finally {
      setResolviendo(false);
    }
  };

  return (
    <div className="w-full px-4 py-6">
      <ApprovateMessage
        open={mensajeExito !== null}
        onClose={() => setMensajeExito(null)}
        titulo="Listo"
        texto={mensajeExito ?? ""}
      />
      <ErrorMessage
        open={mensajeError !== null}
        onClose={() => setMensajeError(null)}
        titulo="Error"
        texto={mensajeError ?? ""}
      />

      <ConfirmRefrescarDatosModal
        open={alertaSeleccionada !== null}
        onClose={() => {
          if (!resolviendo) setAlertaSeleccionada(null);
        }}
        loading={resolviendo}
        onConfirm={confirmarResolver}
        titulo="Confirmar resolución"
        mensaje={
          alertaSeleccionada
            ? `¿Resolver esta alerta? Se conservará el registro más antiguo y se eliminarán ${alertaSeleccionada.cantidad_duplicados} duplicado(s).`
            : ""
        }
        textoBotonConfirmar="Sí, resolver"
        textoBotonCancelar="Cancelar"
        variante="peligro"
      />

      <section className="rounded-xl border border-[var(--vz-border-strong)] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-l-4 border-amber-500 pl-3">
          <div>
            <h1 className="text-2xl font-bold">Alertas</h1>
            <p className="mt-1 text-sm text-[var(--app-fg-muted)]">
              Evaluaciones duplicadas detectadas en cumplimientos o comentarios de rúbrica.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void cargarAlertas()}
            disabled={cargando || resolviendo}
            className="btn-surface inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 ${cargando ? "animate-spin" : ""}`} aria-hidden />
            {cargando ? "Refrescando…" : "Refrescar"}
          </button>
        </div>

        {cargando ? (
          <p className="py-8 text-center text-sm text-[var(--app-fg-muted)]">Cargando alertas…</p>
        ) : alertas.length === 0 ? (
          <p className="rounded-lg border border-[var(--vz-border)] bg-[#f5f5f5] py-8 text-center text-sm text-[var(--app-fg-muted)]">
            No hay alertas de evaluación duplicada.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {alertas.map((alerta) => (
              <CardRowAlertaEvaluacion
                key={alerta.clave_alerta}
                alerta={alerta}
                resolviendo={resolviendo}
                onResolver={() => setAlertaSeleccionada(alerta)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
