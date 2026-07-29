"use client";

import { registroEquipoEvaluadorDatosAmpleosInterface } from "@/models";
import PerfilesServices from "@/services/perfilesServices";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type Props = {
  registro: registroEquipoEvaluadorDatosAmpleosInterface;
  compact?: boolean;
};

export default function CardRowEquipoEvaluadorLectura({ registro, compact = false }: Props) {
  const { data: perfil } = useQuery({
    queryKey: ["perfil", registro.idForaneaPerfil],
    queryFn: async () => {
      const svc = new PerfilesServices();
      return await svc.getOneDatosAmpleos(registro.idForaneaPerfil);
    },
    enabled: Boolean(registro?.idForaneaPerfil),
  });

  const nombre = perfil?.nombre ?? registro.perfiles?.nombre ?? "—";
  const rol = perfil?.roles?.nombreRol ?? registro.perfiles?.roles?.nombreRol ?? "—";

  if (compact) {
    return (
      <div className="text-left">
        <p className="text-sm font-semibold text-slate-100">{nombre}</p>
        <p className="text-xs text-slate-400">{rol}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-20 rounded-lg card-row-bg p-4 shadow-md">
      <h2 className="text-xl font-bold text-white">{nombre}</h2>
      <p className="text-slate-200">Rol: {rol}</p>
    </div>
  );
}
