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
        "card-row-bg flex flex-col items-center justify-center rounded-2xl border border-[var(--vz-border)] p-4 md:p-6",
        className
      )}
    >
      <h2 className="text-lg font-medium text-[var(--app-fg)]">Total Temporada</h2>
      <p className="text-sm text-[var(--app-fg-muted)]">
        <span className="text-2xl font-black text-[var(--app-fg)]">{total}</span>
        <span className="font-medium"> puntos</span>
      </p>
    </section>
  )
}
