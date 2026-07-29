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
    <article className="card-row-bg w-full rounded-2xl p-6 shadow-sm sm:p-8">
      <header className="flex flex-col gap-4 border-b border-[var(--vz-border)] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--app-fg-muted)]">
            Rúbrica {indice + 1}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--app-fg)] sm:text-3xl">
            {rubrica.nombreRubrica}
          </h2>
          {rubrica.datalleRubrica?.trim() ? (
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--app-fg-muted)]">
              {rubrica.datalleRubrica}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--brand)]/30 bg-[#e8f8fb] px-3 py-1 text-xs font-semibold text-[var(--brand)]">
            {nombreCategoria}
          </span>
          {rubrica.versionRubrica?.trim() ? (
            <span className="rounded-full border border-[var(--vz-border)] bg-[#f5f5f5] px-3 py-1 text-xs font-medium text-[var(--app-fg)]">
              v{rubrica.versionRubrica}
            </span>
          ) : null}
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold tabular-nums text-amber-800">
            {formatearPuntos(rubrica.puntosRubrica)} pts
          </span>
        </div>
      </header>

      <div className="mt-6 space-y-6">
        {criterios.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--vz-border-strong)] bg-[#fafafa] px-4 py-6 text-center text-sm text-[var(--app-fg-muted)]">
            Esta rúbrica no tiene criterios registrados.
          </p>
        ) : (
          criterios.map((criterio, idxCriterio) => {
            const cumplimientos = criterio.cumplimientos ?? [];
            return (
              <section
                key={criterio.idCriterio}
                className="rounded-xl border border-[var(--vz-border)] bg-[#fafafa] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-fg-muted)]">
                      Criterio {idxCriterio + 1}
                    </p>
                    <h3 className="text-lg font-semibold text-[var(--app-fg)]">
                      {criterio.nombreCriterio}
                    </h3>
                    {criterio.detallesCriterio?.trim() ? (
                      <p className="mt-2 text-sm leading-relaxed text-[var(--app-fg-muted)]">
                        {criterio.detallesCriterio}
                      </p>
                    ) : null}
                  </div>
                  <span className="inline-flex w-fit shrink-0 rounded-md border border-[var(--vz-border)] bg-white px-2.5 py-1 text-xs font-semibold tabular-nums text-[var(--app-fg)]">
                    Máx. {formatearPuntos(criterio.puntosCriterio)} pts
                  </span>
                </div>

                {cumplimientos.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--app-fg-muted)]">
                    Sin niveles de cumplimiento definidos.
                  </p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {cumplimientos.map((cumplimiento) => (
                      <li
                        key={cumplimiento.idCumplimiento}
                        className="flex gap-3 rounded-lg border border-[var(--vz-border)] bg-white px-3 py-2.5 sm:items-start"
                      >
                        <span
                          className={`inline-flex min-w-[3.25rem] shrink-0 justify-center rounded-md px-2 py-1 text-xs font-bold tabular-nums ${
                            (cumplimiento.puntosCumplimiento ?? 0) < 0
                              ? "border border-rose-200 bg-rose-50 text-rose-800"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-800"
                          }`}
                        >
                          {formatearPuntos(cumplimiento.puntosCumplimiento)} pts
                        </span>
                        <p className="min-w-0 flex-1 text-sm leading-relaxed text-[var(--app-fg)]">
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
