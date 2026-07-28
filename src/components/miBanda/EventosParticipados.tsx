import { cn } from "@/lib/utils";

export type EventosParticipadosProps = {
  cantidad: number;
  className?: string;
};

export default function EventosParticipados({
  cantidad,
  className,
}: EventosParticipadosProps) {
  return (
    <section
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-sky-500/25 bg-slate-700/60 p-4 backdrop-blur-sm md:p-6",
        className,
      )}
    >
      <h2 className="text-lg font-medium text-white">Eventos participados</h2>
      <p className="mt-1 text-sm text-slate-400">
        <span className="text-2xl font-black tabular-nums text-sky-200">
          {cantidad}
        </span>
      </p>
    </section>
  );
}
