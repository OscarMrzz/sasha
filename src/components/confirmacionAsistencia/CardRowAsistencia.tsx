import type { confirmacionConBandaInterface } from "@/models";
import { formatearFechaHoraConfirmacion } from "@/helpers/fechas/formatearFechaHoraConfirmacion";
import { cn } from "@/lib/utils";

type Props = {
  fila: confirmacionConBandaInterface;
  index?: number;
};

export default function CardRowAsistencia({ fila, index }: Props) {
  const confirmado = fila.estado_asistencia === true;

  return (
    <div
      data-testid="card-row-asistencia"
      data-codigo={fila.id_foranea_banda}
      className={cn(
        "flex w-full flex-col gap-4 rounded-xl card-row-bg p-5 shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6 animate-blurred-fade-in",
      )}
      style={
        index != null && index > 0
          ? { animationDelay: `${index * 0.08}s` }
          : undefined
      }
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        {fila.urlLogoBanda ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fila.urlLogoBanda}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
          />
        ) : (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-600 text-sm font-bold text-slate-300 sm:h-14 sm:w-14"
            aria-hidden
          >
            {fila.nombreBanda.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-lg font-bold leading-snug text-slate-100 sm:text-xl">
            {fila.nombreBanda}
          </h2>
          {fila.AliasBanda?.trim() ? (
            <p className="mt-0.5 text-sm text-slate-400">{fila.AliasBanda}</p>
          ) : null}
          <p className="mt-1 text-sm text-slate-400">{fila.nombreCategoria}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:items-end sm:text-right">
        <span
          className={cn(
            "inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
            confirmado
              ? "bg-emerald-500/20 text-emerald-200"
              : "bg-slate-600/80 text-slate-300",
          )}
        >
          {confirmado ? "Confirmada" : "Pendiente"}
        </span>
        <p className="text-sm text-slate-300">
          <span className="text-slate-500">Confirmó el </span>
          {formatearFechaHoraConfirmacion(fila.created_at)}
        </p>
      </div>
    </div>
  );
}
