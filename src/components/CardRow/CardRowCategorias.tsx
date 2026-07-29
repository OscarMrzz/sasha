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
      className="flex h-25 w-full flex-wrap items-center justify-between rounded-lg card-row-bg p-4 shadow-md cursor-pointer"
    >
      <div className="flex min-w-0 items-center gap-4">
        {index != null ? (
          <p className="card-row-index text-lg">
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

