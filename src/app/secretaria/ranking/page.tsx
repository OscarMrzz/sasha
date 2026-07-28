"use client";

import BuscadorRow from "@/components/buscadores/BuscadorRow";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type {
  bandaDatosAmpleosInterface,
  categoriaDatosAmpleosInterface,
  regionesDatosAmpleosInterface,
  vistaResultadosTenporadaInterface,
} from "@/models";
import { fetchRankingGlobal } from "@/actions/rankingGlobal";
import BandasServices from "@/services/bandasServices";
import CategoriasServices from "@/services/categoriaServices";
import RegionesServices from "@/services/regionesServices";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

type FilaRanking = vistaResultadosTenporadaInterface & {
  posicion: number;
};

const chartConfig = {
  puntos: {
    label: "Puntos",
    color: "hsl(217 91% 60%)",
  },
} satisfies ChartConfig;

function formatearPuntos(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}

function formatearPromedio(valor: number): string {
  return `${valor.toFixed(1)}%`;
}

export default function Page() {
  const regionesServices = useRef(new RegionesServices());
  const categoriasServices = useRef(new CategoriasServices());
  const bandasServices = useRef(new BandasServices());
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [categoria, setCategoria] = useState("");

  const filtrosListos = !!region.trim() && !!categoria.trim();

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

  const { data: bandasData = [] as bandaDatosAmpleosInterface[], isFetching: isFetchingBandas } =
    useQuery({
      queryKey: ["bandas"],
      queryFn: () => bandasServices.current.getDatosAmpleos(),
    });

  const {
    data: rankingRows = [] as vistaResultadosTenporadaInterface[],
    isFetching: isFetchingRanking,
  } = useQuery({
    queryKey: ["secretaria", "ranking"],
    queryFn: () => fetchRankingGlobal(),
    enabled: filtrosListos,
  });

  const idsBandasRegion = useMemo(() => {
    if (!region.trim()) return new Set<string>();
    return new Set(
      bandasData
        .filter((banda) => banda.idForaneaRegion === region)
        .map((banda) => banda.idBanda),
    );
  }, [bandasData, region]);

  const filasOrdenadas = useMemo(() => {
    if (!filtrosListos) return [] as FilaRanking[];

    const q = search.trim().toLowerCase();
    const filtradas = rankingRows
      .filter((row) => row.idCategoria === categoria)
      .filter((row) => idsBandasRegion.has(row.idBanda))
      .filter((row) =>
        q ? row.nombreBanda.toLowerCase().includes(q) : true,
      );

    return [...filtradas]
      .sort(
        (a, b) =>
          Number(b.total_despues_sanciones) -
          Number(a.total_despues_sanciones),
      )
      .map((row, index) => ({
        ...row,
        posicion: index + 1,
      }));
  }, [categoria, filtrosListos, idsBandasRegion, rankingRows, search]);

  const chartData = useMemo(
    () =>
      [...filasOrdenadas]
        .reverse()
        .map((fila) => ({
          nombreBanda: fila.nombreBanda,
          puntos: Number(fila.total_despues_sanciones),
        })),
    [filasOrdenadas],
  );

  const nombreRegion =
    regionesList.find((r) => r.idRegion === region)?.nombreRegion ?? "—";
  const nombreCategoria =
    categoriasList.find((c) => c.idCategoria === categoria)?.nombreCategoria ??
    "—";
  const anio = new Date().getFullYear();
  const chartHeight = Math.max(240, chartData.length * 44 + 48);
  const maxPuntos = filasOrdenadas[0]
    ? Number(filasOrdenadas[0].total_despues_sanciones)
    : 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-8">
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Ranking</h1>
          <span className="text-sm text-slate-400">
            {filtrosListos ? filasOrdenadas.length : "—"}
          </span>
        </div>

        <p className="text-sm text-slate-400">
          {filtrosListos ? (
            <>
              <span className="text-slate-200">{nombreRegion}</span>
              {" · "}
              <span className="text-slate-200">{nombreCategoria}</span>
              {" · Temporada "}
              {anio}
            </>
          ) : (
            <>
              Elige <span className="text-slate-200">región</span>
              {" y "}
              <span className="text-slate-200">categoría</span> para cargar el
              ranking.
            </>
          )}
          {(isFetchingRegiones ||
            isFetchingCategorias ||
            isFetchingBandas ||
            (filtrosListos && isFetchingRanking)) && (
            <span className="ml-2 text-slate-500">Cargando…</span>
          )}
        </p>

        <div className="flex flex-wrap gap-4">
          <BuscadorRow filtrarBuscador={(ev) => setSearch(ev.target.value)} />
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
            <option value="">Todas las categorias</option>
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
          Selecciona una región y una categoría para ver el ranking de la
          temporada.
        </p>
      ) : !filasOrdenadas.length ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          No hay bandas para mostrar con los filtros seleccionados
          {search.trim() ? " o la búsqueda actual" : ""}.
        </p>
      ) : (
        <>
          <section className="flex flex-col gap-3 rounded-xl border border-slate-700/50 bg-slate-900/40 p-4 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                Mejor rendimiento
              </h2>
              <p className="text-sm text-slate-400">
                Bandas ordenadas por puntos.
              </p>
            </div>

            <ChartContainer
              config={chartConfig}
              className="aspect-auto w-full min-h-0"
              style={{ height: chartHeight }}
              initialDimension={{ width: 640, height: chartHeight }}
            >
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  domain={[0, maxPuntos > 0 ? maxPuntos : "auto"]}
                />
                <YAxis
                  type="category"
                  dataKey="nombreBanda"
                  width={140}
                  tick={{ fill: "hsl(215 20% 75%)" }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, _name, item) => (
                        <div className="flex w-full items-center justify-between gap-4">
                          <span className="text-muted-foreground">
                            {item.payload?.nombreBanda}
                          </span>
                          <span className="font-mono font-medium tabular-nums">
                            {formatearPuntos(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="puntos"
                  fill="var(--color-puntos)"
                  radius={4}
                  barSize={24}
                />
              </BarChart>
            </ChartContainer>
          </section>

          <section className="flex flex-col gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Tabla</h2>
              <p className="text-sm text-slate-400">
                Ranking de bandas por puntos en la temporada.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
              <table className="w-full min-w-[360px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-700/60 bg-slate-900/60 text-left text-slate-300">
                    <th className="px-4 py-3 font-medium">N°</th>
                    <th className="px-4 py-3 font-medium">Nombre de la banda</th>
                    <th className="px-4 py-3 font-medium">Puntos</th>
                    <th className="px-4 py-3 font-medium">Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {filasOrdenadas.map((fila, index) => (
                    <tr
                      key={fila.idBanda}
                      className={`border-b border-slate-800/80 ${
                        index % 2 === 0 ? "bg-slate-900/30" : "bg-slate-900/10"
                      }`}
                    >
                      <td className="px-4 py-3 font-mono tabular-nums text-slate-200">
                        {fila.posicion}
                      </td>
                      <td className="px-4 py-3 text-slate-100">
                        {fila.nombreBanda}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-slate-200">
                        {formatearPuntos(Number(fila.total_despues_sanciones))}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-slate-200">
                        {formatearPromedio(Number(fila.promedio))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
