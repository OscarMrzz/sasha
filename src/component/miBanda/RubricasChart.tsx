"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { RubricaStats } from "@/lib/utils/estadisticasHelpers";
import { cn } from "@/lib/utils";
import { Label, PolarGrid, RadialBar, RadialBarChart } from "recharts";

/** Colores claros y legibles sobre fondo slate oscuro */
function fillForPct(p: number) {
  if (p >= 85) return "hsl(46 92% 64%)";
  if (p >= 70) return "hsl(165 55% 52%)";
  if (p >= 50) return "hsl(199 75% 58%)";
  return "hsl(218 28% 58%)";
}

const TRACK_FILL = "hsl(222 18% 22%)";

/** Hasta dos líneas para el centro del círculo */
function nombreLineas(nombre: string): [string] | [string, string] {
  const t = nombre.trim();
  if (t.length <= 14) return [t];
  const mid = Math.floor(t.length / 2);
  const cut = t.lastIndexOf(" ", mid + 6);
  const i = cut > 6 ? cut : mid;
  const a = t.slice(0, i).trim();
  const b = t.slice(i).trim();
  if (!b) return [t.length > 24 ? `${t.slice(0, 23)}…` : t];
  return [a.length > 16 ? `${a.slice(0, 15)}…` : a, b.length > 16 ? `${b.slice(0, 15)}…` : b];
}

function RubricaRadialCell({ stat }: { stat: RubricaStats }) {
  const v = Math.min(100, Math.max(0, stat.porcentaje));
  const color = fillForPct(v);
  const chartConfig = {
    valor: {
      label: stat.nombreRubrica,
      color,
    },
  } satisfies ChartConfig;

  const data = [
    {
      rubrica: "valor",
      valor: v,
      fill: "var(--color-valor)",
    },
  ];

  const lineas = nombreLineas(stat.nombreRubrica);
  const escalaOk = stat.maxPosible > 0;

  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-500/25 bg-slate-900/40 p-4">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full max-w-[148px]"
        initialDimension={{ width: 148, height: 148 }}
      >
        <RadialBarChart
          data={data}
          startAngle={90}
          endAngle={-270}
          innerRadius={62}
          outerRadius={70}
        >
          <PolarGrid
            gridType="circle"
            radialLines={false}
            stroke="none"
            className="first:fill-[hsl(222_16%_16%)] last:fill-[hsl(222_16%_16%)]"
            polarRadius={[72, 60]}
          />
          <RadialBar
            dataKey="valor"
            cornerRadius={3}
            background={{ fill: TRACK_FILL }}
            className="[&_.recharts-radial-bar-background-sector]:opacity-100"
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                const cx = viewBox.cx ?? 0;
                const cy = (viewBox.cy ?? 0) - 4;
                return (
                  <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={cx}
                      dy={0}
                      className="fill-slate-200 text-[9px] font-medium"
                    >
                      {lineas[0]}
                    </tspan>
                    {lineas[1] ? (
                      <tspan
                        x={cx}
                        dy={10}
                        className="fill-slate-200 text-[9px] font-medium"
                      >
                        {lineas[1]}
                      </tspan>
                    ) : null}
                    <tspan
                      x={cx}
                      dy={lineas[1] ? 14 : 12}
                      className="fill-sky-100 text-base font-bold tabular-nums"
                    >
                      {escalaOk ? `${v.toFixed(1)}%` : "—"}
                    </tspan>
                    <tspan
                      x={cx}
                      dy={11}
                      className="fill-slate-400 text-[8.5px]"
                    >
                      {escalaOk
                        ? `${stat.totalPuntos} / ${stat.maxPosible} pts`
                        : `${stat.totalPuntos} pts`}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </RadialBarChart>
      </ChartContainer>
    </div>
  );
}

export type RubricasChartProps = {
  rubricas: RubricaStats[];
  className?: string;
};

export function RubricasChart({ rubricas, className }: RubricasChartProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4 backdrop-blur-sm md:p-6",
        className
      )}
    >
      <h2 className="mb-1 text-lg font-semibold text-white">
        Rendimiento por rúbrica
      </h2>
      <p className="mb-4 text-xs text-slate-400">
    
      </p>
      {!rubricas.length ? (
        <p className="py-8 text-center text-sm text-slate-500">
          No hay evaluaciones por rúbrica en esta temporada.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rubricas.map((r) => (
              <RubricaRadialCell key={r.idForaneaRubrica} stat={r} />
            ))}
          </div>
    
        </>
      )}
    </section>
  );
}
