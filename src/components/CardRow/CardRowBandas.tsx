import { bandaDatosAmpleosInterface } from "@/models";
import React from "react";
import MenuMasOpciones from "@/components/ui/MenuMasOpciones";

type Props = {
  index: number;
  banda: bandaDatosAmpleosInterface;
  abrirInformacion: (banda: bandaDatosAmpleosInterface) => void;
  abrirEditar: (banda: bandaDatosAmpleosInterface) => void;
  abrirEliminar: (banda: bandaDatosAmpleosInterface) => void;
};

export default function CardRowBandas({ index, banda, abrirInformacion, abrirEditar, abrirEliminar }: Props) {
  return (
    <div
      data-testid="card-row"
      data-codigo={banda.idBanda}
      onDoubleClick={() => abrirInformacion(banda)}
      className="w-full min-h-25 card-row-bg flex flex-row justify-between p-4 cursor-pointer rounded-lg shadow-md"
    >
      <div className="flex min-w-0 items-center gap-4">
        <p className="card-row-index text-lg">
          {index}
        </p>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white">{banda.nombreBanda}</h2>
          <p className="text-slate-200">Categoría: {banda.categorias?.nombreCategoria ?? "—"}</p>
          <p className="text-slate-200">Región: {banda.regiones?.nombreRegion ?? "—"}</p>
        </div>
      </div>
      <div data-testid="menu-mas-opciones" onDoubleClick={(e) => e.stopPropagation()}>
        <MenuMasOpciones onView={() => abrirInformacion(banda)} onEdit={() => abrirEditar(banda)} onDelete={() => abrirEliminar(banda)} />
      </div>
    </div>
  );
}

