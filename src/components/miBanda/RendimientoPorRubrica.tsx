"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { vistaRendimientoPorRubricaGlobalInterface } from "@/models";
import { cn } from "@/lib/utils";
import { Label, RadialBar, RadialBarChart } from "recharts";

/** Misma escala cromática que `RubricasChart` */
function fillForPct(p: number) {
  if (p >= 90) return "hsl(142 70% 45%)"; // Verde
if (p >= 80 && p <= 89) return "hsl(24 95% 53%)";  // Naranja
if (p <= 79) return "hsl(0 84% 60%)";   // Rojo
return "hsl(218 28% 58%)";              // Color base / Por debajo de 70
}

const TRACK_FILL = "hsl(0 0% 90%)";

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

function rendimientoAPorcentaje(rendimiento: number): number {
  const normalizado =
    rendimiento >= 0 && rendimiento <= 1 ? rendimiento * 100 : rendimiento;
  return Math.min(100, Math.max(0, normalizado));
}

type Props = {
  rendimientoPorRubrica: vistaRendimientoPorRubricaGlobalInterface;
  className?: string;
};

export default function RendimientoPorRubrica({
  rendimientoPorRubrica,
  className,
}: Props) {
  const v = rendimientoAPorcentaje(rendimientoPorRubrica.rendimiento);
  const color = fillForPct(v);
  const chartConfig = {
    valor: {
      label: rendimientoPorRubrica.nombreRubrica,
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

  const lineas = nombreLineas(rendimientoPorRubrica.nombreRubrica);
  const total = rendimientoPorRubrica.total;

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center rounded-2xl border border-[var(--vz-border)] bg-[#fafafa] p-4",
        className
      )}
    >
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square w-full min-w-0 max-w-[148px] overflow-visible [&_.recharts-surface]:overflow-visible"
        initialDimension={{ width: 148, height: 148 }}
      >
        <RadialBarChart
          data={data}
          startAngle={90}
          endAngle={-270}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          innerRadius="88.57%"
          outerRadius="100%"
        >
          <RadialBar
            dataKey="valor"
            cornerRadius={2}
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
                      className="fill-[#404040] text-[9px] font-medium"
                    >
                      {lineas[0]}
                    </tspan>
                    {lineas[1] ? (
                      <tspan
                        x={cx}
                        dy={10}
                        className="fill-[#404040] text-[9px] font-medium"
                      >
                        {lineas[1]}
                      </tspan>
                    ) : null}
                    <tspan
                      x={cx}
                      dy={lineas[1] ? 18 : 16}
                      className="fill-[#00b4d8] text-base font-bold tabular-nums"
                    >
                      {`${v.toFixed(1)}%`}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </RadialBarChart>
      </ChartContainer>
      <p className="mt-1 text-center text-[10px] leading-tight text-[var(--app-fg-muted)]">
        Total{" "}
        <span>
          · {total.toLocaleString("es")} pts
        </span>
      </p>
    </div>
  );
}
