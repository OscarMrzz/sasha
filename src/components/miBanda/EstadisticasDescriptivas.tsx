"use client";

import { cn } from "@/lib/utils";

export type EstadisticasDescriptivasProps = {
  promedio: number;
  className?: string;
};

export function EstadisticasDescriptivas({
  promedio,
  className,
}: EstadisticasDescriptivasProps) {
  const cells = [
    {
      title: "Promedio",
      subtitle: "Promedio temporada",
      value: promedio ? `${Number(promedio).toFixed(2)}%` : "—",
    },
  ];

  return (
    <section
      className={cn(
        "card-row-bg rounded-2xl border border-[var(--vz-border)] p-4 md:p-6",
        "xl:flex xl:h-full xl:min-h-0 xl:flex-col",
        className
      )}
    >
      <h2 className="mb-4 text-lg font-semibold text-[var(--app-fg)]">
        Estadísticas descriptivas
      </h2>
      <div className="flex gap-3 sm:grid-cols-3 xl:flex-1 xl:content-start">
        {cells.map((c) => (
          <div
            key={c.title}
            className="w-full rounded-xl border border-[var(--vz-border)] bg-[#fafafa] p-4"
          >
            <p className="text-sm font-medium text-[var(--brand)]">{c.title}</p>
            <p className="text-xs text-[var(--app-fg-muted)]">{c.subtitle}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-[var(--app-fg)]">
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
