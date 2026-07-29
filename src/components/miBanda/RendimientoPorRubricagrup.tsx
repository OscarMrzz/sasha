import { vistaRendimientoPorRubricaGlobalInterface } from "@/models";
import { cn } from "@/lib/utils";
import RendimientoPorRubrica from "./RendimientoPorRubrica";

type Props = {
  rendimientoPorRubricaList: vistaRendimientoPorRubricaGlobalInterface[];
  className?: string;
};

export default function RendimientoPorRubricagrup({
  rendimientoPorRubricaList,
  className,
}: Props) {
  return (
    <section
      className={cn(
        "card-row-bg rounded-2xl border border-[var(--vz-border)] p-4 md:p-6",
        className
      )}
    >
      <h2 className="mb-1 text-lg font-semibold text-[var(--app-fg)]">
        Rendimiento por rúbrica
      </h2>
      <p className="mb-4 text-xs text-[var(--app-fg-muted)]"></p>
      {!rendimientoPorRubricaList.length ? (
        <p className="py-8 text-center text-sm text-[var(--app-fg-muted)]">
          No hay datos de rendimiento por rúbrica para esta temporada.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {rendimientoPorRubricaList.map((rendimientoPorRubrica) => (
            <RendimientoPorRubrica
              key={`${rendimientoPorRubrica.idRubrica}-${rendimientoPorRubrica.idRegion}-${rendimientoPorRubrica.idForaneaCategoria}`}
              rendimientoPorRubrica={rendimientoPorRubrica}
            />
          ))}
        </div>
      )}
    </section>
  );
}
