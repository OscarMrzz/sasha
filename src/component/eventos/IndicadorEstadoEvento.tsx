import CirculoOnda from "@/component/circuloAnimado/CirculoOlnda";
import React from "react";

type Props = {
  /** `true` cuando `estado_evento === "iniciado"` */
  iniciado: boolean;
  className?: string;
};

export default function IndicadorEstadoEvento({ iniciado, className = "" }: Props) {
  return (
    <div
      className={`flex h-fit shrink-0 items-start justify-start ${className}`.trim()}
      role="img"
      aria-label={iniciado ? "Evento activo / en curso" : "Evento inactivo"}
    >
      {iniciado ? (
        <CirculoOnda size="mini" />
      ) : (
        <div className="h-4 w-4 shrink-0 rounded-full bg-slate-400" />
      )}
    </div>
  );
}
