"use client";

import OverleyModal from "@/components/modales/OverleyModal/Page";
import {
  registroEquipoEvaluadorDatosAmpleosInterface,
  rubricaDatosAmpleosInterface,
} from "@/models";
import RegistroEquipoEvaluadorServices from "@/services/registroEquipoEvaluadorServices";
import { rubricasDisponiblesParaJurado } from "@/helpers/utils/rubricasDisponibles";
import React, { useEffect, useMemo, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  registro: registroEquipoEvaluadorDatosAmpleosInterface | null;
  rubricas: rubricaDatosAmpleosInterface[];
  jurados: registroEquipoEvaluadorDatosAmpleosInterface[];
  onSaved?: () => void;
};

const selectClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-primario/80 focus:outline-none focus:ring-2 focus:ring-primario/35";

const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wide text-white/70";

export default function ModalAsignarRubricaJurado({
  open,
  onClose,
  registro,
  rubricas,
  jurados,
  onSaved,
}: Props) {
  const [idRubrica, setIdRubrica] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (open && registro) {
      setIdRubrica(registro.id_foranea_rubrica ?? "");
    }
  }, [open, registro]);

  const nombreJurado = registro?.perfiles?.nombre ?? "—";

  const rubricasDisponibles = useMemo(
    () =>
      rubricasDisponiblesParaJurado(
        rubricas,
        jurados,
        registro?.idRegistroEvaluador,
      ),
    [jurados, registro?.idRegistroEvaluador, rubricas],
  );

  useEffect(() => {
    if (!open || !registro) return;
    const disponible = rubricasDisponibles.some((r) => r.idRubrica === idRubrica);
    if (idRubrica && !disponible) {
      setIdRubrica("");
    }
  }, [idRubrica, open, registro, rubricasDisponibles]);

  const handleGuardar = async () => {
    if (!registro || !idRubrica) return;
    setGuardando(true);
    try {
      const svc = new RegistroEquipoEvaluadorServices();
      await svc.updateRubrica(registro.idRegistroEvaluador, idRubrica);
      onSaved?.();
      onClose();
    } catch (error) {
      console.error("❌ Error al asignar rúbrica:", error);
      const mensaje =
        error instanceof Error ? error.message : "Error al asignar la rúbrica al jurado";
      alert(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <OverleyModal open={open} onClose={onClose}>
      <div className="min-w-[min(100%,24rem)] text-white">
        <header className="mb-4 border-b border-white/10 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Jurado</p>
          <h2 className="mt-1 text-xl font-bold">Asignar rúbrica</h2>
          <p className="mt-1 text-sm text-white/60">{nombreJurado}</p>
        </header>

        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="modal-rubrica-jurado">
              Rúbrica <span className="text-primario">*</span>
            </label>
            <select
              id="modal-rubrica-jurado"
              className={selectClass}
              value={idRubrica}
              onChange={(e) => setIdRubrica(e.target.value)}
              disabled={guardando}
            >
              <option className="bg-slate-800 text-slate-100" value="">
                {rubricasDisponibles.length === 0
                  ? "No hay rúbricas disponibles"
                  : "Selecciona una rúbrica"}
              </option>
              {rubricasDisponibles.map((rubrica) => (
                <option className="bg-slate-800 text-slate-100" key={rubrica.idRubrica} value={rubrica.idRubrica}>
                  {rubrica.nombreRubrica} · {rubrica.categorias?.nombreCategoria ?? "—"}
                </option>
              ))}
            </select>
            {rubricasDisponibles.length === 0 ? (
              <p className="mt-2 text-sm text-white/55">
                Todas las rúbricas ya están asignadas a otros jurados en este evento.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={guardando}
              className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleGuardar()}
              disabled={guardando || !idRubrica || rubricasDisponibles.length === 0}
              className="rounded-xl bg-primario px-5 py-2.5 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/50 disabled:shadow-none"
            >
              {guardando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </OverleyModal>
  );
}
