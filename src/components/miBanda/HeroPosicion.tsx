"use client";

import StartRakingComponet from "@/components/StartRankin/StartRakingComponet";
import { cn } from "@/lib/utils";
import type { vistaResultadosTenporadaInterface } from "@/models";

export type HeroPosicionProps = {
  resultado?: vistaResultadosTenporadaInterface;
  nombreBanda?: string;
  promedioTemporada: number;
  estrellasTexto?: string;
  className?: string;
};

export function HeroPosicion({
  resultado,
  nombreBanda,
  promedioTemporada,
  className,
}: HeroPosicionProps) {
  const rank = resultado?.rankin;
  const top3 =
    rank !== undefined &&
    rank !== null &&
    rank >= 1 &&
    rank <= 3;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--vz-border)] bg-white p-6 md:p-8",
        className
      )}
    >
      <div className="relative flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="mt-1 text-center text-2xl font-bold text-[var(--app-fg)] md:text-left md:text-3xl">
            {nombreBanda ?? resultado?.nombreBanda ?? "Mi banda"}
          </h1>
          <p className="mt-1 text-sm text-[var(--app-fg-muted)]">
            {resultado?.nombreCategoria && (
              <span>Categoría: {resultado.nombreCategoria}</span>
            )}
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              "flex h-36 w-36 flex-col items-center justify-center rounded-full border-4 shadow-sm md:h-40 md:w-40",
              top3
                ? "border-amber-300 bg-amber-50"
                : "border-[var(--vz-border)] bg-[#fafafa]"
            )}
          >
            <span
              className={cn(
                "text-6xl font-black tabular-nums md:text-7xl",
                top3 ? "text-amber-800" : "text-[var(--brand)]"
              )}
            >
              {rank ?? "?"}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-fg-muted)]">
              Posición
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <StartRakingComponet promedio={promedioTemporada} />
          </div>
        </div>
      </div>
    </section>
  );
}
