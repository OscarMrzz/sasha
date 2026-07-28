"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  bandaInterface,
  categoriaDatosAmpleosInterface,
  regionesDatosAmpleosInterface,
  vistaAplicacionSancionInterface,
} from "@/models";
import {
  getAllAplicacionSanciones,
  getAplicacionSancionesPorAnio,
} from "@/services/aplicacionSancionesServices";
import BandasServices from "@/services/bandasServices";
import CategoriasServices from "@/services/categoriaServices";
import RegionesServices from "@/services/regionesServices";
import { ComboBoxBandas } from "@/components/ComboBox/ComboBoxBandas";
import CardRowAplicacionSancionLectura from "@/components/CardRow/lectura/CardRowAplicacionSancionLectura";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";

type Props = {
  titulo?: string;
  soloAnioActual?: boolean;
};

const selectClass =
  "h-11 rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100";

export default function ListaSancionesAplicadasFiltrable({
  titulo = "Sanciones aplicadas",
  soloAnioActual = false,
}: Props) {
  const anioActual = new Date().getFullYear();
  const bandasServices = useRef(new BandasServices());
  const categoriasServices = useRef(new CategoriasServices());
  const regionesServices = useRef(new RegionesServices());

  const [idBanda, setIdBanda] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [idRegion, setIdRegion] = useState("");

  const { data: filas = [], isPending } = useQuery({
    queryKey: ["aplicacion-sanciones", soloAnioActual ? anioActual : "todas"],
    queryFn: () =>
      soloAnioActual
        ? getAplicacionSancionesPorAnio(anioActual)
        : getAllAplicacionSanciones(),
  });

  const { data: bandas = [] as bandaInterface[] } = useQuery({
    queryKey: ["bandas-filtro-sanciones"],
    queryFn: async () => {
      await bandasServices.current.initPerfil();
      return (await bandasServices.current.get()) as bandaInterface[];
    },
  });

  const { data: categoriasList = [] as categoriaDatosAmpleosInterface[] } =
    useQuery({
      queryKey: ["categorias"],
      queryFn: () => categoriasServices.current.getDatosAmpleos(),
    });

  const { data: regionesList = [] as regionesDatosAmpleosInterface[] } =
    useQuery({
      queryKey: ["regiones"],
      queryFn: () => regionesServices.current.getDatosAmpleos(),
    });

  const filtradas = useMemo(() => {
    return filas.filter((f: vistaAplicacionSancionInterface) => {
      if (idBanda && f.idBanda !== idBanda) return false;
      if (idCategoria && f.idCategoria !== idCategoria) return false;
      if (idRegion && f.idRegion !== idRegion) return false;
      return true;
    });
  }, [filas, idBanda, idCategoria, idRegion]);

  return (
    <div className="w-full">
      <header className="mb-6 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold text-white">{titulo}</h1>
          {!isPending ? (
            <span className="text-sm text-slate-400">{filtradas.length}</span>
          ) : null}
          {soloAnioActual ? (
            <span className="rounded-md bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
              Año {anioActual}
            </span>
          ) : null}
        </div>
        {soloAnioActual ? (
          <p className="text-sm text-slate-400">
            Solo sanciones aplicadas en {anioActual}.
          </p>
        ) : null}
      </header>

      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ComboBoxBandas
          bandas={bandas}
          value={idBanda}
          onChange={setIdBanda}
          placeholder="Todas las bandas"
        />
        <select
          value={idCategoria}
          onChange={(e) => setIdCategoria(e.target.value)}
          className={selectClass}
        >
          <option value="">Todas las categorías</option>
          {categoriasList.map((c) => (
            <option key={c.idCategoria} value={c.idCategoria}>
              {c.nombreCategoria}
            </option>
          ))}
        </select>
        <select
          value={idRegion}
          onChange={(e) => setIdRegion(e.target.value)}
          className={selectClass}
        >
          <option value="">Todas las regiones</option>
          {regionesList.map((r) => (
            <option key={r.idRegion} value={r.idRegion}>
              {r.nombreRegion}
            </option>
          ))}
        </select>
      </section>

      {isPending ? (
        <SkeletonTabla />
      ) : filtradas.length === 0 ? (
        <p className="rounded-xl border border-slate-600/40 bg-slate-800/40 px-4 py-8 text-center text-slate-400">
          No hay sanciones aplicadas con los filtros seleccionados.
        </p>
      ) : (
        <section className="flex flex-col gap-3">
          {filtradas.map((registro) => (
            <CardRowAplicacionSancionLectura
              key={
                registro.id_registro_sanciones ??
                `${registro.idBanda}-${registro.id_sancion}-${registro.fecha_aplico_sancion}`
              }
              registro={registro}
            />
          ))}
        </section>
      )}
    </div>
  );
}
