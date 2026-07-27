import { cn } from '@/lib/utils'
import React from 'react'


export type TotalTemporadaProps = {
  total: number;
  className?: string;
};

export default function TotalTemporada({ total, className }: TotalTemporadaProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-700/60 p-4 backdrop-blur-sm md:p-6",
        className
      )}
    >
      <h2 className="text-lg font-medium text-white">Total Temporada</h2>
      <p className="text-sm text-slate-400">
        <span className="text-white font-black text-2xl">{total}</span>
        <span className="text-slate-400 font-medium"> puntos</span>
      </p>
    </section>
  )
}
