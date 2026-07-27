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
        "rounded-2xl border border-slate-700/50 bg-slate-700/60 p-4 backdrop-blur-sm md:p-6",
        "xl:flex xl:h-full xl:min-h-0 xl:flex-col",
        className
      )}
    >
      <h2 className="mb-4 text-lg font-semibold text-white">
        Estadísticas descriptivas
      </h2>
      <div className="flex gap-3 sm:grid-cols-3 xl:flex-1 xl:content-start ">
        {cells.map((c) => (
          <div
            key={c.title}
            className="rounded-xl border border-slate-600/40 bg-slate-900/40 p-4 w-full"
          >
            <p className="text-sm font-medium text-blue-300">{c.title}</p>
            <p className="text-xs text-slate-500">{c.subtitle}</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-white">
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
