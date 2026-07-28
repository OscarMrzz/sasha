"use client";

import type { rubricaConsultaCompletaInterface } from "@/models";

type CardRubricaConsultaProps = {
  rubrica: rubricaConsultaCompletaInterface;
  indice: number;
};

function formatearPuntos(valor: number | null | undefined): string {
  if (valor == null || Number.isNaN(Number(valor))) return "0";
  const n = Number(valor);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function CardRubricaConsulta({
  rubrica,
  indice,
}: CardRubricaConsultaProps) {
  const criterios = rubrica.criteriosEvalucion ?? [];
  const nombreCategoria =
    rubrica.categorias?.nombreCategoria ?? "Sin categoría";

  return (
    <article className="w-full rounded-2xl border border-slate-600/90 bg-slate-800/95 p-6 shadow-lg shadow-black/20 sm:p-8">
      <header className="flex flex-col gap-4 border-b border-slate-600/80 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Rúbrica {indice + 1}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            {rubrica.nombreRubrica}
          </h2>
          {rubrica.datalleRubrica?.trim() ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
              {rubrica.datalleRubrica}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="rounded-full border border-sky-500/40 bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-200">
            {nombreCategoria}
          </span>
          {rubrica.versionRubrica?.trim() ? (
            <span className="rounded-full border border-slate-500 bg-slate-700/80 px-3 py-1 text-xs font-medium text-slate-200">
              v{rubrica.versionRubrica}
            </span>
          ) : null}
          <span className="rounded-full border border-amber-500/40 bg-amber-500/15 px-3 py-1 text-xs font-bold tabular-nums text-amber-100">
            {formatearPuntos(rubrica.puntosRubrica)} pts
          </span>
        </div>
      </header>

      <div className="mt-6 space-y-6">
        {criterios.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-600 bg-slate-900/40 px-4 py-6 text-center text-sm text-slate-400">
            Esta rúbrica no tiene criterios registrados.
          </p>
        ) : (
          criterios.map((criterio, idxCriterio) => {
            const cumplimientos = criterio.cumplimientos ?? [];
            return (
              <section
                key={criterio.idCriterio}
                className="rounded-xl border border-slate-600/70 bg-slate-900/45 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Criterio {idxCriterio + 1}
                    </p>
                    <h3 className="text-lg font-semibold text-slate-100">
                      {criterio.nombreCriterio}
                    </h3>
                    {criterio.detallesCriterio?.trim() ? (
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">
                        {criterio.detallesCriterio}
                      </p>
                    ) : null}
                  </div>
                  <span className="inline-flex w-fit shrink-0 rounded-md border border-slate-500 bg-slate-700/80 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-200">
                    Máx. {formatearPuntos(criterio.puntosCriterio)} pts
                  </span>
                </div>

                {cumplimientos.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-500">
                    Sin niveles de cumplimiento definidos.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {cumplimientos.map((cumplimiento) => (
                      <li
                        key={cumplimiento.idCumplimiento}
                        className="flex gap-3 rounded-lg border border-slate-700/80 bg-slate-800/60 px-3 py-2.5 sm:items-start"
                      >
                        <span
                          className={`inline-flex min-w-[3.25rem] shrink-0 justify-center rounded-md px-2 py-1 text-xs font-bold tabular-nums ${
                            (cumplimiento.puntosCumplimiento ?? 0) < 0
                              ? "border border-red-500/40 bg-red-500/15 text-red-200"
                              : "border border-emerald-500/35 bg-emerald-500/15 text-emerald-100"
                          }`}
                        >
                          {formatearPuntos(cumplimiento.puntosCumplimiento)} pts
                        </span>
                        <p className="min-w-0 flex-1 text-sm leading-relaxed text-slate-200">
                          {cumplimiento.detalleCumplimiento}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })
        )}
      </div>
    </article>
  );
}
