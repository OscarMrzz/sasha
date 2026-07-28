"use client";

import {
  criterioEvaluacionDatosAmpleosInterface,
  cumplimientosInterface,
} from "@/models"; // Update the path as needed
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import cumplimientossServices from "@/services/cumplimientosServices";
import { activarRefrescarDataCumplimiento } from "@/features/RefrescadorData/refrescadorDataSlice";
import { setCumplimientoSeleccionado } from "@/features/cumplimientos/cumplimientosSlice";

const inputBaseClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition focus:border-primario/80 focus:bg-white/[0.07] focus:ring-2 focus:ring-primario/35";

const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wide text-white/70";

type Props = {
    cumplimientoAEditar: cumplimientosInterface;

  onClose: () => void;
};


export default function FormularioEditarCumplimientoComponet({
 
    cumplimientoAEditar,
  onClose,
}: Props) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    detalleCumplimiento: "",
    puntosCumplimiento: 0,
    idForaneaCriterio: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarFormulario();
  }, []);

  const cargarFormulario = () => {
    setFormData({
        detalleCumplimiento: cumplimientoAEditar.detalleCumplimiento,
        puntosCumplimiento: cumplimientoAEditar.puntosCumplimiento,
        idForaneaCriterio: cumplimientoAEditar.idForaneaCriterio,
    });
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cumplimientosServices = new cumplimientossServices();

      const nuevoCunplimiento: Omit<
        cumplimientosInterface,
        "idCumplimiento" | "created_at"
      > = {
        detalleCumplimiento: formData.detalleCumplimiento,
        puntosCumplimiento: formData.puntosCumplimiento,
        idForaneaCriterio: cumplimientoAEditar.idForaneaCriterio,
      };

      await cumplimientosServices.update(cumplimientoAEditar.idCumplimiento,
        nuevoCunplimiento as cumplimientosInterface
      );

      dispatch(
        setCumplimientoSeleccionado({
          ...cumplimientoAEditar,
          detalleCumplimiento: formData.detalleCumplimiento,
          puntosCumplimiento: Number(formData.puntosCumplimiento),
        })
      );

      // Limpiar formulario
      setFormData({
        detalleCumplimiento: "",
        puntosCumplimiento: 0,
        idForaneaCriterio: "",
      });
    } catch (error) {
      console.error("❌ Error al crear la Categoria:", error);
      alert("Error al Editar la cumplimiento");
    } finally {
      setLoading(false);

      dispatch(activarRefrescarDataCumplimiento());
      onClose();
    }
  };
  const onClickCancelar=()=>{
      setFormData({
        detalleCumplimiento: "",
        puntosCumplimiento: 0,
        idForaneaCriterio: "",
      });
    onClose();
  }

  return (
    <div className="p-2 lg:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Editar cumplimiento</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Actualizar cumplimiento</h2>
          <p className="mt-2 text-sm text-white/55">Modifica los datos y guarda cambios.</p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit} aria-label="formulario para editar cumplimiento">
            <div>
              <label className={labelClass} htmlFor="detalleCumplimiento">
                Detalles <span className="text-primario">*</span>
              </label>
              <input
                type="text"
                id="detalleCumplimiento"
                name="detalleCumplimiento"
                value={formData.detalleCumplimiento}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Describe el cumplimiento"
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="puntosCumplimiento">
                Puntos <span className="text-primario">*</span>
              </label>
              <input
                type="number"
                id="puntosCumplimiento"
                name="puntosCumplimiento"
                value={formData.puntosCumplimiento}
                onChange={handleInputChange}
                className={inputBaseClass}
                min={-100}
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onClickCancelar}
                className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-primario px-6 py-3 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/50 disabled:shadow-none"
              >
                {loading ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
