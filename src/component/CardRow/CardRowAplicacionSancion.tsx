import React from "react";
import { vistaAplicacionSancionInterface } from "@/interfaces/interfaces";

type Props = {
  registro: vistaAplicacionSancionInterface;
};

function fmtFecha(val: string | Date | null | undefined): string {
  if (!val) return "—";
  if (typeof val === "string") return val.slice(0, 10);
  return val.toISOString().slice(0, 10);
}

export default function CardRowAplicacionSancion({ registro }: Props) {
  return (
    <div className="flex min-h-[5rem] w-full flex-col gap-1 rounded-lg border border-slate-700  shadow-md hover:bg-slate-600">
      <div className="flex items-start justify-between gap-2 p-4">
        <h2 className="text-lg font-semibold text-white">
          {registro.nombreBanda ?? "—"}
        </h2> 
        <span className="shrink-0 text-sm font-bold text-red-500">
          -{registro.puntos_sancion ?? 0} pts
        </span>
      </div>
      <p className="text-sm text-slate-200 line-clamp-2 p-4">
        {registro.detalles_sancion ?? "—"}
      </p>
      <span className="text-xs text-slate-500 p-4">{fmtFecha(registro.fecha_aplico_sancion)}</span>
  <section className="flex flex-col gap-2 bg-slate-900 w-full h-full p-4 rounded-b-lg">


      {registro.justificacion && (
        <p className="mt-1 text-xs italic text-slate-500  line-clamp-2">
          "{registro.justificacion}"
        </p>
      )}
        </section>
    </div>
  );
}
