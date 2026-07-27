import React from "react";
import { rubricaDatosAmpleosInterface } from "@/interfaces/interfaces";
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
      className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-700 p-4 shadow-md hover:bg-slate-600"
    >
      <div className="flex min-w-0 items-center gap-4">
        {index != null ? (
          <p className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-600 text-lg font-bold text-slate-100">
            {index}
          </p>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-200">{rubrica.nombreRubrica}</h2>

          <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/75">
            Versión: {rubrica.versionRubrica || "—"}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/75">
            Categoría: {rubrica.categorias?.nombreCategoria ?? "—"}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/80">
            Puntos: {rubrica.puntosRubrica ?? 0}%
          </span>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/75">
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
