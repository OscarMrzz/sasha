import { agregarCriterioEvaluar } from "@/features/evaluar/evaluarSlice";

import {
  criterioEvaluacionDatosAmpleosInterface,
  cumplimientosDatosAmpleosInterface,
} from "@/models";
import cumplimientossServices from "@/services/cumplimientosServices";
import type { EvaluarDraftItem } from "@/lib/evaluarPersistence";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";

type Props = {
  criterioSelecionado: criterioEvaluacionDatosAmpleosInterface;
  criterioNoEvaluado: string;
  onSeleccionarCumplimiento: (item: EvaluarDraftItem) => void;
};

export default function EvaluarCriterioComponent({
  criterioSelecionado,
  criterioNoEvaluado,
  onSeleccionarCumplimiento,
}: Props) {
  const dispatch = useDispatch();
  const criterioEvaluado = useSelector(
    (state: RootState) => state.evaluarCriterio.evaluaciones[criterioSelecionado.idCriterio]
  );

  const [listCumplimiento, setListCumplimiento] = React.useState<
    cumplimientosDatosAmpleosInterface[]
  >([]);
  const [cumplimientoSelecionado, setCumplimientoSelecionado] =
    React.useState<cumplimientosDatosAmpleosInterface | null>(null);

  const [cargandoCumplimientos, setCargandoCumplimientos] = React.useState<boolean>(true);

  useEffect(() => {
    const fetchCumplimientos = async () => {
      setCargandoCumplimientos(true);
      try {
        const cumplimientoServices = new cumplimientossServices();
        const datosCumplimientos = await cumplimientoServices.getByIdCriterio(
          criterioSelecionado.idCriterio
        );
        setListCumplimiento(datosCumplimientos);
      } catch (error) {
        console.error("Error fetching cumplimientos:", error);
      } finally {
        setCargandoCumplimientos(false);
      }
    };
    void fetchCumplimientos();
  }, [criterioSelecionado.idCriterio]);

  useEffect(() => {
    if (!criterioEvaluado?.idCumplimiento) {
      setCumplimientoSelecionado(null);
      return;
    }

    const cumplimientoGuardado = listCumplimiento.find(
      (cumplimiento) => cumplimiento.idCumplimiento === criterioEvaluado.idCumplimiento
    );

    if (cumplimientoGuardado) {
      setCumplimientoSelecionado(cumplimientoGuardado);
    }
  }, [criterioEvaluado?.idCumplimiento, listCumplimiento]);

  const onclickCumplimientoSelecionado = (cumplimiento: cumplimientosDatosAmpleosInterface) => {
    const evaluacion = {
      idCriterio: criterioSelecionado.idCriterio,
      idCumplimiento: cumplimiento.idCumplimiento,
      valor: cumplimiento.puntosCumplimiento,
    };

    setCumplimientoSelecionado(cumplimiento);
    dispatch(agregarCriterioEvaluar(evaluacion));
    onSeleccionarCumplimiento(evaluacion);
  };

  const incompleto = criterioSelecionado.idCriterio === criterioNoEvaluado;

  return (
    <div
      className={[
        "card-row-bg w-full overflow-hidden rounded-2xl p-4 shadow-sm sm:p-5",
        incompleto ? "ring-2 ring-rose-400 ring-offset-2 ring-offset-[var(--app-bg)]" : "",
      ].join(" ")}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-[var(--app-fg)] sm:text-xl">
          {criterioSelecionado.nombreCriterio}
        </h3>
        <details className="mt-1">
          <summary className="cursor-pointer text-sm text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]">
            Detalles
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-[var(--app-fg-muted)]">
            {criterioSelecionado.detallesCriterio}
          </p>
        </details>
      </div>

      {cargandoCumplimientos ? (
        <div className="w-full animate-pulse space-y-3">
          <div className="h-14 rounded-xl bg-[var(--vz-surface)]" />
          <div className="h-14 rounded-xl bg-[var(--vz-surface)]" />
          <div className="h-14 w-5/6 rounded-xl bg-[var(--vz-surface)]" />
        </div>
      ) : (
        <section className="flex flex-col gap-2.5" aria-label="Opciones de cumplimiento">
          {listCumplimiento.map((cumplimiento, index) => {
            const seleccionado =
              cumplimientoSelecionado?.idCumplimiento === cumplimiento.idCumplimiento;

            return (
              <label
                key={cumplimiento.idCumplimiento}
                style={{ animationDelay: `${index * 80}ms` }}
                className={[
                  "animate-zoom-in flex cursor-pointer flex-row items-stretch rounded-xl border-2 p-0 transition-colors",
                  seleccionado
                    ? "evaluar-cumplimiento-neon-selected"
                    : "border-[var(--vz-border)] bg-[#fafafa] hover:border-[var(--vz-border-strong)] hover:bg-white",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name={`cum-${criterioSelecionado.idCriterio}`}
                  value={cumplimiento.idCumplimiento}
                  checked={criterioEvaluado?.idCumplimiento === cumplimiento.idCumplimiento}
                  onChange={() => onclickCumplimientoSelecionado(cumplimiento)}
                  className="sr-only"
                />
                <div className="flex min-h-14 w-full flex-row items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-4">
                  <span
                    className={[
                      "flex w-12 shrink-0 items-center justify-center border-r-2 pr-3 text-xl font-bold tabular-nums sm:w-14",
                      seleccionado
                        ? "border-[var(--brand)]/35 text-[var(--brand)]"
                        : "border-[var(--vz-border)] text-[var(--app-fg)]",
                    ].join(" ")}
                  >
                    {cumplimiento.puntosCumplimiento}
                  </span>
                  <span className="min-w-0 flex-1 text-sm font-medium text-[var(--app-fg)] sm:text-base">
                    {cumplimiento.detalleCumplimiento}
                  </span>
                </div>
              </label>
            );
          })}
        </section>
      )}
    </div>
  );
}
