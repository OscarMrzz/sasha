import React from "react";
import { rubricaDatosAmpleosInterface } from "@/interfaces/interfaces";
import CardRowRubricas from "@/component/CardRow/CardRowRubricas";

type Props = {
  rubricas: rubricaDatosAmpleosInterface[];
  criteriosCountPorRubrica: Record<string, number>;
  onRefresh?: () => void;
  onVerRubrica: (r: rubricaDatosAmpleosInterface) => void;
  onEditarRubrica: (r: rubricaDatosAmpleosInterface) => void;
  onEliminarRubrica: (r: rubricaDatosAmpleosInterface) => void;
};

export default function TablaRubricasComponent({
  rubricas,
  criteriosCountPorRubrica,
  onVerRubrica,
  onEditarRubrica,
  onEliminarRubrica,
}: Props) {
  return (
    <div className="w-full ">
      <div className="flex flex-col gap-4">
        {rubricas.map((rubrica, index) => (
          <CardRowRubricas
            key={rubrica.idRubrica}
            index={index + 1}
            rubrica={rubrica}
            criteriosCount={criteriosCountPorRubrica[rubrica.idRubrica] ?? 0}
            onVer={onVerRubrica}
            onEditar={onEditarRubrica}
            onEliminar={onEliminarRubrica}
          />
        ))}
      </div>
    </div>
  );
}
