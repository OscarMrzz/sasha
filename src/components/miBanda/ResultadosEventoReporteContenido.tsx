"use client";

import type { ResultadosEventoReporteProps } from "@/components/miBanda/ResultadosEventoReporteTipos";
import React from "react";

/**
 * Vista principal de la evaluación (móvil y escritorio).
 * El PDF se genera aparte con {@link ResultadosEventoReportePdf}.
 */
export function ResultadosEventoReporteContenido({
  perfil,
  evento,
  banda,
  categoria,
  totalGeneral,
  rubricasList,
  puntosRubricas,
  resultados,
  comentariosList,
}: ResultadosEventoReporteProps) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 px-0 sm:space-y-6 lg:space-y-8">
      <header className="rounded-xl border border-[var(--vz-border)] bg-white px-4 py-4 sm:px-6 sm:py-6 lg:flex lg:items-stretch lg:justify-between lg:gap-10 lg:px-8 lg:py-7">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--app-fg-muted)] lg:text-xs">
            {perfil.federaciones?.nombreFederacion}
          </p>
          <h2 className="mt-1 text-lg font-bold leading-snug text-[var(--app-fg)] sm:text-xl lg:text-2xl">
            <span>Evento - </span>
            {evento.LugarEvento}
          </h2>
          <p className="mt-0.5 text-sm text-[var(--app-fg-muted)] lg:text-base">{evento.fechaEvento}</p>
        </div>
        <div className="mt-3 border-t border-[var(--vz-border)] pt-3 lg:mt-0 lg:w-72 lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <p className="text-base font-semibold text-[var(--app-fg)] lg:text-lg">{banda.nombreBanda}</p>
          {categoria?.nombreCategoria ? (
            <p className="text-sm text-[var(--app-fg-muted)] lg:text-base">{categoria.nombreCategoria}</p>
          ) : null}
          <p className="mt-2 inline-flex rounded-lg bg-[var(--color-primario)]/15 px-2.5 py-1 text-sm font-semibold text-[var(--color-primario)] lg:mt-3 lg:text-base">
            Total: {totalGeneral}%
          </p>
        </div>
      </header>

      <section className="rounded-xl border border-[var(--vz-border)] bg-white px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--app-fg)] lg:mb-4 lg:text-base">
          Resumen por rúbrica
        </h3>
        <ul className="grid gap-2 sm:gap-3 md:grid-cols-1">
          {rubricasList.map((rubrica) => {
            const maxPts = rubrica.puntosRubrica < 0 ? 0 : rubrica.puntosRubrica;
            const obtenidos = puntosRubricas[rubrica.idRubrica] ?? 0;
            return (
              <li
                key={rubrica.idRubrica}
                className="flex items-start justify-between gap-3 rounded-lg bg-[#fafafa] px-3 py-2.5 lg:px-4 lg:py-3"
              >
                <span className="min-w-0 flex-1 text-sm font-medium text-[var(--app-fg)] lg:text-base">
                  {rubrica.nombreRubrica}
                </span>
                <span className="shrink-0 text-sm tabular-nums text-[var(--app-fg-muted)] lg:text-base">
                  {obtenidos} / {maxPts}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-4 lg:space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--app-fg)] lg:text-base">
          Detalle por rúbrica
        </h3>
        <div className="grid gap-4 lg:grid-cols-1 lg:gap-5 xl:gap-6">
          {rubricasList.map((rubrica) => {
            const criteriosDeRubrica = resultados.filter(
              (r) => r.idForaneaRubrica === rubrica.idRubrica
            );
            const comentariosRubrica = comentariosList.filter(
              (c) => c.idForaneaRubrica === rubrica.idRubrica
            );
            const obtenidos = puntosRubricas[rubrica.idRubrica] ?? 0;
            const maxPts = rubrica.puntosRubrica < 0 ? 0 : rubrica.puntosRubrica;

            return (
              <article
                key={rubrica.idRubrica}
                className="overflow-hidden rounded-xl border border-[var(--vz-border)] bg-white lg:min-h-0"
              >
                <div className="border-b border-[var(--vz-border)] bg-[#fafafa] px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-semibold text-[var(--app-fg)] lg:text-lg">
                      {rubrica.nombreRubrica}
                    </h4>
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold tabular-nums text-amber-800 lg:text-sm">
                      {obtenidos}%
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[var(--app-fg-muted)] lg:text-base">
                    Puntaje:{" "}
                    <span className="font-semibold tabular-nums text-[var(--app-fg)]">
                      {obtenidos} / {maxPts}
                    </span>
                  </p>
                </div>

                <div className="divide-y divide-[var(--vz-border)] px-4 py-2 sm:px-5">
                  {criteriosDeRubrica.length === 0 ? (
                    <p className="py-3 text-sm text-[var(--app-fg-muted)] lg:text-base">Sin criterios registrados.</p>
                  ) : (
                    criteriosDeRubrica.map((row) => (
                      <div key={row.idRegistroCumplimientoEvaluacion} className="py-3 lg:py-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex shrink-0 flex-col items-center justify-center rounded-md border border-[var(--vz-border)] bg-[#fafafa] px-2 py-1 lg:px-2.5 lg:py-1.5">
                            <span className="text-[10px] font-medium uppercase leading-none text-[var(--app-fg-muted)]">
                              Pts.
                            </span>
                            <span className="text-xs font-bold tabular-nums text-[var(--app-fg)] lg:text-sm">
                              {row.puntosObtenidos}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-semibold text-[var(--app-fg)] lg:text-base">
                              {row.nombreCriterio}
                            </p>
                            <p className="text-xs font-medium uppercase tracking-wide text-[var(--app-fg-muted)]">
                              Cumplimiento
                            </p>
                            <p className="text-sm leading-relaxed text-[var(--app-fg-muted)] lg:text-base">
                              {row.detalleCumplimiento || "—"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {comentariosRubrica.length > 0 ? (
                  <div className="border-t border-[var(--vz-border)] bg-[#fafafa] px-4 py-3 sm:px-5 sm:py-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-[var(--app-fg-muted)] lg:text-sm">
                      Comentario{comentariosRubrica.length > 1 ? "s" : ""} de la rúbrica
                    </p>
                    <div className="mt-2 space-y-3">
                      {comentariosRubrica.map((c) => (
                        <p
                          key={c.idRegistroComentario}
                          className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--app-fg-muted)] lg:text-base"
                        >
                          {c.comentario}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
