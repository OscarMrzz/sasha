import React from "react";
import { CheckoutDetalleInterface } from "@/models";
import MenuMasOpcionesVerIngreso from "@/components/ui/MenuMasOpcionesVerIngreso";
import { formatCheckoutFechaHora } from "@/components/diciplina/checkoutUtils";

type Props = {
  registro: CheckoutDetalleInterface;
  onView: () => void;
  onIngreso?: () => void;
};

export default function CardRowCheckoutEntrada({
  registro,
  onView,
  onIngreso,
}: Props) {
  const yaIngreso = Boolean(registro.time_envio_confirmacion_ingreso);

  return (
    <div
      onDoubleClick={onView}
      className="flex min-h-[5rem] w-full flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-700 p-4 shadow-md cursor-pointer hover:bg-slate-600"
    >
      <div className="min-w-0 flex-1 pr-4">
        <h2 className="text-lg font-semibold text-white">
          {registro.nombreBanda ?? "Banda sin nombre"}
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Hora llegada:{" "}
          <span className="font-medium text-white">
            {formatCheckoutFechaHora(registro.hora_llegada_banda)}
          </span>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {registro.nombreCategoria ?? "—"} · {registro.nombreRegion ?? "—"}
          {yaIngreso ? " · Ingreso enviado" : " · Pendiente ingreso"}
        </p>
      </div>
      <div onDoubleClick={(e) => e.stopPropagation()}>
        <MenuMasOpcionesVerIngreso
          onView={onView}
          onIngreso={yaIngreso ? undefined : onIngreso}
        />
      </div>
    </div>
  );
}
