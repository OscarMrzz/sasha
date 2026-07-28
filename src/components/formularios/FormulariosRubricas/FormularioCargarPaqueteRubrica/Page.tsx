"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  categoriaInterface,
  jenniePaqueteInterface,
} from "@/models";
import CategoriasServices from "@/services/categoriaServices";
import RubricasPaquetesServices from "@/services/rubricasPaquetesServices";
import { mensajeRubricaDuplicada } from "@/services/rubricasServices";
import { useDispatch } from "react-redux";
import { activarRefrescarDataRubricas } from "@/features/RefrescadorData/refrescadorDataSlice";
import { ArrowUpTrayIcon } from "@heroicons/react/16/solid";

type Props = {
  onClose: () => void;
};

const inputBaseClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition focus:border-primario/80 focus:bg-white/[0.07] focus:ring-2 focus:ring-primario/35";

const labelClass =
  "mb-2 block text-xs font-medium uppercase tracking-wide text-white/70";

export default function FormularioCargarPaqueteRubrica({ onClose }: Props) {
  const dispatch = useDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paquetesServiceRef = useRef(new RubricasPaquetesServices());

  const [categoriasList, setCategoriasList] = useState<categoriaInterface[]>(
    []
  );
  const [paquete, setPaquete] = useState<jenniePaqueteInterface | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [idCategoriaSeleccionada, setIdCategoriaSeleccionada] = useState("");
  const [advertenciaCategoria, setAdvertenciaCategoria] = useState("");
  const [mensajeDuplicado, setMensajeDuplicado] = useState("");
  const [errorMensaje, setErrorMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificandoDuplicado, setVerificandoDuplicado] = useState(false);

  useEffect(() => {
    const categoriasServices = new CategoriasServices();
    categoriasServices
      .get()
      .then((categorias) => setCategoriasList(categorias))
      .catch((error) => {
        console.error("❌ Error al obtener las categorías:", error);
        setErrorMensaje("No se pudieron cargar las categorías del sistema.");
      });
  }, []);

  const aplicarResolucionCategoria = (
    paqueteLeido: jenniePaqueteInterface,
    categorias: categoriaInterface[]
  ) => {
    const resultado = paquetesServiceRef.current.resolverCategoriaPaquete(
      paqueteLeido.rubrica.idForaneaCategoria,
      categorias
    );

    setIdCategoriaSeleccionada(resultado.idCategoria ?? "");
    setAdvertenciaCategoria(resultado.advertencia ?? "");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMensaje("");
    setAdvertenciaCategoria("");
    setMensajeDuplicado("");
    setPaquete(null);
    setIdCategoriaSeleccionada("");
    setNombreArchivo(file.name);

    try {
      const paqueteLeido =
        await paquetesServiceRef.current.leerArchivoJennie(file);
      setPaquete(paqueteLeido);
      aplicarResolucionCategoria(paqueteLeido, categoriasList);
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "Error al leer el archivo";
      setErrorMensaje(mensaje);
    }
  };

  useEffect(() => {
    if (paquete && categoriasList.length > 0) {
      aplicarResolucionCategoria(paquete, categoriasList);
    }
  }, [categoriasList, paquete]);

  useEffect(() => {
    if (!paquete || !idCategoriaSeleccionada) {
      setMensajeDuplicado("");
      return;
    }

    let cancelado = false;
    setVerificandoDuplicado(true);

    paquetesServiceRef.current
      .existeRubricaDuplicada(
        paquete.rubrica.nombreRubrica,
        idCategoriaSeleccionada,
        paquete.rubrica.versionRubrica
      )
      .then((duplicada) => {
        if (cancelado) return;

        if (!duplicada) {
          setMensajeDuplicado("");
          return;
        }

        const nombreCategoria =
          categoriasList.find((c) => c.idCategoria === idCategoriaSeleccionada)
            ?.nombreCategoria ?? "seleccionada";

        setMensajeDuplicado(
          mensajeRubricaDuplicada(
            paquete.rubrica.nombreRubrica,
            nombreCategoria,
            paquete.rubrica.versionRubrica,
            "importar"
          )
        );
      })
      .catch(() => {
        if (!cancelado) setMensajeDuplicado("");
      })
      .finally(() => {
        if (!cancelado) setVerificandoDuplicado(false);
      });

    return () => {
      cancelado = true;
    };
  }, [paquete, idCategoriaSeleccionada, categoriasList]);

  const totalCumplimientos =
    paquete?.criterios.reduce(
      (acc, c) => acc + (c.cumplimientos?.length ?? 0),
      0
    ) ?? 0;

  const handleCambiarArchivo = () => {
    setPaquete(null);
    setNombreArchivo("");
    setIdCategoriaSeleccionada("");
    setAdvertenciaCategoria("");
    setMensajeDuplicado("");
    setErrorMensaje("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    fileInputRef.current?.click();
  };

  const handleImportar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paquete || !idCategoriaSeleccionada || mensajeDuplicado) return;

    setLoading(true);
    setErrorMensaje("");

    try {
      await paquetesServiceRef.current.agregarPaquete(
        paquete,
        idCategoriaSeleccionada,
        categoriasList
      );
      dispatch(activarRefrescarDataRubricas());
      onClose();
    } catch (error) {
      const mensaje =
        error instanceof Error ? error.message : "Error al importar el paquete";
      setErrorMensaje(mensaje);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">
            Importar paquete
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Cargar rúbrica
          </h2>
          <p className="mt-2 text-sm text-white/55">
            {paquete
              ? "Revisa el contenido del paquete antes de importar"
              : "Selecciona un archivo .jennie o .jennie.json"}
          </p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
          <form className="space-y-6" onSubmit={handleImportar}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jennie,.jennie.json"
              className="hidden"
              onChange={handleFileChange}
            />

            {!paquete ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/25 bg-white/5 px-4 py-4 text-sm font-medium text-white/80 transition hover:border-primario/50 hover:bg-white/[0.08]"
              >
                <ArrowUpTrayIcon className="h-5 w-5" />
                Seleccionar archivo
              </button>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-white/50">
                    Archivo cargado
                  </p>
                  <p className="truncate text-sm font-medium text-white">
                    {nombreArchivo}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCambiarArchivo}
                  className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5"
                >
                  Cambiar archivo
                </button>
              </div>
            )}

            {errorMensaje ? (
              <p className="text-sm text-red-400" role="alert">
                {errorMensaje}
              </p>
            ) : null}

            {paquete ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/50">
                      Rúbrica
                    </p>
                    <p className="font-medium text-white">
                      {paquete.rubrica.nombreRubrica}
                    </p>
                  </div>
                  {paquete.rubrica.datalleRubrica ? (
                    <p className="mt-2 text-sm text-white/70">
                      {paquete.rubrica.datalleRubrica}
                    </p>
                  ) : null}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-white/50">Versión</p>
                      <p className="text-white">{paquete.rubrica.versionRubrica}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Puntos</p>
                      <p className="text-white">{paquete.rubrica.puntosRubrica}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Criterios</p>
                      <p className="text-white">{paquete.criterios.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50">Cumplimientos</p>
                      <p className="text-white">{totalCumplimientos}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-white/50">Categoría en paquete</p>
                    <p className="text-white">
                      {paquete.rubrica.idForaneaCategoria}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white">
                      Criterios y cumplimientos
                    </h3>
                    <p className="mt-1 text-xs text-white/55">
                      Revisa cada criterio y sus niveles de cumplimiento antes de importar.
                    </p>
                  </div>

                  <div className="max-h-[40vh] space-y-3 overflow-y-auto pr-1 scrollbar-estetica">
                    {paquete.criterios.map((criterio, index) => (
                      <article
                        key={criterio.idCriterio || `${criterio.nombreCriterio}-${index}`}
                        className="rounded-xl border border-white/10 bg-slate-700/30 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs uppercase tracking-wide text-white/50">
                              Criterio {index + 1}
                            </p>
                            <p className="font-medium text-white">
                              {criterio.nombreCriterio}
                            </p>
                            {criterio.detallesCriterio ? (
                              <p className="mt-1 text-sm text-white/70">
                                {criterio.detallesCriterio}
                              </p>
                            ) : null}
                          </div>
                          <span className="inline-flex shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/80">
                            {criterio.puntosCriterio} pts
                          </span>
                        </div>

                        <div className="mt-4">
                          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/50">
                            Cumplimientos
                          </p>
                          {(criterio.cumplimientos?.length ?? 0) > 0 ? (
                            <ul className="space-y-2">
                              {criterio.cumplimientos.map((cumplimiento, cumplimientoIndex) => (
                                <li
                                  key={
                                    cumplimiento.idCumplimiento ||
                                    `${cumplimiento.detalleCumplimiento}-${cumplimientoIndex}`
                                  }
                                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                                >
                                  <span className="text-white/85">
                                    {cumplimiento.detalleCumplimiento}
                                  </span>
                                  <span className="shrink-0 text-xs font-semibold text-primario">
                                    {cumplimiento.puntosCumplimiento} pts
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-amber-400">
                              Este criterio no incluye cumplimientos.
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {paquete ? (
              <div>
                <label className={labelClass} htmlFor="idCategoriaImportar">
                  Categoría <span className="text-primario">*</span>
                </label>
                <select
                  id="idCategoriaImportar"
                  value={idCategoriaSeleccionada}
                  onChange={(e) => {
                    setIdCategoriaSeleccionada(e.target.value);
                    setAdvertenciaCategoria("");
                    setMensajeDuplicado("");
                  }}
                  className={inputBaseClass}
                  required
                >
                  <option className="bg-slate-800 text-slate-100" value="">
                    Seleccione una categoría
                  </option>
                  {categoriasList.map((cat) => (
                    <option
                      className="bg-slate-800 text-slate-100"
                      key={cat.idCategoria}
                      value={cat.idCategoria}
                    >
                      {cat.nombreCategoria}
                    </option>
                  ))}
                </select>
                {advertenciaCategoria ? (
                  <p className="mt-2 text-sm text-amber-400" role="alert">
                    {advertenciaCategoria}
                  </p>
                ) : null}
                {mensajeDuplicado ? (
                  <p className="mt-2 text-sm text-red-400" role="alert">
                    {mensajeDuplicado}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={
                  loading ||
                  verificandoDuplicado ||
                  !paquete ||
                  !idCategoriaSeleccionada ||
                  Boolean(mensajeDuplicado)
                }
                className="rounded-xl bg-primario px-6 py-3 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/50 disabled:shadow-none"
              >
                {loading
                  ? "Importando…"
                  : verificandoDuplicado
                    ? "Verificando…"
                    : "Importar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
