"use client";

import ControlesIniciarPararEvento from "@/components/eventos/ControlesIniciarPararEvento";
import IndicadorEstadoEvento from "@/components/eventos/IndicadorEstadoEvento";
import { registroEventoDatosAmpleosInterface } from "@/models";
import MenuMasOpciones from "@/components/ui/MenuMasOpciones";
import { Button } from "@/components/ui/button";
import { EyeIcon } from "lucide-react";
import React from "react";

type Props = {
  evento: registroEventoDatosAmpleosInterface;

  onFusionarEstadoEvento?: (idEvento: string, estado_evento: "iniciado" | "finalizado") => void;
  /** Solo "Ver" (sin editar / eliminar en el menú) */
  modoSoloVer?: boolean;
  /** Oculta iniciar/parar (p. ej. rol responsable de eventos) */
  ocultarControles?: boolean;
};

export default function CardRowEventosLectura({
  evento,

  onFusionarEstadoEvento,
  modoSoloVer = false,
  ocultarControles = false,
}: Props) {
  const noop = () => {};

  return (
    <div
      data-testid="card-row"
      data-codigo={evento.idEvento}
   
      className="relative w-full min-h-25 rounded-lg card-row-bg p-4 shadow-md flex cursor-pointer flex-row justify-between"
    >
    

      <div className="flex w-full flex-row items-center justify-between pr-1">
        <div className="min-w-0 flex-1 pr-2">
          <h2 className="text-xl font-bold text-white">{evento.LugarEvento || "—"}</h2>
          <p className="text-slate-400">Región: {evento.regiones?.nombreRegion ?? "—"}</p>
          <p className="text-slate-400">Fecha: {evento.fechaEvento ?? "—"}</p>
        
        </div>

      </div>
    </div>
  );
}
