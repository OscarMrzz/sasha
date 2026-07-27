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
        "flex flex-col items-center justify-center rounded-2xl border border-amber-500/25 bg-slate-700/60 p-4 backdrop-blur-sm md:p-6",
        className,
      )}
    >
      <h2 className="text-lg font-medium text-white">Penalizaciones</h2>
      <p className="mt-1 text-sm text-slate-400">
        <span className="text-2xl font-black tabular-nums text-amber-200">
          {cantidad}
        </span>
      </p>
    </section>
  );
}
