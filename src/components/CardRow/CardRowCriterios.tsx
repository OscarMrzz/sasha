import React from "react";
import { criterioEvaluacionDatosAmpleosInterface } from "@/models";
import MenuMasOpciones from "@/components/ui/MenuMasOpciones";

type Props = {
  criterio: criterioEvaluacionDatosAmpleosInterface;
  onVer: (c: criterioEvaluacionDatosAmpleosInterface) => void;
  onEditar: (c: criterioEvaluacionDatosAmpleosInterface) => void;
  onEliminar: (c: criterioEvaluacionDatosAmpleosInterface) => void;
};

export default function CardRowCriterios({ criterio, onVer, onEditar, onEliminar }: Props) {
  return (
    <div
      data-testid="card-row"
      data-codigo={criterio.idCriterio}
      onDoubleClick={() => onVer(criterio)}
      className="flex w-full min-h-25 cursor-pointer justify-between rounded-lg card-row-bg p-4 shadow-md"
    >
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-200">{criterio.nombreCriterio}</h2>
        <p className="text-sm text-slate-300">Puntos: {criterio.puntosCriterio} %</p>
      </div>
      <div data-testid="menu-mas-opciones" onDoubleClick={(e) => e.stopPropagation()}>
        <MenuMasOpciones onView={() => onVer(criterio)} onEdit={() => onEditar(criterio)} onDelete={() => onEliminar(criterio)} />
      </div>
    </div>
  );
}
