"use client";

import TablaCondensados from "@/component/Tablas/tabla-condensados/tabla-condensados";
import type {
  categoriaDatosAmpleosInterface,
  regionesDatosAmpleosInterface,
  rubricaDatosAmpleosInterface,
  vistaCondensado,
} from "@/interfaces/interfaces";
import { fetchVistaCondensado } from "@/lib/actions/condensadoPorRubrica";
import {
  extraerCategoriasConDatos,
  extraerEventosCondensado,
  filtrarFilasPorBanda,
  pivotCondensado,
} from "@/lib/condensado/pivotCondensado";
import CategoriasServices from "@/lib/services/categoriaServices";
import RegionesServices from "@/lib/services/regionesServices";
import RubricasServices from "@/lib/services/rubricasServices";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useRef, useState } from "react";

export default function Page() {
  const regionesServices = useRef(new RegionesServices());
  const categoriasServices = useRef(new CategoriasServices());
  const rubricasServices = useRef(new RubricasServices());

  const [evento, setEvento] = useState("");
  const [categoria, setCategoria] = useState("");
  const [region, setRegion] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const filtrosListos = !!categoria.trim();

  const { data: regionesList = [] as regionesDatosAmpleosInterface[], isFetching: isFetchingRegiones } =
    useQuery({
      queryKey: ["regiones"],
      queryFn: () => regionesServices.current.getDatosAmpleos(),
    });

  const { data: categoriasList = [] as categoriaDatosAmpleosInterface[], isFetching: isFetchingCategorias } =
    useQuery({
      queryKey: ["categorias"],
      queryFn: () => categoriasServices.current.getDatosAmpleos(),
    });

  const {
    data: condensadoRows = [] as vistaCondensado[],
    isFetching: isFetchingCondensado,
    isError: isErrorCondensado,
    error: errorCondensado,
  } = useQuery({
    queryKey: ["condensado-por-rubrica"],
    queryFn: () => fetchVistaCondensado(),
  });

  const { data: rubricasList = [] as rubricaDatosAmpleosInterface[], isFetching: isFetchingRubricas } =
    useQuery({
      queryKey: ["rubricas", categoria],
      queryFn: () => rubricasServices.current.getPorCategoria(categoria),
      enabled: !!categoria.trim(),
    });

  const eventosList = useMemo(
    () => extraerEventosCondensado(condensadoRows),
    [condensadoRows],
  );

  const categoriasConDatos = useMemo(
    () => extraerCategoriasConDatos(condensadoRows),
    [condensadoRows],
  );

  const categoriaTieneDatos = useMemo(
    () => categoriasConDatos.some((c) => c.idCategoria === categoria),
    [categoria, categoriasConDatos],
  );

  const filasPivot = useMemo(() => {
    if (!filtrosListos) return [];
    return pivotCondensado(
      condensadoRows,
      { idCategoria: categoria, idRegion: region, idEvento: evento },
      rubricasList,
    );
  }, [categoria, condensadoRows, evento, filtrosListos, region, rubricasList]);

  const filasFiltradas = useMemo(
    () => filtrarFilasPorBanda(filasPivot, busqueda),
    [filasPivot, busqueda],
  );

  const nombreRegion =
    region.trim()
      ? (regionesList.find((r) => r.idRegion === region)?.nombreRegion ?? "—")
      : "Todas las regiones";
  const nombreCategoria =
    categoriasList.find((c) => c.idCategoria === categoria)?.nombreCategoria ??
    "—";
  const nombreEvento =
    evento.trim()
      ? (eventosList.find((e) => e.idEvento === evento)?.LugarEvento ?? "—")
      : "Todos los eventos";
  const anio = new Date().getFullYear();

  const cargandoTabla =
    isFetchingCondensado || (filtrosListos && isFetchingRubricas);

  const mensajeErrorCondensado =
    errorCondensado instanceof Error
      ? errorCondensado.message
      : "No se pudo cargar el condensado.";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Condensado por rúbrica</h1>
          <span className="text-sm text-slate-400">
            {filtrosListos ? filasFiltradas.length : "—"}
          </span>
        </div>

        <p className="text-sm text-slate-400">
          {filtrosListos ? (
            <>
              <span className="text-slate-200">{nombreEvento}</span>
              {" · "}
              <span className="text-slate-200">{nombreCategoria}</span>
              {" · "}
              <span className="text-slate-200">{nombreRegion}</span>
              {" · Temporada "}
              {anio}
            </>
          ) : (
            <>
              Elige una <span className="text-slate-200">categoría</span> para
              cargar el condensado.
            </>
          )}
          {(isFetchingRegiones ||
            isFetchingCategorias ||
            isFetchingCondensado ||
            (filtrosListos && isFetchingRubricas)) && (
            <span className="ml-2 text-slate-500">Cargando…</span>
          )}
        </p>

        <div className="flex flex-wrap gap-4">
          <select
            className="rounded-md border border-slate-300 bg-slate-800 p-2 text-slate-100"
            value={evento}
            onChange={(ev) => setEvento(ev.target.value)}
          >
            <option value="">Todos los eventos</option>
            {eventosList.map((e) => (
              <option key={e.idEvento} value={e.idEvento}>
                {e.LugarEvento}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-300 bg-slate-800 p-2 text-slate-100"
            value={categoria}
            onChange={(ev) => setCategoria(ev.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categoriasList.map((c) => (
              <option key={c.idCategoria} value={c.idCategoria}>
                {c.nombreCategoria}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-300 bg-slate-800 p-2 text-slate-100"
            value={region}
            onChange={(ev) => setRegion(ev.target.value)}
          >
            <option value="">Todas las regiones</option>
            {regionesList.map((r) => (
              <option key={r.idRegion} value={r.idRegion}>
                {r.nombreRegion}
              </option>
            ))}
          </select>
        </div>
      </section>

      {!filtrosListos ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          Selecciona una categoría para ver el condensado por rúbrica.
        </p>
      ) : isErrorCondensado ? (
        <p className="rounded-xl border border-red-800/50 bg-red-950/30 p-6 text-center text-sm text-red-300">
          Error al cargar datos: {mensajeErrorCondensado}
          <span className="mt-2 block text-xs text-red-400/80">
            Verifica que la vista <code className="text-red-200">vista_condensado</code> exista,
            que exista <code className="text-red-200">SUPABASE_SERVICE_ROLE_KEY</code> en tu{" "}
            <code className="text-red-200">.env</code> y ejecuta la migración de permisos GRANT
            si acabas de hacer reset.
          </span>
        </p>
      ) : (
        <section className="flex flex-col gap-3">
          {!isFetchingCondensado &&
            filtrosListos &&
            !categoriaTieneDatos &&
            categoriasConDatos.length > 0 && (
              <p className="rounded-xl border border-amber-700/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-200/90">
                La categoría <span className="font-medium">{nombreCategoria}</span> no tiene
                evaluaciones en la base de datos. Categorías con datos:{" "}
                {categoriasConDatos.map((c) => c.nombreCategoria).join(", ")}.
                {" "}En los datos de prueba solo{" "}
                <span className="font-medium">Categoria A</span> tiene evaluaciones cargadas.
              </p>
            )}
          {!isFetchingCondensado &&
            filtrosListos &&
            condensadoRows.length === 0 && (
              <p className="rounded-xl border border-amber-700/40 bg-amber-950/20 px-4 py-3 text-sm text-amber-200/90">
                No hay filas en <code className="text-amber-100">vista_condensado</code>.
                Confirma que cargaste evaluaciones en{" "}
                <code className="text-amber-100">datos_prueba.sql</code> después del reset.
              </p>
            )}
          <TablaCondensados
            filas={filasFiltradas}
            rubricas={rubricasList}
            busqueda={busqueda}
            onBusquedaChange={(ev) => setBusqueda(ev.target.value)}
            cargando={cargandoTabla}
            nombreArchivoBase={`condensado-${nombreCategoria.replace(/\s+/g, "-").toLowerCase()}`}
          />
        </section>
      )}
    </div>
  );
}
