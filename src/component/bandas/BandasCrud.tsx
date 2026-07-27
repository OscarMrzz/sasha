"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BandasServices from "@/lib/services/bandasServices";
import {
  bandaDatosAmpleosInterface,
  categoriaInterface,
  regionesInterface,
  resultadosTemporadaInterface,
} from "@/interfaces/interfaces";
import SkeletonTabla from "@/component/skeleton/SkeletonTabla/Page";
import React from "react";

import OverleyModalFormulario from "@/component/modales/OverleyModalFormulario/Page";
import FormularioAgregarBandaComonent from "@/component/formularios/bandaFormulario/formularioAgregarBandaComponent/Page";
import { PlusIcon } from "@heroicons/react/16/solid";
import CategoriasServices from "@/lib/services/categoriaServices";
import OverleyModal from "@/component/modales/OverleyModal/Page";
import InformacionBandaComponent from "@/component/informacion/informacionBandaComponent/Page";
import FormularioEditarBandaComponent from "@/component/formularios/bandaFormulario/formularioEditarBandaComponent/Page";
import RegistroCumplimientoServices from "@/lib/services/RegistroCumplimientosServices";
import RegionService from "@/lib/services/regionesServices";
import CardRowBandas from "@/component/CardRow/CardRowBandas";
import ConfirmDeleteModal from "@/component/modales/ConfirmDeleteModal/ConfirmDeleteModal";
import BuscadorRow from "@/component/buscadores/BuscadorRow";
import useAtajoPagina from "@/hooks/useAtajoPagina";
import ErrorMessage from "@/component/Message/ErrorMessage";

const selectBaseClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100 transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]";

