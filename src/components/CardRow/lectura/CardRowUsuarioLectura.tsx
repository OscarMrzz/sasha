import { perfilDatosAmpleosInterface } from "@/models";
import React from "react";

type Props = {
  perfil: perfilDatosAmpleosInterface;
};

export default function CardRowUsuarioLectura({ perfil }: Props) {
  return (
    <div
      data-testid="card-row"
      data-codigo={perfil.codigo}
      className="flex min-h-25 w-full flex-row flex-wrap justify-between gap-2 rounded-lg bg-slate-700 p-4 shadow-md hover:bg-slate-600"
    >
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-white">{perfil.nombre}</h2>
        <p className="text-slate-300">{perfil.codigo}</p>
        <p className="text-slate-200">{perfil.roles?.nombreRol?.trim() || "—"}</p>
        {perfil.bandas?.nombreBanda?.trim() ? (
          <p className="text-slate-200">{perfil.bandas.nombreBanda.trim()}</p>
        ) : null}
      </div>
    </div>
  );
}
