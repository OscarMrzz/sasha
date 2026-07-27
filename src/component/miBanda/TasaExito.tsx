"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { Label, PolarGrid, RadialBar, RadialBarChart } from "recharts";

const chartConfig = {
  exito: {
    label: "Tasa de éxito",
    color: "hsl(217 91% 60%)",
  },
} satisfies ChartConfig;

export type TasaExitoProps = {
  porcentaje: number;
  className?: string;
};

export function TasaExito({ porcentaje, className }: TasaExitoProps) {
  const v = Math.min(100, Math.max(0, porcentaje));
  const data = [{ categoria: "exito", valor: v, fill: "var(--color-exito)" }];

  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-700/50 bg-slate-700/60 p-4 backdrop-blur-sm md:p-6",
        className
      )}
    >
      
    </section>
  );
}
