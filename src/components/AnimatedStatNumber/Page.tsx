"use client";

import React, { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";

const COUNT_OFFSET = 20;
const COUNT_ANIMATION_DURATION_SEC = 2.85;

/** La vista SQL a veces devuelve números como string; normalizamos para animar y comparar. */
export function parseStatNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = parseFloat(String(v).trim().replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function valorInicialAnimacion(valor: number): number {
  return Math.max(0, valor - COUNT_OFFSET);
}

type Props = {
  value: number;
  format: "integer" | "decimal";
  accentClass: string;
};

export default function AnimatedStatNumber({ value, format, accentClass }: Props) {
  const reduceMotion = useReducedMotion();
  const start = valorInicialAnimacion(value);
  const [display, setDisplay] = useState(start);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const from = valorInicialAnimacion(value);
    setDisplay(from);
    const controls = animate(from, value, {
      duration: COUNT_ANIMATION_DURATION_SEC,
      ease: [0.33, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Number(latest)),
    });
    return () => controls.stop();
  }, [value, reduceMotion]);

  const text = format === "integer" ? String(Math.round(display)) : display.toFixed(1);

  return (
    <motion.span
      className={`max-w-[5.5rem] truncate px-1 text-4xl font-black tabular-nums leading-none ${accentClass}`}
      initial={{ opacity: 0.85, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {text}
    </motion.span>
  );
}
