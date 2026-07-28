"use client";

import { useEffect, useRef, useState } from "react";
import { categoriaInterface } from "@/models";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";
import React from "react";

import OverleyModalFormulario from "@/components/modales/OverleyModalFormulario/Page";
import FormularioAgregarCategoriaComponent from "@/components/formularios/FormulariosCategorias/FormularioAgregarCategoriaComponet/Page";
import { PlusIcon } from "@heroicons/react/16/solid";
import OverleyModal from "@/components/modales/OverleyModal/Page";
import InformacionCategoriaComponent from "@/components/informacion/informacionCategoriasComponet/Page";
import FormularioEditarCategoriaComponent from "@/components/formularios/FormulariosCategorias/FormularioEditarCategoriaComponet/Page";
import ConfirmDeleteModal from "@/components/modales/ConfirmDeleteModal/ConfirmDeleteModal";
import ErrorMessage from "@/components/Message/ErrorMessage";
import ApprovateMessage from "@/components/Message/ApprovateMessage";
import BuscadorRow from "@/components/buscadores/BuscadorRow";
import CardRowCategorias from "@/components/CardRow/CardRowCategorias";
import CategoriasServices from "@/services/categoriaServices";
import useAtajoPagina from "@/hooks/useAtajoPagina";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function CategoriasCrud() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<categoriaInterface>();
  const [openInfo, setOpenInfo] = useState(false);
  const [openFormEditar, setOpenFormEditar] = useState(false);
  const [openFormularioAgregar, setOpenFormularioAgregar] = useState(false);
  const [categorias, setCategorias] = useState<categoriaInterface[]>([]);
  const [categoriasOriginales, setCategoriasOriginales] = useState<categoriaInterface[]>([]);

  const [openConfirmEliminar, setOpenConfirmEliminar] = useState(false);
  const [categoriaParaEliminar, setCategoriaParaEliminar] = useState<categoriaInterface | null>(null);

  const [openModalError, setOpenModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [openModalExito, setOpenModalExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const abrirFormularioAgregar = () => {
    setOpenFormularioAgregar(true);
  };

  useAtajoPagina("agregar", abrirFormularioAgregar);

  const cerrarFormularioAgregar = () => {
    setOpenFormularioAgregar(false);
  };

  const categoriasServices = useRef(new CategoriasServices());
  const queryClient = useQueryClient();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["categorias"],
    queryFn: async () => {
      const svc = categoriasServices.current;
      await svc.initPerfil();
      return (await svc.get()) as categoriaInterface[];
    },
  });

  useEffect(() => {
    if (data !== undefined) {
      setCategoriasOriginales(data);
      setCategorias(data);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      console.error("❌ Error al obtener categorías:", error);
    }
  }, [isError, error]);

  const refrescar = async () => {
    await queryClient.invalidateQueries({ queryKey: ["categorias"] });
  };

  const abrirInformacion = (categoria: categoriaInterface) => {
    setCategoriaSeleccionada(categoria);
    setOpenInfo(true);
  };

  const cerrarInformacion = () => {
    setOpenInfo(false);
  };

  const abrirEditar = (categoria: categoriaInterface) => {
    setCategoriaSeleccionada(categoria);
    setOpenFormEditar(true);
  };

  const cerrarEditar = () => {
    setOpenFormEditar(false);
  };

  const abrirEliminar = (categoria: categoriaInterface) => {
    setCategoriaParaEliminar(categoria);
    setOpenConfirmEliminar(true);
  };

  const cerrarConfirmEliminar = () => {
    setOpenConfirmEliminar(false);
    setCategoriaParaEliminar(null);
  };

  const abrirModalError = (mensaje: string) => {
    setOpenModalError(true);
    setMensajeError(mensaje);
  };

  const cerrarModalError = () => {
    setOpenModalError(false);
    setMensajeError("");
  };

  const abrirModalExito = (mensaje: string) => {
    setOpenModalExito(true);
    setMensajeExito(mensaje);
  };

  const cerrarModalExito = () => {
    setOpenModalExito(false);
    setMensajeExito("");
  };

  const ejecutarEliminarCategoria = async () => {
    if (!categoriaParaEliminar) return;
    try {
      await categoriasServices.current.initPerfil();
      await categoriasServices.current.delete(categoriaParaEliminar.idCategoria);
      abrirModalExito("Categoría eliminada");
      await refrescar();
    } catch (e) {
      console.error("❌ Error al eliminar la categoría:", e);
      abrirModalError("Error al eliminar la categoría");
    } finally {
      cerrarConfirmEliminar();
    }
  };

  const filtrarBuscador = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const texto = evento.target.value.toLowerCase();
    if (!texto) {
      setCategorias(categoriasOriginales || []);
      return;
    }

    const filtradas = (categoriasOriginales || []).filter((c) =>
      (c.nombreCategoria || "").toLowerCase().includes(texto)
    );
    setCategorias(filtradas);
  };

  return (
    <div className="">
      <section id="modales-ocultos">
        <ConfirmDeleteModal
          open={openConfirmEliminar}
          onClose={cerrarConfirmEliminar}
          onConfirm={ejecutarEliminarCategoria}
          nombreElemento={categoriaParaEliminar?.nombreCategoria ?? ""}
          titulo="Confirmar eliminación"
        />
        <ErrorMessage titulo="Error" open={openModalError} onClose={cerrarModalError} texto={mensajeError} />
        <ApprovateMessage titulo="Éxito" open={openModalExito} onClose={cerrarModalExito} texto={mensajeExito} />
      </section>

      <OverleyModalFormulario open={openFormularioAgregar} onClose={cerrarFormularioAgregar}>
        <FormularioAgregarCategoriaComponent
          refresacar={refrescar}
          onClose={cerrarFormularioAgregar}
          openErrorModal={abrirModalError}
          openModalExito={abrirModalExito}
        />
      </OverleyModalFormulario>

      <OverleyModalFormulario open={openFormEditar} onClose={cerrarEditar}>
        {categoriaSeleccionada && (
          <FormularioEditarCategoriaComponent
            CategoriaAEditar={categoriaSeleccionada}
            onClose={cerrarEditar}
            refresacar={refrescar}
            openErrorModal={abrirModalError}
            openModalExito={abrirModalExito}
          />
        )}
      </OverleyModalFormulario>

      <OverleyModal open={openInfo} onClose={cerrarInformacion}>
        {categoriaSeleccionada && (
          <InformacionCategoriaComponent
            categoria={categoriaSeleccionada}
            onClose={cerrarInformacion}
            onRefresh={refrescar}
            openFormEditar={() => abrirEditar(categoriaSeleccionada)}
          />
        )}
      </OverleyModal>

      <div>
        <section className="flex w-full flex-col gap-4 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Categorías</h1>
            <span className="text-sm text-slate-400">{categorias.length}</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <BuscadorRow filtrarBuscador={filtrarBuscador} />
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
        </section>
      </div>

      {isPending ? (
        <SkeletonTabla />
      ) : (
        <div className="flex flex-col gap-4 w-full">
          {categorias.map((categoria, index) => (
            <CardRowCategorias
              key={categoria.idCategoria}
              index={index + 1}
              categoria={categoria}
              abrirInformacion={abrirInformacion}
              abrirEditar={abrirEditar}
              abrirEliminar={abrirEliminar}
            />
          ))}
        </div>
      )}
    </div>
  );
}
