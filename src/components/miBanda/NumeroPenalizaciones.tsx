import { cn } from "@/lib/utils";

export type NumeroPenalizacionesProps = {
  cantidad: number;
  className?: string;
};

export default function NumeroPenalizaciones({
  cantidad,
  className,
}: NumeroPenalizacionesProps) {
  return (
    <section
      className={cn(
        "card-row-bg flex flex-col items-center justify-center rounded-2xl border border-[var(--vz-border)] p-4 md:p-6",
        className,
      )}
    >
      <h2 className="text-lg font-medium text-[var(--app-fg)]">
        Penalizaciones
      </h2>
      <p className="mt-1 text-sm text-[var(--app-fg-muted)]">
        <span className="text-2xl font-black tabular-nums text-amber-800">
          {cantidad}
        </span>
      </p>
    </section>
  );
}
