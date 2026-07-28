import React from "react";
import { criterioEvaluacionDatosAmpleosInterface } from "@/models";
import CardRowCriterios from "@/components/CardRow/CardRowCriterios";

type Props = {
  Criterios: criterioEvaluacionDatosAmpleosInterface[];
  onRefresh?: () => void;
  onVerCriterio: (c: criterioEvaluacionDatosAmpleosInterface) => void;
  onEditarCriterio: (c: criterioEvaluacionDatosAmpleosInterface) => void;
  onEliminarCriterio: (c: criterioEvaluacionDatosAmpleosInterface) => void;
};

export default function TablaCriteriosComponent({
  Criterios,
  onVerCriterio,
  onEditarCriterio,
  onEliminarCriterio,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {Criterios.map((criterio) => (
        <CardRowCriterios
          key={criterio.idCriterio}
          criterio={criterio}
          onVer={onVerCriterio}
          onEditar={onEditarCriterio}
          onEliminar={onEliminarCriterio}
        />
      ))}
    </div>
  );
}
