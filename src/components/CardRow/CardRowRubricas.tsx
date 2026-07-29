import React from "react";
import { rubricaDatosAmpleosInterface } from "@/models";
import MenuMasOpciones from "@/components/ui/MenuMasOpciones";

type Props = {
  index?: number;
  rubrica: rubricaDatosAmpleosInterface;
  criteriosCount: number;
  onVer: (r: rubricaDatosAmpleosInterface) => void;
  onEditar: (r: rubricaDatosAmpleosInterface) => void;
  onEliminar: (r: rubricaDatosAmpleosInterface) => void;
};

export default function CardRowRubricas({ index, rubrica, criteriosCount, onVer, onEditar, onEliminar }: Props) {
  return (
    <div
      data-testid="card-row"
      data-codigo={rubrica.idRubrica}
      onDoubleClick={() => onVer(rubrica)}
      className="flex cursor-pointer items-center justify-between rounded-lg card-row-bg p-4 shadow-md"
    >
      <div className="flex min-w-0 items-center gap-4">
        {index != null ? (
          <p className="card-row-index text-lg">
            {index}
          </p>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">{rubrica.nombreRubrica}</h2>

          <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="chip-meta">
            Versión: {rubrica.versionRubrica || "—"}
          </span>
          <span className="chip-meta">
            Categoría: {rubrica.categorias?.nombreCategoria ?? "—"}
          </span>
          <span className="chip-meta">
            Puntos: {rubrica.puntosRubrica ?? 0}%
          </span>
          <span className="chip-meta">
            Criterios: {criteriosCount}
          </span>
          </div>
        </div>
      </div>
      <div data-testid="menu-mas-opciones" onDoubleClick={(e) => e.stopPropagation()}>
        <MenuMasOpciones onView={() => onVer(rubrica)} onEdit={() => onEditar(rubrica)} onDelete={() => onEliminar(rubrica)} />
      </div>
    </div>
  );
}
