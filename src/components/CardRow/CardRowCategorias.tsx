import React from "react";
import { categoriaInterface } from "@/models";
import MenuMasOpciones from "@/components/ui/MenuMasOpciones";

type Props = {
  index?: number;
  categoria: categoriaInterface;
  abrirInformacion: (categoria: categoriaInterface) => void;
  abrirEditar: (categoria: categoriaInterface) => void;
  abrirEliminar: (categoria: categoriaInterface) => void;
};

export default function CardRowCategorias({
  index,
  categoria,
  abrirInformacion,
  abrirEditar,
  abrirEliminar,
}: Props) {
  return (
    <div
      data-testid="card-row"
      data-codigo={categoria.idCategoria}
      onDoubleClick={() => abrirInformacion(categoria)}
      className="flex h-25 w-full flex-wrap items-center justify-between rounded-lg bg-slate-700 p-4 shadow-md cursor-pointer hover:bg-slate-600"
    >
      <div className="flex min-w-0 items-center gap-4">
        {index != null ? (
          <p className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-600 text-lg font-bold text-slate-100">
            {index}
          </p>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-xl text-white">{categoria.nombreCategoria}</h2>
        </div>
      </div>
      <div data-testid="menu-mas-opciones">
        <MenuMasOpciones
          onView={() => abrirInformacion(categoria)}
          onEdit={() => abrirEditar(categoria)}
          onDelete={() => abrirEliminar(categoria)}
        />
      </div>
    </div>
  );
}

