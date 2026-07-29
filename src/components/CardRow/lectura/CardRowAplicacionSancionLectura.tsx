import { vistaAplicacionSancionInterface } from "@/models";

type Props = {
  registro: vistaAplicacionSancionInterface;
};

function fmtFecha(val: string | Date | null | undefined): string {
  if (!val) return "—";
  if (typeof val === "string") return val.slice(0, 10);
  return val.toISOString().slice(0, 10);
}

function nombreSancionador(registro: vistaAplicacionSancionInterface): string | null {
  const nombre = registro.nombre_sancionador?.trim();
  const apellido = registro.apellido_sancionador?.trim();
  if (!nombre && !apellido) return null;
  return [nombre, apellido].filter(Boolean).join(" ");
}

export default function CardRowAplicacionSancionLectura({ registro }: Props) {
  const sancionador = nombreSancionador(registro);

  return (
    <div className="card-row-bg flex min-h-[12rem] w-full flex-col overflow-hidden rounded-xl shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--vz-border)] p-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-[var(--app-fg)]">
            {registro.nombreBanda ?? "—"}
          </h2>
          <p className="mt-1 text-xs text-[var(--app-fg-muted)]">
            {fmtFecha(registro.fecha_aplico_sancion)}
            {sancionador ? ` · ${sancionador}` : ""}
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-rose-50 px-2.5 py-1 text-sm font-semibold text-rose-700">
          -{registro.puntos_sancion ?? 0} pts
        </span>
      </div>
      <p className="line-clamp-3 p-4 text-sm text-[var(--app-fg)]">
        {registro.detalles_sancion ?? "—"}
      </p>
      {registro.justificacion ? (
        <div className="mt-auto border-t border-[var(--vz-border)] bg-[#fafafa] px-4 py-3">
          <p className="line-clamp-2 text-xs italic text-[var(--app-fg-muted)]">
            &ldquo;{registro.justificacion}&rdquo;
          </p>
        </div>
      ) : null}
    </div>
  );
}
