"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  /** Porcentaje 0–100 */
  porcentaje: number;
  label?: string;
  size?: number;
  stroke?: number;
  className?: string;
};

function colorPorRango(p: number): string {
  if (Number.isNaN(p) || p < 0) return "#64748b";
  if (p < 40) return "#00b4d8";
  if (p < 70) return "#f59e0b";
  return "#22c55e";
}

export default function CirculoProgreso({
  porcentaje,
  label,
  size = 96,
  stroke = 8,
  className = "",
}: Props) {
  const max = Math.min(100, Math.max(0, porcentaje));
  const color = useMemo(() => colorPorRango(max), [max]);

  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(max));
    return () => cancelAnimationFrame(t);
  }, [max]);

  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - animated / 100);

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Progreso ${Math.round(max)} por ciento`}
    >
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-slate-600/80"
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold tabular-nums text-white">{Math.round(max)}%</span>
        {label ? (
          <span className="mt-0.5 max-w-[90%] truncate text-center text-[10px] text-slate-400">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
