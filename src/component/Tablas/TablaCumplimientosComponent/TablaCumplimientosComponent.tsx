import React from "react";
import { cumplimientosDatosAmpleosInterface } from "@/interfaces/interfaces";
import CardRowCumplimientos from "@/component/CardRow/CardRowCumplimientos";

type Props = {
  cumpimientos: cumplimientosDatosAmpleosInterface[];
  onRefresh?: () => void;
  onVerCumplimiento: (c: cumplimientosDatosAmpleosInterface) => void;
  onEditarCumplimiento: (c: cumplimientosDatosAmpleosInterface) => void;
  onEliminarCumplimiento: (c: cumplimientosDatosAmpleosInterface) => void;
};

export default function TablaCumplimientosComponent({
  cumpimientos,
  onVerCumplimiento,
  onEditarCumplimiento,
  onEliminarCumplimiento,
}: Props) {
  return (
    <div className="flex flex-col gap-4 ">
      {cumpimientos.map((cumplimiento) => (
        <CardRowCumplimientos
          key={cumplimiento.idCumplimiento}
          cumplimiento={cumplimiento}
          onVer={onVerCumplimiento}
          onEditar={onEditarCumplimiento}
          onEliminar={onEliminarCumplimiento}
        />
      ))}
    </div>
  );
}
