"use client";

import CardRowEquipoEvaluadorLectura from "@/components/eventos/CardRowEquipoEvaluadorLectura";
import RegistroEquipoEvaluadorServices from "@/services/registroEquipoEvaluadorServices";
import { useQuery } from "@tanstack/react-query";
import React, { useRef } from "react";

type Props = {
  idEvento: string;
  variant?: "default" | "embedded";
};

export default function ListaEquipoEvaluadorLectura({ idEvento, variant = "default" }: Props) {
  const embedded = variant === "embedded";
  const registroEquipoEvaluadorServices = useRef(new RegistroEquipoEvaluadorServices());

  const { data: equipoEvaluadorList = [], isLoading } = useQuery({
    queryKey: ["equipoEvaluador-lectura", idEvento],
    queryFn: async () => {
      return await registroEquipoEvaluadorServices.current.getDatosAmpleos(idEvento);
    },
    enabled: Boolean(idEvento),
  });

  if (isLoading) {
    return (
      <p
        className={
          embedded
            ? "text-sm text-slate-400"
            : "rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60"
        }
      >
        Cargando equipo evaluador...
      </p>
    );
  }

  if (equipoEvaluadorList.length === 0) {
    return (
      <p
        className={
          embedded
            ? "text-sm text-slate-500"
            : "rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60"
        }
      >
        No hay miembros en el equipo evaluador.
      </p>
    );
  }

  if (embedded) {
    return (
      <ul className="flex flex-wrap gap-2">
        {equipoEvaluadorList.map((registro) => (
          <li
            key={registro.idRegistroEvaluador ?? registro.idForaneaPerfil}
            className="rounded-xl border border-slate-600/50 bg-slate-800/80 px-3 py-2"
          >
            <CardRowEquipoEvaluadorLectura registro={registro} compact />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      {equipoEvaluadorList.map((registro) => (
        <CardRowEquipoEvaluadorLectura
          key={registro.idRegistroEvaluador ?? registro.idForaneaPerfil}
          registro={registro}
        />
      ))}
    </div>
  );
}
