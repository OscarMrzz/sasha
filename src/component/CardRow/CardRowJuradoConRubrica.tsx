"use client";

import React, { useMemo } from "react";
import {
  registroEquipoEvaluadorDatosAmpleosInterface,
  rubricaDatosAmpleosInterface,
} from "@/interfaces/interfaces";
import MenuMasOpcionesVerEliminarRubrica from "@/components/ui/MenuMasOpcionesVerEliminarRubrica";
import PerfilesServices from "@/lib/services/perfilesServices";
import { useQuery } from "@tanstack/react-query";

type Props = {
  registro: registroEquipoEvaluadorDatosAmpleosInterface;
  rubricas: rubricaDatosAmpleosInterface[];
  onRubrica: (registro: registroEquipoEvaluadorDatosAmpleosInterface) => void;
  onView: (registro: registroEquipoEvaluadorDatosAmpleosInterface) => void;
  onDelete: (registro: registroEquipoEvaluadorDatosAmpleosInterface) => void;
};

export default function CardRowJuradoConRubrica({
  registro,
  rubricas,
  onRubrica,
  onView,
  onDelete,
}: Props) {
  const { data: perfil } = useQuery({
    queryKey: ["perfil", registro.idForaneaPerfil],
    queryFn: async () => {
      const svc = new PerfilesServices();
      return await svc.getOneDatosAmpleos(registro.idForaneaPerfil);
    },
    enabled: Boolean(registro?.idForaneaPerfil),
  });

  const nombre = perfil?.nombre ?? registro.perfiles?.nombre ?? "—";
  const rubricaActual = useMemo(
    () => rubricas.find((r) => r.idRubrica === (registro.id_foranea_rubrica ?? "")),
    [rubricas, registro.id_foranea_rubrica],
  );

  return (
    <div
      data-testid="card-row-jurado"
      data-codigo={registro.idRegistroEvaluador ?? registro.idForaneaPerfil}
      className="w-full rounded-lg bg-slate-600 p-4 shadow-md"
    >
      <div className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white">{nombre}</h2>
  
          {rubricaActual ? (
            <p className="mt-1 text-sm text-slate-300">
              Rúbrica: {rubricaActual.nombreRubrica} · {rubricaActual.categorias?.nombreCategoria ?? "—"}
            </p>
          ) : (
            <p className="mt-1 text-sm text-amber-300/90">Sin rúbrica asignada</p>
          )}
        </div>
        <div data-testid="menu-mas-opciones" onDoubleClick={(e) => e.stopPropagation()}>
          <MenuMasOpcionesVerEliminarRubrica
            onView={() => onView(registro)}
            onDelete={() => onDelete(registro)}
            onRubrica={() => onRubrica(registro)}
          />
        </div>
      </div>
    </div>
  );
}
