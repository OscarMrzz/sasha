import React from "react";
import { cumplimientosDatosAmpleosInterface } from "@/models";
import MenuMasOpciones from "@/components/ui/MenuMasOpciones";

type Props = {
  cumplimiento: cumplimientosDatosAmpleosInterface;
  onVer: (c: cumplimientosDatosAmpleosInterface) => void;
  onEditar: (c: cumplimientosDatosAmpleosInterface) => void;
  onEliminar: (c: cumplimientosDatosAmpleosInterface) => void;
};

export default function CardRowCumplimientos({ cumplimiento, onVer, onEditar, onEliminar }: Props) {
  const tituloFila =
    cumplimiento.detalleCumplimiento?.trim() ||
    `Cumplimiento ${cumplimiento.puntosCumplimiento ?? 0} pts`;

  return (
    <div
      data-testid="card-row"
      data-codigo={cumplimiento.idCumplimiento}
      onDoubleClick={() => onVer(cumplimiento)}
      className="flex w-full min-h-25 cursor-pointer justify-between rounded-lg card-row-bg p-4 shadow-md"
    >
      <div className="flex min-w-0 flex-col gap-2">
        <h2 className="line-clamp-2 text-lg font-semibold text-slate-200">{tituloFila}</h2>
        <p className="text-sm text-slate-300">{cumplimiento.puntosCumplimiento} pts</p>
      </div>
      <div data-testid="menu-mas-opciones" onDoubleClick={(e) => e.stopPropagation()}>
        <MenuMasOpciones
          onView={() => onVer(cumplimiento)}
          onEdit={() => onEditar(cumplimiento)}
          onDelete={() => onEliminar(cumplimiento)}
        />
      </div>
    </div>
  );
}
