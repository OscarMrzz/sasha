"use client";

import CardRowCopa, { type CopaFilaDisplay } from "@/components/copas/CardRowCopa";
import FormularioCopa from "@/components/copas/FormularioCopa";
import InformacionCopaComponent from "@/components/copas/InformacionCopaComponent";
import ConfirmDeleteModal from "@/components/modales/ConfirmDeleteModal/ConfirmDeleteModal";
import OverleyModal from "@/components/modales/OverleyModal/Page";
import OverleyModalFormulario from "@/components/modales/OverleyModalFormulario/Page";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";
import type {
  categoriaInterface,
  copaInterface,
  registroEventoDatosAmpleosInterface,
} from "@/models";
import {
  eliminarCopaAccion,
  obtenerCopasPorEventoAccion,
} from "@/actions/copasAcciones";
import { filtrarEventosDelDia } from "@/helpers/fechas/eventosDelDia";
import BandasServices from "@/services/bandasServices";
import CategoriasServices from "@/services/categoriaServices";
import CopasServices from "@/services/copasServices";
import { PlusIcon } from "@heroicons/react/16/solid";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const selectBaseClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100 transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]";

type Props = {
  eventosFuente: registroEventoDatosAmpleosInterface[];
  cargandoEventos?: boolean;
  filtrarSoloHoyIniciados?: boolean;
  titulo?: string;
};

function aplicarFiltroCategoria(
  lista: CopaFilaDisplay[],
  idCategoria: string,
): CopaFilaDisplay[] {
  if (!idCategoria.trim()) return lista;
  return lista.filter((c) => c.idCategoriaBanda === idCategoria);
}

