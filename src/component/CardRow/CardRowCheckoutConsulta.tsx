import React from "react";
import { CheckoutDetalleInterface } from "@/interfaces/interfaces";
import {
  clasesEstadoCheckout,
  estadoCheckoutConsulta,
  etiquetaEstadoCheckout,
  formatCheckoutSoloHora,
} from "@/component/diciplina/checkoutUtils";
import MenuMasOpcionesVerIngreso from "@/components/ui/MenuMasOpcionesVerIngreso";

type Props = {
  registro: CheckoutDetalleInterface;
  onView: () => void;
};

export default function CardRowCheckoutConsulta({ registro, onView }: Props) {
  const estado = estadoCheckoutConsulta(registro);

  return (
    <div className="flex min-h-[5rem] w-full flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-700 p-4 shadow-md">
      <div className="min-w-0 flex-1 pr-4">
        <h2 className="text-lg font-semibold text-white">
          {registro.nombreBanda ?? "Banda sin nombre"}
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Llegada: {formatCheckoutSoloHora(registro.hora_llegada_banda)} · Ingreso:{" "}
          {formatCheckoutSoloHora(registro.hora_ingreso)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {registro.nombreCategoria ?? "—"} · {registro.nombreRegion ?? "—"}
          {registro.LugarEvento ? ` · ${registro.LugarEvento}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={`rounded-full border px-3 py-0.5 text-xs font-medium ${clasesEstadoCheckout(estado)}`}
        >
          {etiquetaEstadoCheckout(estado)}
        </span>
        <div onClick={(e) => e.stopPropagation()}>
          <MenuMasOpcionesVerIngreso onView={onView} />
        </div>
      </div>
    </div>
  );
}
