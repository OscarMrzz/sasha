import CriterioCompoenet from "@/components/Criterios/CriteriosComponet";
import { activarRefrescarDataRubricas } from "@/features/RefrescadorData/refrescadorDataSlice";
import { rubricaDatosAmpleosInterface } from "@/models";
import RubricasServices from "@/services/rubricasServices";
import React from "react";
import { useDispatch } from "react-redux";
type Props = {
  rubrica: rubricaDatosAmpleosInterface;
  onClose: () => void; // Función para cerrar el modal
  onRefresh?: () => void; // Función para refrescar los datos
  openFormEditar: () => void; // Función para abrir el formulario de edición
  openFormAgregar: () => void; // Función para abrir el formulario de agregar criterio
};

export default function InformacionRubricaComponent({
  rubrica,
  onClose,
  onRefresh,
  openFormEditar,
  openFormAgregar,
}: Props) {
  const dispatch = useDispatch();
  const eliminar = () => {
    const rubricaServices = new RubricasServices();
    rubricaServices
      .delete(rubrica.idRubrica)
      .then(() => {
        
        onRefresh?.(); // Refrescar los datos
        onClose?.(); // Cerrar el modal después de eliminar
      })
      .catch((error) => {
        console.error("❌ Error al eliminar la región:", error);
      })
      .finally(() => {
        dispatch(activarRefrescarDataRubricas());
        onClose?.(); 
      });
  };
  const onclickEditar = () => {

    openFormEditar?.();
    onClose?.();
  };

  return (
    <div className="h-full w-full min-w-0 max-w-3xl overflow-y-auto text-slate-100 scrollbar-estetica">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Información de la rúbrica</h2>

      <header className="mt-4 border-b border-slate-500/45 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-3">
              <h3
                className="text-balance text-xl font-bold leading-tight text-white sm:text-2xl"
                data-testid="informacion-rubrica-nombre"
              >
                {rubrica.nombreRubrica || "—"}
              </h3>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/80">
                {rubrica.puntosRubrica ?? 0}%
              </span>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/70">
                {rubrica.versionRubrica || "—"}
              </span>
            </div>

            <p className="mt-2 text-sm text-white/70">
              Categoría: <span className="text-white/85">{rubrica.categorias?.nombreCategoria ?? "—"}</span>
            </p>
            <p className="mt-3 text-sm text-white/70">{rubrica.datalleRubrica || "—"}</p>
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

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
        <div>
          <h4 className="text-sm font-semibold text-white">Criterios</h4>
          <p className="mt-1 text-xs text-white/55">
            Administra los criterios asociados a esta rúbrica.
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-700/30 p-3 sm:p-4">
          <CriterioCompoenet />
        </div>
      </section>
    </div>
  );
}
