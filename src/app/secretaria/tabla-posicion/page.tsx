"use client";

import { fetchTablaPosicionesSecretaria } from "@/actions/tablaPosicionesSecretaria";
import type { TablaPosicionSecretariaPayload } from "@/services/servidor/resultadosServices";
import BuscadorRow from "@/components/buscadores/BuscadorRow";
import CardRowPosicionRegional from "@/components/CardRow/CardRowPosicionRegional";
import type {
  categoriaDatosAmpleosInterface,
  perfilDatosAmpleosInterface,
  regionesDatosAmpleosInterface,
} from "@/models";
import CategoriasServices from "@/services/categoriaServices";
import PerfilesServices from "@/services/perfilesServices";
import RegionesServices from "@/services/regionesServices";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useRef, useState } from "react";

const payloadVacio: TablaPosicionSecretariaPayload = {
  nombreRegion: "",
  filas: [],
};

export default function Page() {
  const perfilesServices = useRef(new PerfilesServices());
  const regionesServices = useRef(new RegionesServices());
  const categoriasServices = useRef(new CategoriasServices());
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [categoria, setCategoria] = useState("");

  const { data: perfil } = useQuery({
    queryKey: ["secretaria", "tabla-posicion", "perfil"],
    queryFn: () => perfilesServices.current.getUsuarioLogiado(),
  });

  const idFederacion = (perfil as perfilDatosAmpleosInterface | undefined)
    ?.idForaneaFederacion;

  const filtrosListos =
    !!idFederacion?.trim() && !!region.trim() && !!categoria.trim();

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
    data: tablaData = payloadVacio,
    isFetching: isFetchingTabla,
  } = useQuery({
    queryKey: [
      "secretaria",
      "tabla-posicion",
      idFederacion,
      region,
      categoria,
    ],
    queryFn: async () =>
      fetchTablaPosicionesSecretaria(
        idFederacion!,
        region,
        categoria,
      ),
    enabled: filtrosListos,
  });

  const filtrarBuscador = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const texto = ev.target.value;
    setSearch(texto);
    if (texto.trim() === "") return;
    setRegion("");
    setCategoria("");
  };

  const filasFiltradas = useMemo(() => {
    const base = tablaData.filas;
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((fila) =>
      fila.nombreBanda.toLowerCase().includes(q),
    );
  }, [tablaData.filas, search]);

  const filtrarPorRegion = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    setRegion(ev.target.value);
  };
  const filtrarPorCategoria = (
    ev: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setCategoria(ev.target.value);
  };

  const anio = new Date().getFullYear();
  const nombreCat =
    tablaData.filas[0]?.nombreCategoria ??
    (categoria &&
      categoriasList.find((c) => c.idCategoria === categoria)
        ?.nombreCategoria) ??
    "—";

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-8">
      <section className="mb-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Tabla de posiciones</h1>
          <span className="text-sm text-slate-400">
            {filtrosListos ? filasFiltradas.length : "—"}
          </span>
        </div>

        <p className="text-sm text-slate-400">
          {filtrosListos ? (
            <>
              <span className="text-slate-200">
                {tablaData.nombreRegion || "Región"}
              </span>
              {" · "}
              <span className="text-slate-200">{nombreCat}</span>
              {" · Temporada "}
              {anio}
            </>
          ) : (
            <>
              Elige <span className="text-slate-200">región</span>
              {" y "}
              <span className="text-slate-200">categoría</span> para cargar la
              tabla.
            </>
          )}
          {(isFetchingRegiones ||
            isFetchingCategorias ||
            (filtrosListos && isFetchingTabla)) && (
            <span className="ml-2 text-slate-500">Cargando…</span>
          )}
        </p>

        <div className="flex flex-wrap gap-4">
          <BuscadorRow filtrarBuscador={filtrarBuscador} />
          <select
            className="rounded-md border border-slate-300 bg-slate-800 p-2 text-slate-100"
            value={region}
            onChange={filtrarPorRegion}
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
            onChange={filtrarPorCategoria}
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
          Selecciona una región y una categoría de tu federación para ver la
          tabla regional de temporada.
        </p>
      ) : !filasFiltradas.length ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          No hay bandas para mostrar en esta tabla (o ninguna coincide con la
          búsqueda).
        </p>
      ) : (
        <section className="flex flex-col gap-4 sm:gap-5">
          {filasFiltradas.map((fila, i) => (
            <CardRowPosicionRegional
              key={fila.idBanda}
              fila={fila}
              esMiBanda={false}
              index={i}
            />
          ))}
        </section>
      )}
    </div>
  );
}
