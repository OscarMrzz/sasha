import React from "react";
import { CheckoutDetalleInterface } from "@/models";
import MenuMasOpcionesVerResponder from "@/components/ui/MenuMasOpcionesVerResponder";
import { formatCheckoutFechaHora } from "@/components/diciplina/checkoutUtils";

type Props = {
  registro: CheckoutDetalleInterface;
  tipo: "llegada" | "ingreso";
  onView: () => void;
  onResponder?: () => void;
};

export default function CardRowCheckoutNotificacion({
  registro,
  tipo,
  onView,
  onResponder,
}: Props) {
  const encargado = [
    registro.nombre_encargado_diciplina,
    registro.apellido_encargado_diciplina,
  ]
    .filter(Boolean)
    .join(" ");

  const hora =
    tipo === "llegada"
      ? formatCheckoutFechaHora(registro.hora_llegada_banda)
      : formatCheckoutFechaHora(registro.hora_ingreso);

  const etiqueta = tipo === "llegada" ? "Llegada" : "Ingreso";

  return (
    <div
      onDoubleClick={onView}
      className="card-row-bg flex min-h-[5rem] w-full cursor-pointer flex-wrap items-center justify-between gap-3 rounded-lg p-4 shadow-sm"
    >
      <div className="min-w-0 flex-1 pr-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-[var(--app-fg)]">
            {registro.LugarEvento ?? "Evento"}
          </h2>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-xs font-medium text-amber-800">
            Confirmar {etiqueta.toLowerCase()}
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--app-fg-muted)]">
          {etiqueta}: <span className="font-medium text-[var(--app-fg)]">{hora}</span>
        </p>
        <p className="mt-1 text-xs text-[var(--app-fg-muted)]">
          Enviado por: {encargado || "Comité de disciplina"}
        </p>
      </div>
      <div onDoubleClick={(e) => e.stopPropagation()}>
        <MenuMasOpcionesVerResponder onView={onView} onResponder={onResponder} />
      </div>
    </div>
  );
}