export default function BandasCrud() {
  const bandasServices = useRef(new BandasServices());
  const regionesServices = useRef(new RegionService());
  const categoriasServices = useRef(new CategoriasServices());
  const registroCumplimientosServices = useRef(new RegistroCumplimientoServices());

  const [bandasList, setBandasList] = useState<bandaDatosAmpleosInterface[]>([]);
  const [bandasListOriginal, setBandasListOriginal] = useState<bandaDatosAmpleosInterface[]>([]);

  const [selectedBanda, setSelectedBanda] = React.useState<bandaDatosAmpleosInterface | null>(null);
  const [openFormEditar, setOpenFormEditar] = React.useState(false);

  const [loading, setLoading] = useState(true);
  const [formularioAgregarHabierto, setFormularioAgregarHabierto] = useState(false);
  const [urlLogoBanda, setUrlLogoBanda] = useState<string>("");
  const [resultadosTemporada, setResultadosTemporada] = useState<resultadosTemporadaInterface | null>(null);

  const [open, setOpen] = React.useState(false);
  const [openConfirmDelete, setOpenConfirmDelete] = React.useState(false);
  const [bandaAEliminar, setBandaAEliminar] = React.useState<bandaDatosAmpleosInterface | null>(null);
  const [regionesLista, setRegionesLista] = useState<regionesInterface[]>([]);

  const [regionSeleccionada, setRegionSeleccionada] = useState<string>("");
  const [cargandoFiltros, setCargandoFiltros] = useState(false);
  const [categoriasList, setCategoriasList] = useState<categoriaInterface[]>();

  const [categoriaSelecionada, setcategoriaSelecionada] = useState<string>("");

  const [openModalError, setOpenModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  const abrirModalError = (mensaje: string) => {
    setOpenModalError(true);
    setMensajeError(mensaje);
  };

  const cerrarModalError = () => {
    setOpenModalError(false);
    setMensajeError("");
  };

  useEffect(() => {
    traerDatosTabla();
  }, []);

  async function traerDatosTabla() {
    try {
      const bandasData: bandaDatosAmpleosInterface[] = await bandasServices.current.getDatosAmpleos();
      setBandasList(bandasData);
      setBandasListOriginal(bandasData);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error al obtener las bandas:", error);
      setLoading(false);
    }
  }
  const abrirFormularioAgregar = useCallback(() => {
    setFormularioAgregarHabierto(true);
  }, []);

  useAtajoPagina("agregar", abrirFormularioAgregar);

  const cerrarModal = () => {
    setOpen(false);
  };

  const cerrarModalEditar = () => {
    setOpenFormEditar(false);
  };

  const abrirModalEditar = async () => {
    if (selectedBanda) {
      const urlLogoBanda = await bandasServices.current.obtenerUrlLogoBanda(selectedBanda.urlLogoBanda || "");
      setUrlLogoBanda(urlLogoBanda || "");
    }
    setOpenFormEditar(true);
  };

  const abrirModalInformacion = async (banda: bandaDatosAmpleosInterface) => {
    const resultadosTemporada = await registroCumplimientosServices.current.resultadosTemporadaPorBanda(
      banda.idBanda,
      banda.idForaneaCategoria ?? ""
    );
    setResultadosTemporada(resultadosTemporada || null);

    const urlLogoBanda = await bandasServices.current.obtenerUrlLogoBanda(banda.urlLogoBanda || "");
    setUrlLogoBanda(urlLogoBanda || "");
    setSelectedBanda(banda);

    setOpen(true);
  };

  const abrirConfirmEliminar = (banda: bandaDatosAmpleosInterface) => {
    setBandaAEliminar(banda);
    setOpenConfirmDelete(true);
  };

  const eliminarBandaConfirmada = async () => {
    if (!bandaAEliminar) return;
    await bandasServices.current.delete(bandaAEliminar.idBanda);
    await traerDatosTabla();
  };

  const filtrarBandas = (idRegion: string, idCategoria: string) => {
    let bandasFiltradas = bandasListOriginal;
    if (idRegion) {
      bandasFiltradas = bandasFiltradas.filter((banda) => banda.idForaneaRegion === idRegion);
    }
    if (idCategoria) {
      bandasFiltradas = bandasFiltradas.filter((banda) => banda.idForaneaCategoria === idCategoria);
    }
    setBandasList(bandasFiltradas);
  };

  const selecionarRegion = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const idRegion = event.target.value;

    setRegionSeleccionada(idRegion);
    filtrarBandas(idRegion, categoriaSelecionada);
  };

  const selecionarCategoria = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const idCategoria = event.target.value;
    setcategoriaSelecionada(idCategoria);
    filtrarBandas(regionSeleccionada, idCategoria);
  };

  const cargarFiltros = async () => {
    setCargandoFiltros(true);
    try {
      const regionesData: regionesInterface[] = await regionesServices.current.get();

      setRegionesLista(regionesData);
      const categoriasData: categoriaInterface[] = await categoriasServices.current.get();
      setCategoriasList(categoriasData);

      setCargandoFiltros(false);
    } catch (error) {
      console.error("❌ Error al obtener los filtros:", error);
      setCargandoFiltros(false);
    }
  };

  useEffect(() => {
    cargarFiltros();
  }, []);

  const filtrarBandasBuscador = (evento: React.ChangeEvent<HTMLInputElement>) => {
    setRegionSeleccionada("");
    setcategoriaSelecionada("");

    const texto = evento.target.value.toLowerCase();
    if (!texto) {
      setBandasList(bandasListOriginal || []);
      return;
    }
    if (bandasListOriginal && bandasList.length) {
      const bandasFiltradas = bandasListOriginal.filter(
        (banda) =>
          banda.nombreBanda.toLowerCase().includes(texto) || banda.AliasBanda.toLowerCase().includes(texto)
      );
      setBandasList(bandasFiltradas);
    }
  };

  return (
    <>
      <ErrorMessage titulo="Error" open={openModalError} onClose={cerrarModalError} texto={mensajeError} />
      <div className="w-full pb-25">
        <section className="flex w-full flex-col gap-4 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Bandas</h1>
            <span className="text-sm text-slate-400">{bandasList.length}</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <BuscadorRow filtrarBuscador={filtrarBandasBuscador} />
            <div className="flex items-center">
              <button
                className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-300 cursor-pointer flex gap-2"
                onClick={abrirFormularioAgregar}
              >
                <PlusIcon className="w-5 h-5 rounded-2xl" />
                Agregar
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:max-w-2xl">
            <div className="min-w-0">
              <label
                htmlFor="filtro-region"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Región
              </label>
              <select
                id="filtro-region"
                className={selectBaseClass}
                value={regionSeleccionada}
                onChange={selecionarRegion}
                disabled={cargandoFiltros}
              >
                <option className="bg-slate-800 text-slate-100" value="">
                  Todas las regiones
                </option>
                {regionesLista.map((Region) => (
                  <option className="bg-slate-800 text-slate-100" key={Region.idRegion} value={Region.idRegion}>
                    {Region.nombreRegion}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label
                htmlFor="filtro-categoria"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Categoría
              </label>
              <select
                id="filtro-categoria"
                className={selectBaseClass}
                value={categoriaSelecionada}
                onChange={selecionarCategoria}
                disabled={cargandoFiltros}
              >
                <option className="bg-slate-800 text-slate-100" value="">
                  Todas las categorías
                </option>
                {categoriasList?.map((categoria) => (
                  <option className="bg-slate-800 text-slate-100" key={categoria.idCategoria} value={categoria.idCategoria}>
                    {categoria.nombreCategoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
        <div className=" w-full ">
          <OverleyModal open={open} onClose={cerrarModal}>
            {selectedBanda && (
              <InformacionBandaComponent
                Banda={selectedBanda}
                onClose={cerrarModal}
                onRefresh={traerDatosTabla}
                openFormEditar={abrirModalEditar}
                urlLogoBanda={urlLogoBanda}
                resultadosTemporada={resultadosTemporada}
              />
            )}
          </OverleyModal>

          <OverleyModalFormulario open={formularioAgregarHabierto} onClose={() => setFormularioAgregarHabierto(false)}>
            <FormularioAgregarBandaComonent
              refresacar={traerDatosTabla}
              onClose={() => setFormularioAgregarHabierto(false)}
            />
          </OverleyModalFormulario>

          <OverleyModalFormulario open={openFormEditar} onClose={cerrarModalEditar}>
            {selectedBanda && (
              <FormularioEditarBandaComponent
                onClose={cerrarModalEditar}
                refresacar={traerDatosTabla}
                bandaAEditar={selectedBanda}
                urlLogoBanda={urlLogoBanda}
                openErrorModal={abrirModalError}
              />
            )}
          </OverleyModalFormulario>

          <ConfirmDeleteModal
            open={openConfirmDelete}
            onClose={() => setOpenConfirmDelete(false)}
            onConfirm={eliminarBandaConfirmada}
            nombreElemento={bandaAEliminar?.nombreBanda ?? "esta banda"}
            titulo="Confirmar eliminación"
          />

          {loading ? (
            <SkeletonTabla />
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {bandasList.map((banda, index) => (
                <CardRowBandas
                  key={banda.idBanda}
                  index={index + 1}
                  banda={banda}
                  abrirInformacion={abrirModalInformacion}
                  abrirEditar={(b) => {
                    setSelectedBanda(b);
                    void abrirModalEditar();
                  }}
                  abrirEliminar={abrirConfirmEliminar}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
