"use client";

import { ComboBoxBandas } from "@/component/ComboBox/ComboBoxBandas";
import ConfirmRefrescarDatosModal from "@/component/controladores/ConfirmRefrescarDatosModal";
import type {
  bandaInterface,
  categoriaInterface,
  regionesInterface,
} from "@/interfaces/interfaces";
import {
  revalidarResultadosPorCategoria,
  revalidarResultadosPorIdBanda,
  revalidarResultadosPorRegion,
} from "@/lib/actions/revalidarResultadosEvento";
import BandasServices from "@/lib/services/bandasServices";
import CategoriasServices from "@/lib/services/categoriaServices";
import RegionService from "@/lib/services/regionesServices";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";

type ConfirmTarget =
  | { tipo: "region"; id: string; nombre: string }
  | { tipo: "categoria"; id: string; nombre: string }
  | { tipo: "banda"; id: string; nombre: string }
  | null;

function ordenarPorNombre<T extends { nombreRegion?: string; nombreCategoria?: string }>(
  items: T[],
  key: "nombreRegion" | "nombreCategoria",
): T[] {
  return [...items].sort((a, b) =>
    String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "es", {
      sensitivity: "base",
    }),
  );
}

function FilaRefresco({
  etiqueta,
  onRefrescar,
  refrescando,
  disabled,
}: {
  etiqueta: string;
  onRefrescar: () => void;
  refrescando?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-700/60 bg-slate-800/50 px-4 py-3">
      <span className="min-w-0 flex-1 text-sm font-medium text-slate-100">{etiqueta}</span>
      <button
        type="button"
        onClick={onRefrescar}
        disabled={disabled || refrescando}
        aria-label={`Actualizar datos de ${etiqueta}`}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-sky-400/35 bg-sky-500/10 text-sky-300 transition hover:border-sky-300/60 hover:bg-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 disabled:cursor-not-allowed disabled:opacity-45"
      >
        <ArrowPathIcon
          className={`h-5 w-5 ${refrescando ? "animate-spin" : ""}`}
          aria-hidden
        />
      </button>
    </div>
  );
}

