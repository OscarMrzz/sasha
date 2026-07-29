"use client";

import { cn } from "@/lib/utils";

export type PodiosProps = {
  primeros: number;
  segundos: number;
  terceros: number;
  /** `bar` = tres medallas en fila; `sidebar` = columna alta con filas horizontales */
  variant?: "bar" | "sidebar";
  className?: string;
};

type PodioItem = {
  label: string;
  count: number;
  emoji: string;
  ring: string;
};

function buildItems(
  primeros: number,
  segundos: number,
  terceros: number,
): PodioItem[] {
  return [
    { label: "1.° lugar", count: primeros, emoji: "🥇", ring: "ring-amber-300" },
    { label: "2.° lugar", count: segundos, emoji: "🥈", ring: "ring-[var(--vz-border-strong)]" },
    { label: "3.° lugar", count: terceros, emoji: "🥉", ring: "ring-amber-200" },
  ];
}

export function Podios({
  primeros,
  segundos,
  terceros,
  variant = "bar",
  className,
}: PodiosProps) {
  const items = buildItems(primeros, segundos, terceros);
  const isSidebar = variant === "sidebar";

  return (
    <section
      className={cn(
        "card-row-bg flex min-h-0 flex-col rounded-2xl border border-[var(--vz-border)] p-4 md:p-5",
        isSidebar && "h-full",
        className,
      )}
    >
      <h2 className="text-lg font-semibold text-[var(--app-fg)]">Podios</h2>
      <p className="mt-0.5 text-xs text-[var(--app-fg-muted)]">
        Lugares obtenidos por evento este año
      </p>

      {isSidebar ? (
        <div className="mt-4 flex flex-1 flex-col justify-center gap-3">
          {items.map((it) => (
            <PodioSidebarRow key={it.label} item={it} />
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {items.map((it) => (
            <div
              key={it.label}
              className={cn(
                "flex flex-col items-center rounded-xl border border-[var(--vz-border)] bg-[#fafafa] p-3 ring-1",
                it.ring,
              )}
            >
              <span className="text-2xl">{it.emoji}</span>
              <span className="mt-1 text-2xl font-black tabular-nums text-[var(--app-fg)]">
                {it.count}
              </span>
              <span className="text-xs text-[var(--app-fg-muted)]">{it.label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PodioSidebarRow({ item }: { item: PodioItem }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-[var(--vz-border)] bg-[#fafafa] px-3 py-3 ring-1",
        item.ring,
      )}
    >
      <span className="shrink-0 text-2xl">{item.emoji}</span>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-black tabular-nums leading-none text-[var(--app-fg)]">
          {item.count}
        </p>
        <p className="mt-0.5 text-xs text-[var(--app-fg-muted)]">{item.label}</p>
      </div>
    </div>
  );
}