export default function GestorCopas({
  eventosFuente,
  cargandoEventos = false,
  filtrarSoloHoyIniciados = true,
  titulo = "Copas",
}: Props) {
  const copasServices = useRef(new CopasServices());
  const categoriasServices = useRef(new CategoriasServices());
  const bandasServices = useRef(new BandasServices());

  const [copasList, setCopasList] = useState<CopaFilaDisplay[]>([]);
  const [copasListOriginal, setCopasListOriginal] = useState<CopaFilaDisplay[]>([]);
  const [copasRaw, setCopasRaw] = useState<copaInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [cargandoFiltros, setCargandoFiltros] = useState(false);
  const [categoriasList, setCategoriasList] = useState<categoriaInterface[]>([]);

  const [idEvento, setIdEvento] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  const [selectedCopa, setSelectedCopa] = useState<CopaFilaDisplay | null>(null);
  const [openInformacion, setOpenInformacion] = useState(false);
  const [formularioAgregarAbierto, setFormularioAgregarAbierto] = useState(false);
  const [openFormEditar, setOpenFormEditar] = useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
  const [copaAEliminar, setCopaAEliminar] = useState<CopaFilaDisplay | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const eventosValidos = useMemo(() => {
    let lista = [...eventosFuente];
    if (filtrarSoloHoyIniciados) {
      lista = filtrarEventosDelDia(lista);
      lista = lista.filter((e) => e.estado_evento === "iniciado");
    }
    return lista;
  }, [eventosFuente, filtrarSoloHoyIniciados]);

  const enriquecerCopas = useCallback(
    async (copas: copaInterface[]): Promise<CopaFilaDisplay[]> => {
      await bandasServices.current.initPerfil();
      const bandas = await bandasServices.current.getDatosAmpleos();
      const bandaMap = new Map(bandas.map((b) => [b.idBanda, b]));
      const catMap = new Map(categoriasList.map((c) => [c.idCategoria, c]));

      return copas
        .map((c) => {
          const banda = bandaMap.get(c.id_foranea_banda);
          const catId = banda?.idForaneaCategoria ?? "";
          return {
            ...c,
            nombreBanda: banda?.nombreBanda ?? "Banda",
            nombreCategoria: catMap.get(catId)?.nombreCategoria ?? "—",
            idCategoriaBanda: catId,
          };
        })
        .sort((a, b) => Number(a.lugar) - Number(b.lugar));
    },
    [categoriasList],
  );

  const traerCopasEvento = useCallback(
    async (idEventoSel: string, idCategoriaFiltro: string) => {
      if (!idEventoSel.trim()) {
        setCopasList([]);
        setCopasListOriginal([]);
        setCopasRaw([]);
        return;
      }
      setLoading(true);
      setErrorCarga(null);
      try {
        await copasServices.current.initPerfil();
        await copasServices.current.validarEventoEnFederacion(idEventoSel);
        const copas = await obtenerCopasPorEventoAccion(idEventoSel);
        setCopasRaw(copas);
        const enriquecidas = await enriquecerCopas(copas);
        setCopasListOriginal(enriquecidas);
        setCopasList(aplicarFiltroCategoria(enriquecidas, idCategoriaFiltro));
      } catch (error) {
        console.error("Error al cargar copas:", error);
        setErrorCarga(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las copas del evento.",
        );
        setCopasList([]);
        setCopasListOriginal([]);
        setCopasRaw([]);
      } finally {
        setLoading(false);
      }
    },
    [enriquecerCopas],
  );

  useEffect(() => {
    let cancelado = false;
    async function cargarFiltros() {
      setCargandoFiltros(true);
      try {
        await categoriasServices.current.initPerfil();
        const categorias = await categoriasServices.current.get();
        if (!cancelado) setCategoriasList(categorias);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      } finally {
        if (!cancelado) setCargandoFiltros(false);
      }
    }
    void cargarFiltros();
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!idEvento) return;
    void traerCopasEvento(idEvento, categoriaSeleccionada);
  }, [idEvento, traerCopasEvento, categoriaSeleccionada]);

  useEffect(() => {
    if (!copasRaw.length || !categoriasList.length || !idEvento) return;
    void (async () => {
      const enriquecidas = await enriquecerCopas(copasRaw);
      setCopasListOriginal(enriquecidas);
      setCopasList(aplicarFiltroCategoria(enriquecidas, categoriaSeleccionada));
    })();
  }, [categoriasList, copasRaw, enriquecerCopas, idEvento, categoriaSeleccionada]);

  const seleccionarEvento = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    const val = ev.target.value;
    setIdEvento(val);
    setCategoriaSeleccionada("");
    if (!val) {
      setCopasList([]);
      setCopasListOriginal([]);
      setCopasRaw([]);
    }
  };

  const seleccionarCategoria = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoriaSeleccionada(ev.target.value);
  };

  const abrirInformacion = (copa: CopaFilaDisplay) => {
    setSelectedCopa(copa);
    setOpenInformacion(true);
  };

  const abrirEditar = (copa: CopaFilaDisplay) => {
    setSelectedCopa(copa);
    setOpenInformacion(false);
    setOpenFormEditar(true);
  };

  const abrirEliminar = (copa: CopaFilaDisplay) => {
    setCopaAEliminar(copa);
    setOpenConfirmDelete(true);
  };

  const eliminarConfirmada = async () => {
    if (!copaAEliminar || !idEvento) return;
    try {
      await eliminarCopaAccion(copaAEliminar.id_copas, idEvento);
      await traerCopasEvento(idEvento, categoriaSeleccionada);
    } catch (error) {
      console.error("Error al eliminar copa:", error);
    }
    setCopaAEliminar(null);
  };

  const onGuardadoFormulario = async (idEventoGuardado?: string) => {
    if (idEvento && idEventoGuardado === idEvento) {
      await traerCopasEvento(idEvento, categoriaSeleccionada);
    }
  };

  if (cargandoEventos) {
    return <p className="text-center text-slate-300">Cargando eventos…</p>;
  }

  if (!eventosValidos.length) {
    return (
      <div className="w-full pb-25">
        <h1 className="mb-4 text-2xl font-bold">{titulo}</h1>
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          No hay eventos activos hoy que puedas gestionar. Solo aparecen eventos del
          día en curso (iniciados) que te correspondan.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full pb-25">
        <section className="mb-4 flex w-full flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <h1 className="text-2xl font-bold">{titulo}</h1>
            <div className="flex items-center">
              <button
                type="button"
                className="flex cursor-pointer gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-300"
                onClick={() => setFormularioAgregarAbierto(true)}
              >
                <PlusIcon className="h-5 w-5 rounded-2xl" />
                Agregar
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:max-w-2xl">
            <div className="min-w-0">
              <label
                htmlFor="filtro-evento-copas"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Filtrar por evento
              </label>
              <select
                id="filtro-evento-copas"
                className={selectBaseClass}
                value={idEvento}
                onChange={seleccionarEvento}
              >
                <option className="bg-slate-800 text-slate-100" value="">
                  Selecciona evento
                </option>
                {eventosValidos.map((e) => (
                  <option
                    className="bg-slate-800 text-slate-100"
                    key={e.idEvento}
                    value={e.idEvento}
                  >
                    {e.LugarEvento}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label
                htmlFor="filtro-categoria-copas"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Categoría
              </label>
              <select
                id="filtro-categoria-copas"
                className={selectBaseClass}
                value={categoriaSeleccionada}
                onChange={seleccionarCategoria}
                disabled={cargandoFiltros || !idEvento}
              >
                <option className="bg-slate-800 text-slate-100" value="">
                  Todas las categorías
                </option>
                {categoriasList.map((categoria) => (
                  <option
                    className="bg-slate-800 text-slate-100"
                    key={categoria.idCategoria}
                    value={categoria.idCategoria}
                  >
                    {categoria.nombreCategoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <div className="w-full">
          <OverleyModal open={openInformacion} onClose={() => setOpenInformacion(false)}>
            {selectedCopa && (
              <InformacionCopaComponent
                copa={selectedCopa}
                onClose={() => setOpenInformacion(false)}
                onEditar={() => {
                  setOpenInformacion(false);
                  setOpenFormEditar(true);
                }}
              />
            )}
          </OverleyModal>

          <OverleyModalFormulario
            open={formularioAgregarAbierto}
            onClose={() => setFormularioAgregarAbierto(false)}
          >
            {formularioAgregarAbierto && (
              <FormularioCopa
                idEvento={idEvento}
                eventosDisponibles={eventosValidos}
                idCategoriaInicial={categoriaSeleccionada}
                onClose={() => setFormularioAgregarAbierto(false)}
                onGuardado={(idEventoGuardado) => void onGuardadoFormulario(idEventoGuardado)}
              />
            )}
          </OverleyModalFormulario>

          <OverleyModalFormulario open={openFormEditar} onClose={() => setOpenFormEditar(false)}>
            {idEvento && selectedCopa && (
              <FormularioCopa
                idEvento={idEvento}
                copaEditar={selectedCopa}
                copasDelEvento={copasRaw}
                onClose={() => setOpenFormEditar(false)}
                onGuardado={(idEventoGuardado) => void onGuardadoFormulario(idEventoGuardado)}
              />
            )}
          </OverleyModalFormulario>

          <ConfirmDeleteModal
            open={openConfirmDelete}
            onClose={() => setOpenConfirmDelete(false)}
            onConfirm={eliminarConfirmada}
            nombreElemento={
              copaAEliminar
                ? `${copaAEliminar.lugar}º · ${copaAEliminar.nombreBanda}`
                : "esta copa"
            }
            titulo="Confirmar eliminación"
          />

          {errorCarga && (
            <p className="mb-4 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-center text-sm text-red-200">
              {errorCarga}
            </p>
          )}

          {!idEvento ? (
            <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
              Selecciona un evento para ver las copas asignadas.
            </p>
          ) : loading ? (
            <SkeletonTabla />
          ) : !copasList.length ? (
            <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
              {copasListOriginal.length > 0 && categoriaSeleccionada ? (
                <>
                  Hay {copasListOriginal.length} copa
                  {copasListOriginal.length === 1 ? "" : "s"} en este evento, pero ninguna
                  coincide con la categoría seleccionada. Prueba &quot;Todas las categorías&quot;
                  o elige la categoría de la banda asignada.
                </>
              ) : (
                <>
                  No hay copas registradas
                  {categoriaSeleccionada ? " en esta categoría" : ""} para este evento.
                </>
              )}
            </p>
          ) : (
            <div className="flex w-full flex-col gap-4">
              {copasList.map((copa) => (
                <CardRowCopa
                  key={copa.id_copas}
                  copa={copa}
                  abrirInformacion={abrirInformacion}
                  abrirEditar={abrirEditar}
                  abrirEliminar={abrirEliminar}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