export default function SeccionActualizarDatosMiBanda() {
  const [regiones, setRegiones] = useState<regionesInterface[]>([]);
  const [categorias, setCategorias] = useState<categoriaInterface[]>([]);
  const [bandas, setBandas] = useState<bandaInterface[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idBandaSeleccionada, setIdBandaSeleccionada] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<ConfirmTarget>(null);
  const [refrescandoId, setRefrescandoId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const regionesSvc = useRef(new RegionService());
  const categoriasSvc = useRef(new CategoriasServices());
  const bandasSvc = useRef(new BandasServices());

  const cargarCatalogos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      await Promise.all([
        regionesSvc.current.initPerfil(),
        categoriasSvc.current.initPerfil(),
        bandasSvc.current.initPerfil(),
      ]);
      const [regs, cats, bands] = await Promise.all([
        regionesSvc.current.get(),
        categoriasSvc.current.get(),
        bandasSvc.current.get(),
      ]);
      setRegiones(
        ordenarPorNombre(regs as regionesInterface[], "nombreRegion"),
      );
      setCategorias(
        ordenarPorNombre(cats as categoriaInterface[], "nombreCategoria"),
      );
      setBandas((bands as bandaInterface[]) ?? []);
    } catch (e) {
      console.error("[SeccionActualizarDatosMiBanda]", e);
      setError("No se pudieron cargar regiones, categorías o bandas.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void cargarCatalogos();
  }, [cargarCatalogos]);

  const ejecutarConfirmacion = async () => {
    if (!confirmTarget) return;
    setModalLoading(true);
    setError(null);
    setMensaje(null);
    try {
      let cantidad = 0;
      if (confirmTarget.tipo === "region") {
        cantidad = await revalidarResultadosPorRegion(confirmTarget.id);
        setMensaje(
          `Datos actualizados para ${cantidad} banda${cantidad === 1 ? "" : "s"} de la región «${confirmTarget.nombre}».`,
        );
      } else if (confirmTarget.tipo === "categoria") {
        cantidad = await revalidarResultadosPorCategoria(confirmTarget.id);
        setMensaje(
          `Datos actualizados para ${cantidad} banda${cantidad === 1 ? "" : "s"} de la categoría «${confirmTarget.nombre}».`,
        );
      } else {
        await revalidarResultadosPorIdBanda(confirmTarget.id);
        setMensaje(`Datos actualizados para «${confirmTarget.nombre}».`);
      }
      setConfirmTarget(null);
    } catch (e) {
      console.error(e);
      setError("No se pudo actualizar la caché. Revisa la consola o las variables de servidor.");
    } finally {
      setModalLoading(false);
      setRefrescandoId(null);
    }
  };

  const solicitarRefrescoBanda = () => {
    if (!idBandaSeleccionada) return;
    const nombre =
      bandas.find((b) => b.idBanda === idBandaSeleccionada)?.nombreBanda ??
      "la banda";
    setConfirmTarget({
      tipo: "banda",
      id: idBandaSeleccionada,
      nombre,
    });
  };

  const mensajeModal =
    confirmTarget?.tipo === "region"
      ? `¿Seguro que quieres refrescar toda la región «${confirmTarget.nombre}»? Se actualizarán los datos de mi-banda de todas las bandas de esa región.`
      : confirmTarget?.tipo === "categoria"
        ? `¿Seguro que quieres refrescar toda la categoría «${confirmTarget.nombre}»? Se actualizarán los datos de mi-banda de todas las bandas de esa categoría.`
        : confirmTarget?.tipo === "banda"
          ? `¿Seguro que quieres refrescar los datos de la banda «${confirmTarget.nombre}»? Solo se actualizará la información de esa banda.`
          : "";

  return (
    <section className="space-y-8 border-t border-slate-700/60 pt-10">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Actualizar datos
        </h2>
        <p className="text-sm text-slate-400">
          Refresca la caché de resultados, estadísticas y tablas en las páginas de
          mi-banda. Útil tras finalizar eventos o reimportar datos de prueba.
        </p>
      </header>

      {mensaje ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {mensaje}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {cargando ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-2xl border border-slate-700/40 bg-slate-800/40"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Por región
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {regiones.length === 0 ? (
                <p className="text-sm text-slate-400 sm:col-span-2">
                  No hay regiones en la federación.
                </p>
              ) : (
                regiones.map((region) => (
                  <FilaRefresco
                    key={region.idRegion}
                    etiqueta={region.nombreRegion}
                    refrescando={refrescandoId === region.idRegion}
                    onRefrescar={() => {
                      setRefrescandoId(region.idRegion);
                      setConfirmTarget({
                        tipo: "region",
                        id: region.idRegion,
                        nombre: region.nombreRegion,
                      });
                    }}
                  />
                ))
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Por categoría
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {categorias.length === 0 ? (
                <p className="text-sm text-slate-400 sm:col-span-2">
                  No hay categorías en la federación.
                </p>
              ) : (
                categorias.map((cat) => (
                  <FilaRefresco
                    key={cat.idCategoria}
                    etiqueta={cat.nombreCategoria}
                    refrescando={refrescandoId === cat.idCategoria}
                    onRefrescar={() => {
                      setRefrescandoId(cat.idCategoria);
                      setConfirmTarget({
                        tipo: "categoria",
                        id: cat.idCategoria,
                        nombre: cat.nombreCategoria,
                      });
                    }}
                  />
                ))
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Por banda
            </h3>
            <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-4">
              <label
                htmlFor="combo-banda-refresco"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Banda
              </label>
              <ComboBoxBandas
                id="combo-banda-refresco"
                bandas={bandas}
                value={idBandaSeleccionada}
                onChange={setIdBandaSeleccionada}
                placeholder="Seleccionar banda"
              />
              <button
                type="button"
                disabled={!idBandaSeleccionada || modalLoading}
                onClick={solicitarRefrescoBanda}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primario)] px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                <ArrowPathIcon className="h-4 w-4" aria-hidden />
                Actualizar banda seleccionada
              </button>
            </div>
          </div>
        </>
      )}

      <ConfirmRefrescarDatosModal
        open={confirmTarget !== null}
        onClose={() => {
          if (!modalLoading) {
            setConfirmTarget(null);
            setRefrescandoId(null);
          }
        }}
        onConfirm={ejecutarConfirmacion}
        loading={modalLoading}
        titulo="Confirmar actualización"
        mensaje={mensajeModal}
      />
    </section>
  );
}
