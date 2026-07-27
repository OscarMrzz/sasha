"use client";

import { useEffect, useState } from "react";
import SkeletonTabla from "@/component/skeleton/SkeletonTabla/Page";
import React from "react";

import { PlusIcon } from "@heroicons/react/16/solid";
import { cumplimientosDatosAmpleosInterface } from "@/interfaces/interfaces";

import { useDispatch, useSelector } from "react-redux";
import {
  activarOverleyCumplimientoFormularioAgregar,
  activarOverleyFormularioEditarCumplimiento,
  activarOverleyInformacionCumplimiento,
} from "@/feacture/overleys/overleySlice";
import { RootState } from "@/app/store";

import { desactivarRefrescarDataCumplimiento } from "@/feacture/RefrescadorData/refrescadorDataSlice";
import cumplimientossServices from "@/lib/services/cumplimientosServices";

import TablaCumplimientosComponent from "../Tablas/TablaCumplimientosComponent/TablaCumplimientosComponent";
import { setCumplimientoSeleccionado } from "@/feacture/cumplimientos/cumplimientosSlice";
import ConfirmDeleteModal from "@/component/modales/ConfirmDeleteModal/ConfirmDeleteModal";

export default function CumplimientosComponent() {
  const refrescadorDataCumplimientos = useSelector(
    (state: RootState) => state.refrescadorData.RefrescadorDataCumplimiento
  );
  const [openConfirmEliminar, setOpenConfirmEliminar] = useState(false);
  const [cumplimientoParaEliminar, setCumplimientoParaEliminar] =
    useState<cumplimientosDatosAmpleosInterface | null>(null);
  const [cumpimientos, setCumplimientos] = useState<
    cumplimientosDatosAmpleosInterface[]
  >([]);
  
  const [CumplimientosOriginales, setCumplimientosOriginales] = useState<
    cumplimientosDatosAmpleosInterface[]
  >([]);
  const [loading, setLoading] = useState(true);

  const [idCriterioSeleccionado, setIdCriterioSeleccionado] =
    useState<string>("");
  const dispatch = useDispatch();
  const criterioSeleccionado = useSelector(
    (state: RootState) => state.criterio.CriterioSeleccionado
  );

  useEffect(() => {
    setIdCriterioSeleccionado(criterioSeleccionado.idCriterio);
    traerDatosTabla();
  }, []);

  useEffect(() => {
    if (refrescadorDataCumplimientos) {
      traerDatosTabla();
    
      dispatch(desactivarRefrescarDataCumplimiento());
    }
  }, [refrescadorDataCumplimientos]);

  const abrirFormularioAgregar = () => {
    dispatch(activarOverleyCumplimientoFormularioAgregar());
  };

  const etiquetaCumplimiento = (c: cumplimientosDatosAmpleosInterface) =>
    c.detalleCumplimiento?.trim() || `Cumplimiento ${c.puntosCumplimiento ?? 0} pts`;

  const onVerCumplimiento = (c: cumplimientosDatosAmpleosInterface) => {
    dispatch(setCumplimientoSeleccionado(c));
    dispatch(activarOverleyInformacionCumplimiento());
  };

  const onEditarCumplimiento = (c: cumplimientosDatosAmpleosInterface) => {
    dispatch(setCumplimientoSeleccionado(c));
    dispatch(activarOverleyFormularioEditarCumplimiento());
  };

  const onEliminarCumplimiento = (c: cumplimientosDatosAmpleosInterface) => {
    setCumplimientoParaEliminar(c);
    setOpenConfirmEliminar(true);
  };

  const cerrarConfirmEliminar = () => {
    setOpenConfirmEliminar(false);
    setCumplimientoParaEliminar(null);
  };

  const ejecutarEliminarCumplimiento = async () => {
    if (!cumplimientoParaEliminar) return;
    try {
      const cumplimientosServices = new cumplimientossServices();
      await cumplimientosServices.initPerfil();
      await cumplimientosServices.delete(cumplimientoParaEliminar.idCumplimiento);
      await traerDatosTabla();
    } catch (e) {
      console.error("❌ Error al eliminar el cumplimiento:", e);
    } finally {
      cerrarConfirmEliminar();
    }
  };

  async function traerDatosTabla() {
    const cumplimientosServices = new cumplimientossServices();
    try {
      const CumplimientosData: cumplimientosDatosAmpleosInterface[] =
        await cumplimientosServices.getByIdCriterio(criterioSeleccionado.idCriterio);

      setCumplimientos(CumplimientosData);
      setCumplimientosOriginales(CumplimientosData);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error al obtener las cumplimiento:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarTablaFiltrada();
  }, []);

  const cargarTablaFiltrada = () => {
    let datosFiltrados = [...CumplimientosOriginales];

    if (idCriterioSeleccionado) {
      datosFiltrados = datosFiltrados.filter(
        (item) => item.idForaneaCriterio === idCriterioSeleccionado
      );
    }

    setCumplimientos(datosFiltrados);
  };



  return (
    <div className="w-full">
      <ConfirmDeleteModal
        open={openConfirmEliminar}
        onClose={cerrarConfirmEliminar}
        onConfirm={ejecutarEliminarCumplimiento}
        nombreElemento={cumplimientoParaEliminar ? etiquetaCumplimiento(cumplimientoParaEliminar) : ""}
        titulo="Confirmar eliminación"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/75">
            Cantidad: {cumpimientos.length}
          </div>
        </div>

        <button
          type="button"
          className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-300 cursor-pointer flex justify-center items-center gap-2"
          onClick={abrirFormularioAgregar}
        >
          <PlusIcon className="w-5 h-5 rounded-2xl" />
          Agregar
        </button>
      </div>
      {loading ? (
        <SkeletonTabla />
      ) : (
        <div className="mt-4">
          <TablaCumplimientosComponent
            cumpimientos={cumpimientos}
            onRefresh={traerDatosTabla}
            onVerCumplimiento={onVerCumplimiento}
            onEditarCumplimiento={onEditarCumplimiento}
            onEliminarCumplimiento={onEliminarCumplimiento}
          />
        </div>
      )}
    </div>
  );
}
