"use client";

import BuscadorRow from "@/component/buscadores/BuscadorRow";
import CardRowCopasTemporada, {
  type FilaCopasTemporadaModel,
} from "@/component/copas/CardRowCopasTemporada";
import type {
  categoriaDatosAmpleosInterface,
  perfilDatosAmpleosInterface,
  regionesDatosAmpleosInterface,
  vistaCopasTemporadaInterface,
} from "@/interfaces/interfaces";
import { fetchTablaCopasTemporada } from "@/lib/actions/tablaCopasTemporada";
import BandasServices from "@/lib/services/bandasServices";
import CategoriasServices from "@/lib/services/categoriaServices";
import PerfilesServices from "@/lib/services/perfilesServices";
import RegionesServices from "@/lib/services/regionesServices";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useRef, useState } from "react";

type TablaCopasTemporadaProps = {
  titulo?: string;
  idBandaDestacada?: string;
};

export default function TablaCopasTemporada({
  titulo = "Ranking de copas",
  idBandaDestacada,
}: TablaCopasTemporadaProps) {
  const perfilesServices = useRef(new PerfilesServices());
  const regionesServices = useRef(new RegionesServices());
  const categoriasServices = useRef(new CategoriasServices());
  const bandasServices = useRef(new BandasServices());

  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [categoria, setCategoria] = useState("");

  const { data: perfil } = useQuery({
    queryKey: ["copas-temporada", "perfil"],
    queryFn: () => perfilesServices.current.getUsuarioLogiado(),
  });

  const idFederacion = (perfil as perfilDatosAmpleosInterface | undefined)
    ?.idForaneaFederacion;

  const { data: regionesList = [] as regionesDatosAmpleosInterface[] } =
    useQuery({
      queryKey: ["regiones"],
      queryFn: () => regionesServices.current.getDatosAmpleos(),
    });

  const { data: categoriasList = [] as categoriaDatosAmpleosInterface[] } =
    useQuery({
      queryKey: ["categorias"],
      queryFn: () => categoriasServices.current.getDatosAmpleos(),
    });

  const { data: bandasFederacion = [] } = useQuery({
    queryKey: ["bandas", "federacion", idFederacion],
    queryFn: () => bandasServices.current.getDatosAmpleos(),
    enabled: !!idFederacion?.trim(),
  });

  const idsBandasFederacion = useMemo(
    () => new Set(bandasFederacion.map((b) => b.idBanda)),
    [bandasFederacion],
  );

  const {
    data: copasData = [] as vistaCopasTemporadaInterface[],
    isFetching: isFetchingCopas,
  } = useQuery({
    queryKey: ["copas-temporada", "tabla"],
    queryFn: () => fetchTablaCopasTemporada(),
  });

  const copasFederacion = useMemo(() => {
    if (!idFederacion?.trim() || idsBandasFederacion.size === 0) {
      return copasData;
    }
    return copasData.filter((fila) => idsBandasFederacion.has(fila.idBanda));
  }, [copasData, idFederacion, idsBandasFederacion]);

  const usaRankinRegional = !!region.trim() && !!categoria.trim();
  const filtrosListos = !!categoria.trim();

  const filasConPosicion = useMemo((): FilaCopasTemporadaModel[] => {
    let base = copasFederacion;

    if (categoria.trim()) {
      base = base.filter((f) => f.idForaneaCategoria === categoria);
    }
    if (region.trim()) {
      base = base.filter((f) => f.idForaneaRegion === region);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      base = base.filter((f) => f.nombreBanda.toLowerCase().includes(q));
    }

    const filas: FilaCopasTemporadaModel[] = base.map((fila) => ({
      ...fila,
      posicion: usaRankinRegional
        ? Number(fila.rankin_regional)
        : Number(fila.rankin_categoria),
    }));

    filas.sort((a, b) => a.posicion - b.posicion);
    return filas;
  }, [copasFederacion, categoria, region, search, usaRankinRegional]);

  const filtrarBuscador = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(ev.target.value);
  };

  const anio = new Date().getFullYear();
  const nombreCat =
    categoriasList.find((c) => c.idCategoria === categoria)?.nombreCategoria ??
    "—";
  const nombreReg =
    regionesList.find((r) => r.idRegion === region)?.nombreRegion ?? "—";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-8">
      <section className="mb-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{titulo}</h1>
          <span className="text-sm text-slate-400">
            {filtrosListos ? filasConPosicion.length : "—"}
          </span>
        </div>

        <p className="text-sm text-slate-400">
          {filtrosListos ? (
            <>
              {region.trim() ? (
                <>
                  <span className="text-slate-200">{nombreReg}</span>
                  {" · "}
                </>
              ) : (
                <span className="text-slate-200">Todas las regiones</span>
              )}
              <span className="text-slate-200">{nombreCat}</span>
              {" · Temporada "}
              {anio}
              {usaRankinRegional ? (
                <span className="ml-1 text-amber-300/90">
                  (ranking regional)
                </span>
              ) : (
                <span className="ml-1 text-sky-300/90">
                  (ranking por categoría)
                </span>
              )}
            </>
          ) : (
            <>
              Elige una <span className="text-slate-200">categoría</span>
              {region.trim() ? (
                <>
                  {" y "}
                  <span className="text-slate-200">región</span>
                </>
              ) : null}{" "}
              para ver el ranking de copas.
            </>
          )}
          {isFetchingCopas && (
            <span className="ml-2 text-slate-500">Cargando…</span>
          )}
        </p>

        <div className="flex flex-wrap gap-4">
          <BuscadorRow filtrarBuscador={filtrarBuscador} />
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
        </div>
      </section>

      {!filtrosListos ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          Selecciona al menos una categoría para ver el ranking de copas de la
          temporada. Opcionalmente elige una región para ver el ranking regional
          dentro de esa categoría.
        </p>
      ) : !filasConPosicion.length ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          No hay bandas con copas para mostrar (o ninguna coincide con los
          filtros).
        </p>
      ) : (
        <section className="flex flex-col gap-4 sm:gap-5">
          {filasConPosicion.map((fila, i) => (
            <CardRowCopasTemporada
              key={fila.idBanda}
              fila={fila}
              esMiBanda={!!idBandaDestacada && fila.idBanda === idBandaDestacada}
              index={i}
            />
          ))}
        </section>
      )}
    </div>
  );
}
