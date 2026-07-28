import { bandaDatosAmpleosInterface } from "@/models";
import React from "react";
import MenuMasOpciones from "@/components/ui/MenuMasOpciones";

type Props = {
  banda: bandaDatosAmpleosInterface;

};

export default function CardRowBandaLectura({ banda }: Props) {
  return (
    <div
      data-testid="card-row"
      data-codigo={banda.idBanda}
      className="w-full min-h-25 bg-slate-700 flex flex-row justify-between p-4 cursor-pointer hover:bg-slate-600 rounded-lg shadow-md"
    >
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-white">{banda.nombreBanda}</h2>
        <p className="text-slate-200">Categoría: {banda.categorias?.nombreCategoria ?? "—"}</p>
        <p className="text-slate-200">Región: {banda.regiones?.nombreRegion ?? "—"}</p>
      </div>
    </div>
  );
}

