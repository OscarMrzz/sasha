import { regionesDatosAmpleosInterface, regionesInterface } from "@/interfaces/interfaces";
import React from "react";
import MenuMasOpciones from "@/components/ui/MenuMasOpciones";

type Props = {
  index?: number;
  region: regionesDatosAmpleosInterface;
  abrirInformacion: (region: regionesDatosAmpleosInterface) => void;
  abrirEditar: (region: regionesDatosAmpleosInterface) => void;
  abrirEliminar: (region: regionesDatosAmpleosInterface) => void;
  ultimaRegion: regionesInterface | null;
  mostrarAnimacion: boolean;
};

export default function CardRowRegiones({
  index,
  region,
  abrirInformacion,
  abrirEditar,
  abrirEliminar,
  ultimaRegion,
  mostrarAnimacion,
}: Props) {
  const isNuevo = region.idRegion === ultimaRegion?.idRegion && mostrarAnimacion;

  const indexBadge =
    index != null ? (
      <p className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-600 text-lg font-bold text-slate-100">
        {index}
      </p>
    ) : null;

  if (isNuevo) {
    return (
      <div
        data-testid="card-row-nuevo"
        data-codigo={region.idRegion}
        onDoubleClick={() => abrirInformacion(region)}
        className="animate-pulse"
      >
        <div className="bg-slate-400 text-slate-700 rounded-lg flex h-25 w-full flex-wrap items-center justify-between p-4">
          <div className="flex min-w-0 items-center gap-4">
            {indexBadge}
            <div>
              <h2 className="text-xl">{region.nombreRegion}</h2>
            </div>
          </div>
          <div data-testid="menu-mas-opciones">
            <MenuMasOpciones
              onView={() => abrirInformacion(region)}
              onEdit={() => abrirEditar(region)}
              onDelete={() => abrirEliminar(region)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="card-row"
      data-codigo={region.idRegion}
      onDoubleClick={() => abrirInformacion(region)}
      className="flex h-25 w-full flex-wrap items-center justify-between rounded-lg bg-slate-700 p-4 shadow-md cursor-pointer hover:bg-slate-600"
    >
      <div className="flex min-w-0 items-center gap-4">
        {indexBadge}
        <div>
          <h2 className="text-xl">{region.nombreRegion}</h2>
        </div>
      </div>
      <div data-testid="menu-mas-opciones">
        <MenuMasOpciones
          onView={() => abrirInformacion(region)}
          onEdit={() => abrirEditar(region)}
          onDelete={() => abrirEliminar(region)}
        />
      </div>
    </div>
  );
}
