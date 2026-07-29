import CirculoOnda from "@/components/circuloAnimado/CirculoOlnda";
import React from "react";

type Props = {
  /** `true` cuando `estado_evento === "iniciado"` */
  iniciado: boolean;
  className?: string;
};

export default function IndicadorEstadoEvento({ iniciado, className = "" }: Props) {
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-visible ${className}`.trim()}
      role="img"
      aria-label={iniciado ? "Evento activo / en curso" : "Evento inactivo"}
    >
      {iniciado ? (
        <CirculoOnda size="mini" />
      ) : (
        <div className="h-3.5 w-3.5 shrink-0 rounded-full bg-slate-400" />
      )}
    </div>
  );
}
