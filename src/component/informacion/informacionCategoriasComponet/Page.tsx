
import { categoriaInterface } from "@/interfaces/interfaces";
import React from "react";
type Props = {
    categoria: categoriaInterface;
    onClose: () => void; // Función para cerrar el modal
    onRefresh?: () => void; // Función para refrescar los datos
    openFormEditar: () => void; // Función para abrir el formulario de edición
}

const InformacionCategoriaComponent = ({ categoria, onClose, onRefresh ,openFormEditar}: Props) => {
       const onclickEditar = () => {

        openFormEditar?.();
         onClose?.();
    }

    return (
      <div className="h-full w-full min-w-0 max-w-xl overflow-y-auto text-slate-100 scrollbar-estetica">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Información de la categoría
        </h2>

        <header className="mt-4 border-b border-slate-500/45 pb-6">
          <div className="min-w-0">
            <h3
              className="text-balance text-xl font-bold leading-tight text-white sm:text-2xl"
              data-testid="informacion-categoria-nombre"
            >
              {categoria.nombreCategoria || "—"}
            </h3>
            <p
              className="mt-2 text-sm text-white/70"
              data-testid="informacion-categoria-detalles"
            >
              {categoria.detallesCategoria || "—"}
            </p>
          </div>
        </header>

        <div className="pt-6 flex justify-end">
          <button
            type="button"
            onClick={onclickEditar}
            className="rounded-xl bg-primario px-6 py-3 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110"
          >
            Editar
          </button>
        </div>
      </div>
    )
}

export default InformacionCategoriaComponent
