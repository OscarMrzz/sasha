"use client";

import { ResultadosEventoReporteContenido } from "@/component/miBanda/ResultadosEventoReporteContenido";
import { ResultadosEventoReportePdf } from "@/component/miBanda/ResultadosEventoReportePdf";
import type { ResultadosEventoReporteProps } from "@/component/miBanda/ResultadosEventoReporteTipos";
import type {
  bandaInterface,
  categoriaInterface,
  federacionInterface,
  RegistroEventoInterface,
  registroComentariosDatosAmpleosInterface,
  rubricaInterface,
  vistaResultadosModel,
} from "@/interfaces/interfaces";
import { generarPdfDesdeElemento } from "@/lib/helpers/generadorPDF";
import { ArrowDownTrayIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import React, { useRef, useState } from "react";

export type ResultadosEventoDetallePrecargado = {
  resultados: vistaResultadosModel[];
  comentariosList: registroComentariosDatosAmpleosInterface[];
  puntosRubricas: Record<string, number>;
  totalGeneral: number;
};

type Props = {
  perfil: { federaciones?: federacionInterface | null };
  banda: bandaInterface;
  categoria?: categoriaInterface | null;
  rubricasList: rubricaInterface[];
  eventosOrdenados: RegistroEventoInterface[];
  detallePorEvento: Record<string, ResultadosEventoDetallePrecargado>;
};

const selectBaseClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100 transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]";

export default function ResultadosPorEventoShell({
  perfil,
  banda,
  categoria,
  rubricasList,
  eventosOrdenados,
  detallePorEvento,
}: Props) {
  const [eventoSeleccionado, setEventoSeleccionado] = useState<
    RegistroEventoInterface | undefined
  >(undefined);

  const hojaReferencia = useRef<HTMLDivElement>(null);

  const generarPDF = async () => {
    if (!eventoSeleccionado || !hojaReferencia.current) return;

    const nombreArchivo = `Reporte-Evento-${eventoSeleccionado.LugarEvento}-Banda-${banda.nombreBanda}.pdf`;

    await generarPdfDesdeElemento(hojaReferencia.current, nombreArchivo);
  };

  const detalle =
    eventoSeleccionado && detallePorEvento[eventoSeleccionado.idEvento];

  const propsReporte: ResultadosEventoReporteProps | null =
    eventoSeleccionado && detalle
      ? {
          perfil,
          evento: eventoSeleccionado,
          banda,
          categoria: categoria ?? undefined,
          totalGeneral: detalle.totalGeneral,
          rubricasList,
          puntosRubricas: detalle.puntosRubricas,
          resultados: detalle.resultados,
          comentariosList: detalle.comentariosList,
        }
      : null;

  return (
    <div className="w-full pb-25">
        <Link
        href={`/mi-banda-page/${banda.idBanda}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-sky-400 transition hover:text-sky-300"
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden />
        Volver a mi banda
      </Link>
      <section className="mb-4 flex w-full flex-col gap-4">
        <h1 className="mb-4 text-2xl font-bold">Resultados</h1>

        <div className="flex justify-between gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4  items-center">
          <div className="min-w-0 w-full sm:max-w-md ">
            <label
              htmlFor="filtro-evento-resultados"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
            >
              Evento
            </label>

            <select
              id="filtro-evento-resultados"
              className={selectBaseClass}
              value={eventoSeleccionado?.idEvento ?? ""}
              onChange={(event) => {
                const id = event.target.value;
                const ev = eventosOrdenados.find((e) => e.idEvento === id);
                setEventoSeleccionado(ev);
              }}
              disabled={eventosOrdenados.length === 0}
            >
              {eventosOrdenados.length === 0 ? (
                <option className="bg-slate-800 text-slate-100" value="">
                  Sin eventos con participación
                </option>
              ) : (
                <>
                  <option className="bg-slate-800 text-slate-100" value="">
                    Seleccionar evento
                  </option>

                  {eventosOrdenados.map((evento) => (
                    <option
                      className="bg-slate-800 text-slate-100"
                      key={evento.idEvento}
                      value={evento.idEvento}
                    >
                      {evento.LugarEvento}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div className="flex shrink-0 items-center pt-6">
            <button
              type="button"
              onClick={() => generarPDF()}
              className="flex cursor-pointer gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-300 "
            >
             

              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <div className="w-full">
        {propsReporte ? (
          <>
            <ResultadosEventoReporteContenido {...propsReporte} />

            <div className="pointer-events-none fixed top-0 -left-[10000px] w-[210mm] max-w-[100vw]" aria-hidden>
              <ResultadosEventoReportePdf ref={hojaReferencia} {...propsReporte} />
            </div>
          </>
        ) : (
          <p className="py-8 text-center text-lg font-semibold text-slate-400">Seleccione un evento</p>
        )}
      </div>
    </div>
  );
}
