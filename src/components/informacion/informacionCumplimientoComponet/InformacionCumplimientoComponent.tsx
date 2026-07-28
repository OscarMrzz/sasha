
import { cumplimientosDatosAmpleosInterface } from "@/models";
import cumplimientossServices from "@/services/cumplimientosServices";

import React from "react";
import { useDispatch } from "react-redux";
import { activarRefrescarDataCumplimiento } from "@/features/RefrescadorData/refrescadorDataSlice";
type Props = {
  cumplimiento: cumplimientosDatosAmpleosInterface;
  onClose: () => void; // Función para cerrar el modal
  onRefresh?: () => void; // Función para refrescar los datos
  openFormEditar: () => void; // Función para abrir el formulario de edición
};

export default function InformacionCumplimientoComponent({
  cumplimiento,
  onClose,
  onRefresh,
  openFormEditar,
}: Props) {
  const dispatch = useDispatch();
  const eliminar = () => {
    const cumplimientosServices = new cumplimientossServices();
    cumplimientosServices
      .delete(cumplimiento.idCumplimiento)
      .catch((error) => {
        console.error("❌ Error al eliminar el cumpimiento:", error);
      })
      .finally(() => {
        dispatch(activarRefrescarDataCumplimiento());
        onRefresh?.();
        onClose?.();
      });
  };
  const onclickEditar = () => {
    openFormEditar?.();
    onClose?.();
  };

  return (
    <div className="h-full w-full min-w-0 max-w-3xl overflow-y-auto text-slate-100 scrollbar-estetica">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Información del cumplimiento</h2>

      <header className="mt-4 border-b border-slate-500/45 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="text-balance text-xl font-bold leading-tight text-white sm:text-2xl">
                Cumplimiento
              </h3>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/80">
                {cumplimiento.puntosCumplimiento ?? 0} pts
              </span>
            </div>

            <p className="mt-3 text-sm text-white/70" data-testid="informacion-cumplimiento-detalle">
              {cumplimiento.detalleCumplimiento || "—"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <button
              type="button"
              onClick={onclickEditar}
              className="rounded-xl bg-primario px-6 py-3 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={eliminar}
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5"
            >
              Eliminar
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
