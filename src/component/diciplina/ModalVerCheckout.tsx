"use client";

import { CheckoutDetalleInterface } from "@/interfaces/interfaces";
import { formatCheckoutFechaHora } from "@/component/diciplina/checkoutUtils";

type Props = {
  registro: CheckoutDetalleInterface;
};

const labelClass = "text-xs uppercase text-slate-400";
const valueClass = "text-sm text-white";

function Campo({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p className={valueClass}>{value?.trim() ? value : "—"}</p>
    </div>
  );
}

export default function ModalVerCheckout({ registro }: Props) {
  const encargado = [registro.nombre_encargado_diciplina, registro.apellido_encargado_diciplina]
    .filter(Boolean)
    .join(" ");
  const confirmador = [registro.nombre_confirmador, registro.apellido_confirmador]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">
        {registro.nombreBanda ?? "Checkout"}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo label="Evento / Lugar" value={registro.LugarEvento} />
        <Campo label="Categoría" value={registro.nombreCategoria} />
        <Campo label="Región" value={registro.nombreRegion} />
        <Campo label="Hora llegada banda" value={formatCheckoutFechaHora(registro.hora_llegada_banda)} />
        <Campo
          label="Confirmación llegada"
          value={
            registro.confirmacion_horallegada == null
              ? "Pendiente"
              : registro.confirmacion_horallegada
                ? "Confirmada"
                : "Denegada"
          }
        />
        <Campo
          label="Hora confirmación llegada"
          value={registro.time_confirmacion_hora_llegada ?? "—"}
        />
        <Campo label="Hora ingreso" value={formatCheckoutFechaHora(registro.hora_ingreso)} />
        <Campo
          label="Confirmación ingreso"
          value={
            registro.confirmacion_hora_ingreso == null
              ? "Pendiente"
              : registro.confirmacion_hora_ingreso
                ? "Confirmada"
                : "Denegada"
          }
        />
        <Campo label="Integrantes" value={registro.cantidad_integrantes?.toString()} />
        <Campo label="Palillonas" value={registro.cantidad_palillonas?.toString()} />
        <Campo label="Aportación" value={registro.aportacion?.toString()} />
        <Campo label="Encargado disciplina" value={encargado || "—"} />
        <Campo label="Confirmador" value={confirmador || "—"} />
      </div>
      {registro.observaciones ? (
        <div>
          <p className={labelClass}>Observaciones</p>
          <p className="text-sm text-slate-200">{registro.observaciones}</p>
        </div>
      ) : null}
    </div>
  );
}
