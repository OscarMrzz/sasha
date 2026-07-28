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
        "rounded-2xl border border-slate-700/50 bg-slate-800/60 p-4 backdrop-blur-sm md:p-6",
        className
      )}
    >
      <h2 className="mb-1 text-lg font-semibold text-white">
        Rendimiento por rúbrica
      </h2>
      <p className="mb-4 text-xs text-slate-400"></p>
      {!rendimientoPorRubricaList.length ? (
        <p className="py-8 text-center text-sm text-slate-500">
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
