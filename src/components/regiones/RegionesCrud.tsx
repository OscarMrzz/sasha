"use client";

import RegionService from "@/services/regionesServices";
import { useEffect, useRef, useState } from "react";
import { regionesDatosAmpleosInterface, regionesInterface } from "@/models";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";

import React from "react";

import { PlusIcon } from "@heroicons/react/16/solid";
import OverleyModalFormulario from "@/components/modales/OverleyModalFormulario/Page";
import FormularioAgregarRegionComponent from "@/components/formularios/FormularioRegiones/FormularioAgregarRegion/Page";
import FormularioEditarRegionComponent from "@/components/formularios/FormularioRegiones/FormularioEditarRegion/Page";

import OverleyModal from "@/components/modales/OverleyModal/Page";
import InformacionRegionesComponent from "@/components/informacion/informacionRegionesComponet/Page";
import CardRowRegiones from "@/components/CardRow/CardRowRegiones";
import ConfirmDeleteModal from "@/components/modales/ConfirmDeleteModal/ConfirmDeleteModal";
import ErrorMessage from "@/components/Message/ErrorMessage";
import ApprovateMessage from "@/components/Message/ApprovateMessage";
import BuscadorRow from "@/components/buscadores/BuscadorRow";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAtajoPagina from "@/hooks/useAtajoPagina";

export default function RegionesCrud() {
  const [openFormularioAgregar, setOpenFormularioAgregar] = useState(false);
  const [openFormularioEditar, setOpenFormularioEditar] = useState(false);
  const [openOpciones, setOpenOpciones] = useState(false);
  const [regionSeleccionada, setRegionSeleccionada] = useState<regionesDatosAmpleosInterface | null>(null);
  const [regiones, setRegiones] = useState<regionesDatosAmpleosInterface[]>([]);
  const [regionesOriginales, setRegionesOriginales] = useState<regionesDatosAmpleosInterface[]>([]);

  const [openConfirmEliminar, setOpenConfirmEliminar] = useState(false);
  const [regionParaEliminar, setRegionParaEliminar] = useState<regionesDatosAmpleosInterface | null>(null);

  const [openModalError, setOpenModalError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [openModalExito, setOpenModalExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const [ultimaRegion, setUltimaRegion] = useState<regionesInterface | null>(null);
  const [mostrarAnimacion, setMostrarAnimacion] = useState(false);

  const regionesServices = useRef(new RegionService());
  const queryClient = useQueryClient();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["regiones"],
    queryFn: async () => {
      const svc = regionesServices.current;
      await svc.initPerfil();
      return (await svc.get()) as regionesDatosAmpleosInterface[];
    },
  });

  useEffect(() => {
    if (data !== undefined) {
      setRegionesOriginales(data);
      setRegiones(data);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      console.error("❌ Error al obtener regiones:", error);
    }
  }, [isError, error]);

  useEffect(() => {
    if (!ultimaRegion) return;
    setMostrarAnimacion(true);
    const t = setTimeout(() => setMostrarAnimacion(false), 60 * 1000 * 0.1);
    return () => clearTimeout(t);
  }, [ultimaRegion]);

  const abrirFormularioAgregar = () => {
    setOpenFormularioAgregar(true);
  };

  useAtajoPagina("agregar", abrirFormularioAgregar);

  const cerrarFormularioAgregar = () => {
    setOpenFormularioAgregar(false);
  };

  const abrirFormularioEditar = (region: regionesDatosAmpleosInterface) => {
    setRegionSeleccionada(region);
    setOpenFormularioEditar(true);
  };

  const cerrarFormularioEditar = () => {
    setOpenFormularioEditar(false);
  };

  const abrirInformacion = (region: regionesDatosAmpleosInterface) => {
    setRegionSeleccionada(region);
    setOpenOpciones(true);
  };

  const cerrarInformacion = () => {
    setOpenOpciones(false);
  };

  const abrirEliminar = (region: regionesDatosAmpleosInterface) => {
    setRegionParaEliminar(region);
    setOpenConfirmEliminar(true);
  };

  const cerrarConfirmEliminar = () => {
    setOpenConfirmEliminar(false);
    setRegionParaEliminar(null);
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

  const refrescar = async () => {
    await queryClient.invalidateQueries({ queryKey: ["regiones"] });
  };

  const ejecutarEliminarRegion = async () => {
    if (!regionParaEliminar) return;
    try {
      await regionesServices.current.delete(regionParaEliminar.idRegion);
      abrirModalExito("Región eliminada");
      await refrescar();
    } catch (e) {
      console.error("❌ Error al eliminar la región:", e);
      abrirModalError("Error al eliminar la región");
    } finally {
      cerrarConfirmEliminar();
    }
  };

  const filtrarBuscador = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const texto = evento.target.value.toLowerCase();
    if (!texto) {
      setRegiones(regionesOriginales || []);
      return;
    }

    const filtradas = (regionesOriginales || []).filter((r) =>
      (r.nombreRegion || "").toLowerCase().includes(texto)
    );
    setRegiones(filtradas);
  };

  return (
    <div className="">
      <section id="modales-ocultos">
        <ConfirmDeleteModal
          open={openConfirmEliminar}
          onClose={cerrarConfirmEliminar}
          onConfirm={ejecutarEliminarRegion}
          nombreElemento={regionParaEliminar?.nombreRegion ?? ""}
          titulo="Confirmar eliminación"
        />
        <ErrorMessage titulo="Error" open={openModalError} onClose={cerrarModalError} texto={mensajeError} />
        <ApprovateMessage titulo="Éxito" open={openModalExito} onClose={cerrarModalExito} texto={mensajeExito} />
      </section>

      <OverleyModalFormulario open={openFormularioAgregar} onClose={cerrarFormularioAgregar}>
        <FormularioAgregarRegionComponent
          onClose={cerrarFormularioAgregar}
          openErrorModal={abrirModalError}
          openModalExito={abrirModalExito}
          onCreated={(regionCreada) => {
            setUltimaRegion(regionCreada);
          }}
          refresacar={async () => {
            await refrescar();
          }}
        />
      </OverleyModalFormulario>

      <OverleyModalFormulario open={openFormularioEditar} onClose={cerrarFormularioEditar}>
        {regionSeleccionada && (
          <FormularioEditarRegionComponent
            onClose={cerrarFormularioEditar}
            refresacar={refrescar}
            openErrorModal={abrirModalError}
            openModalExito={abrirModalExito}
            regionAEditar={regionSeleccionada}
          />
        )}
      </OverleyModalFormulario>

      <OverleyModal open={openOpciones} onClose={cerrarInformacion}>
        {regionSeleccionada && (
          <InformacionRegionesComponent
            region={regionSeleccionada}
            onClose={cerrarInformacion}
            onRefresh={refrescar}
            openFormEditar={() => abrirFormularioEditar(regionSeleccionada)}
            onEliminar={abrirEliminar}
          />
        )}
      </OverleyModal>

      <section className="flex w-full flex-col gap-4 mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Regiones</h1>
          <span className="text-sm text-slate-400">{regiones.length}</span>
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

      {isPending ? (
        <SkeletonTabla />
      ) : (
        <div className="flex flex-col gap-4 w-full">
          {regiones.map((region, index) => (
            <CardRowRegiones
              key={region.idRegion}
              index={index + 1}
              region={region}
              abrirInformacion={abrirInformacion}
              abrirEditar={abrirFormularioEditar}
              abrirEliminar={abrirEliminar}
              ultimaRegion={ultimaRegion}
              mostrarAnimacion={mostrarAnimacion}
            />
          ))}
        </div>
      )}
    </div>
  );
}
