"use client";

import { ResultadosEventoReporteContenido } from "@/component/miBanda/ResultadosEventoReporteContenido";
import { ResultadosEventoReportePdf } from "@/component/miBanda/ResultadosEventoReportePdf";
import { ComboBoxBandas } from "@/component/ComboBox/ComboBoxBandas";
import { ComboBoxEventos } from "@/component/ComboBox/ComboBoxEventos";
import { uselistaBandasEventoCategoriaFiltro } from "@/hooks/useListaBandasFiltro";
import { useListaCategoriaFiltro } from "@/hooks/useListaCategoriasFiltro";
import { useListaEventosFederacionAdmin } from "@/hooks/useListaEventosFiltro";
import { useResultadosDetalladosAdmin } from "@/hooks/evaluacion";
import { usePerfilUsuarioLogueado } from "@/hooks/perfil";
import { generarPdfDesdeElemento } from "@/lib/helpers/generadorPDF";
import { ArrowDownTrayIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import React, { useRef } from "react";

const selectBaseClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100 transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]";

/**
 * Panel administración: resultados detallados por banda y evento.
 * Datos cargados en paralelo mediante ResultadosService (client-side).
 */
export default function ReportePorBanda() {
  const { perfil } = usePerfilUsuarioLogueado();

  const { categoriasList } = useListaCategoriaFiltro();

  const {
    bandasDelEvento,
    bandaSelecionada,
    setBandaSeleccionada,
  } = uselistaBandasEventoCategoriaFiltro();

  const { eventosList, cargandoEventos, eventoSeleccionado, setEventoSeleccionado } =
    useListaEventosFederacionAdmin();

  const {
    resultados,
    rubricasList,
    comentariosList,
    puntosRubricas,
    totalGeneral,
    cargandoResultados,
  } = useResultadosDetalladosAdmin(bandaSelecionada, eventoSeleccionado);

  const categoriaSelecionada = categoriasList?.find(
    (c) => c.idCategoria === bandaSelecionada?.idForaneaCategoria
  );

  const hojaReferencia = useRef<HTMLDivElement>(null);

  const selecionarEvento = (idEvento: string) => {
    if (!idEvento) {
      setEventoSeleccionado(undefined);
      setBandaSeleccionada(undefined);
      return;
    }
    const evento = eventosList.find((e) => e.idEvento === idEvento);
    setEventoSeleccionado(evento);
    setBandaSeleccionada(undefined);
  };

  const selecionarBanda = (idBanda: string) => {
    if (!idBanda) {
      setBandaSeleccionada(undefined);
      return;
    }
    const banda = bandasDelEvento.find((b) => b.idBanda === idBanda);
    setBandaSeleccionada(banda);
  };

  const generarPDF = async () => {
    if (!bandaSelecionada || !eventoSeleccionado || !hojaReferencia.current) return;
    const nombreArchivo = `Reporte-Evento-${eventoSeleccionado.LugarEvento}-Banda-${bandaSelecionada.nombreBanda}.pdf`;
    await generarPdfDesdeElemento(hojaReferencia.current, nombreArchivo);
  };

  const seleccionCompleta = Boolean(eventoSeleccionado && bandaSelecionada);
  const hayResultados = resultados.length > 0;

  const propsReporte =
    seleccionCompleta && hayResultados && eventoSeleccionado && bandaSelecionada
      ? {
          perfil,
          evento: eventoSeleccionado,
          banda: bandaSelecionada,
          categoria: categoriaSelecionada,
          totalGeneral,
          rubricasList,
          puntosRubricas,
          resultados,
          comentariosList,
        }
      : null;

  return (
    <div className="w-full pb-25">
      <section className="mb-4 flex w-full flex-col gap-4">
        <h1 className="mb-4 text-2xl font-bold">Resultados detallados por banda</h1>

        <div className="flex flex-col gap-4">
          <div className="grid w-full gap-3 sm:grid-cols-2">
            <div className="min-w-0">
              <label
                htmlFor="filtro-evento-resultados-banda"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Evento
              </label>
              <ComboBoxEventos
                id="filtro-evento-resultados-banda"
                eventos={eventosList}
                value={eventoSeleccionado?.idEvento ?? ""}
                disabled={cargandoEventos}
                onChange={selecionarEvento}
                emptyLabel={cargandoEventos ? "Cargando eventos…" : "No hay eventos"}
                className={selectBaseClass}
              />
            </div>

            <div className="min-w-0">
              <label
                htmlFor="filtro-banda-resultados-banda"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Banda
              </label>
              <ComboBoxBandas
                id="filtro-banda-resultados-banda"
                bandas={bandasDelEvento}
                value={bandaSelecionada?.idBanda ?? ""}
                disabled={cargandoEventos}
                onChange={selecionarBanda}
                className={selectBaseClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => generarPDF()}
              disabled={!propsReporte}
              className="flex w-full cursor-pointer justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              <span>Descargar PDF</span>
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <div className="w-full">
        {!seleccionCompleta ? (
          <p className="py-8 text-center text-lg font-semibold text-slate-400">
            Seleccione evento y banda para ver el informe
          </p>
        ) : cargandoResultados ? (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-[var(--color-primario)]" />
            <span className="text-sm">Cargando resultados…</span>
          </div>
        ) : !hayResultados ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-slate-400">
            <InformationCircleIcon className="h-10 w-10 text-slate-500" />
            <p className="text-lg font-semibold text-slate-300">Sin resultados registrados</p>
            <p className="text-sm">
              <span className="font-medium text-slate-200">{bandaSelecionada?.nombreBanda}</span>
              {" · "}
              <span>{eventoSeleccionado?.LugarEvento}</span>
            </p>
          </div>
        ) : (
          <>
            <ResultadosEventoReporteContenido {...propsReporte!} />
            <div
              className="pointer-events-none fixed top-0 -left-[10000px] w-[210mm] max-w-[100vw]"
              aria-hidden
            >
              <ResultadosEventoReportePdf ref={hojaReferencia} {...propsReporte!} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
