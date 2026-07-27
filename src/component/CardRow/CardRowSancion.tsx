import React from "react";
import { sancionInterface } from "@/interfaces/interfaces";
import MenuMasOpciones from "@/components/ui/MenuMasOpciones";

type Props = {
  index?: number;
  sancion: sancionInterface;
  abrirInformacion: (s: sancionInterface) => void;
  abrirEditar: (s: sancionInterface) => void;
  abrirEliminar: (s: sancionInterface) => void;
};

export default function CardRowSancion({
  index,
  sancion,
  abrirInformacion,
  abrirEditar,
  abrirEliminar,
}: Props) {
  return (
    <div
      onDoubleClick={() => abrirInformacion(sancion)}
      className="flex min-h-[5rem] w-full flex-wrap items-center justify-between rounded-lg bg-slate-700 p-4 shadow-md cursor-pointer hover:bg-slate-600"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4 pr-4">
        {index != null ? (
          <p className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-600 text-lg font-bold text-slate-100">
            {index}
          </p>
        ) : null}
        <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold text-white">
          {sancion.detalles_sancion}
        </h2>
        <p className="mt-1 text-sm text-red-300 font-medium">
          -{sancion.puntos_sancion} puntos
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {sancion.version ? `Versión ${sancion.version}` : "Sin versión"}
          {sancion.fecha_creacion_sancion
            ? ` · ${String(sancion.fecha_creacion_sancion).slice(0, 10)}`
            : ""}
        </p>
        </div>
      </div>
      <div>
        <MenuMasOpciones
          onView={() => abrirInformacion(sancion)}
          onEdit={() => abrirEditar(sancion)}
          onDelete={() => abrirEliminar(sancion)}
        />
      </div>
    </div>
  );
}
