"use client";

import { useEffect, useState } from "react";
import SkeletonTabla from "@/component/skeleton/SkeletonTabla/Page";
import React from "react";

import { PlusIcon } from "@heroicons/react/16/solid";
import { criterioEvaluacionDatosAmpleosInterface } from "@/interfaces/interfaces";

import TablaCriteriosComponent from "../Tablas/TablaCriteriosComponet/TablaCriteriosComponet";
import { useDispatch, useSelector } from "react-redux";
import {
  activarOverleyCriteriosFormularioAgregar,
  activarOverleyFormularioEditarCriterio,
  activarOverleyInformacionCriterio,
} from "@/feacture/overleys/overleySlice";
import { RootState } from "@/app/store";
import CriteriosServices from "@/lib/services/criteriosServices";
import { desactivarRefrescarDataCriterios } from "@/feacture/RefrescadorData/refrescadorDataSlice";
import { setCriterioSeleccionado } from "@/feacture/Criterios/CriteriosSlice";
import ConfirmDeleteModal from "@/component/modales/ConfirmDeleteModal/ConfirmDeleteModal";
import { activarRefrescarDataRubricas } from "@/feacture/RefrescadorData/refrescadorDataSlice";



export default function CriteriosComponent() {
  const refrescadorDataCriterios = useSelector(
    (state: RootState) => state.refrescadorData.RefrescadorDataCriterios
  );
  const [openConfirmEliminar, setOpenConfirmEliminar] = useState(false);
  const [criterioParaEliminar, setCriterioParaEliminar] =
    useState<criterioEvaluacionDatosAmpleosInterface | null>(null);
  const [criterios, setCriterios] = useState<criterioEvaluacionDatosAmpleosInterface[]>([]);
  const [sumaCriterios, setSumaCriterios] = useState<number>(0);
  const [criteriosOriginales, setCriterioscasOriginales] =  useState<criterioEvaluacionDatosAmpleosInterface[]>([]);
  const [loading, setLoading] = useState(true);

 
 
  const  [idrubricaSeleccionada, setIdRubricaSeleccionada] = useState<string>("");
  const dispatch = useDispatch();
  const rubricaSeleccionada = useSelector(
    (state: RootState) => state.rubrica.RubricaSeleccionada
  );
 
   useEffect(() => {
    setIdRubricaSeleccionada(rubricaSeleccionada.idRubrica);
    traerDatosTabla();
  }, []);

  useEffect(() => {
    if (refrescadorDataCriterios) {
      traerDatosTabla();
        sumarCriterios();
      dispatch(desactivarRefrescarDataCriterios());
    }
  }, [refrescadorDataCriterios]);

  useEffect(() => {
    sumarCriterios();
  }, [criterios]);



  const abrirFormularioAgregar = () => {
    dispatch(activarOverleyCriteriosFormularioAgregar());
  };

  const onVerCriterio = (c: criterioEvaluacionDatosAmpleosInterface) => {
    dispatch(setCriterioSeleccionado(c));
    dispatch(activarOverleyInformacionCriterio());
  };

  const onEditarCriterio = (c: criterioEvaluacionDatosAmpleosInterface) => {
    dispatch(setCriterioSeleccionado(c));
    dispatch(activarOverleyFormularioEditarCriterio());
  };

  const onEliminarCriterio = (c: criterioEvaluacionDatosAmpleosInterface) => {
    setCriterioParaEliminar(c);
    setOpenConfirmEliminar(true);
  };

  const cerrarConfirmEliminar = () => {
    setOpenConfirmEliminar(false);
    setCriterioParaEliminar(null);
  };

  const ejecutarEliminarCriterio = async () => {
    if (!criterioParaEliminar) return;
    try {
      const criteriosServices = new CriteriosServices();
      await criteriosServices.initPerfil();
      await criteriosServices.delete(criterioParaEliminar.idCriterio);
      await traerDatosTabla();
      dispatch(activarRefrescarDataRubricas());
    } catch (e) {
      console.error("❌ Error al eliminar el criterio:", e);
    } finally {
      cerrarConfirmEliminar();
    }
  };

 

  async function traerDatosTabla() {
    const criteriosServices = new CriteriosServices();
    try {
      const criteriosData: criterioEvaluacionDatosAmpleosInterface[] = await criteriosServices.getDatosAmpleos();

 
      const criteriosFiltrados = criteriosData.filter(
        (criterio) => criterio.idForaneaRubrica === rubricaSeleccionada.idRubrica
      );
      setCriterios(criteriosFiltrados);
  
      setCriterioscasOriginales(criteriosData);
      setLoading(false);
  
    } catch (error) {
      console.error("❌ Error al obtener las Criterio:", error);
      setLoading(false);
    } 
  }


  useEffect(() => {

     cargarTablaFiltrada();
  }, []);


 



  const cargarTablaFiltrada = () => {
    let datosFiltrados = [...criteriosOriginales];

    if (idrubricaSeleccionada) {
      datosFiltrados = datosFiltrados.filter(
        (item) => item.idForaneaRubrica === idrubricaSeleccionada
      );
    }

    setCriterios(datosFiltrados);
  };

  const sumarCriterios = () => {
  const suma = criterios.reduce((total, criterio) => total + criterio.puntosCriterio, 0);
  setSumaCriterios(suma);
  };

 



  return (
    <div className="w-full">
      <ConfirmDeleteModal
        open={openConfirmEliminar}
        onClose={cerrarConfirmEliminar}
        onConfirm={ejecutarEliminarCriterio}
        nombreElemento={criterioParaEliminar?.nombreCriterio ?? ""}
        titulo="Confirmar eliminación"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/75">
            Cantidad: {criterios.length}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-white/75">
            Suma: {sumaCriterios}%
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
          <TablaCriteriosComponent
            Criterios={criterios}
            onRefresh={traerDatosTabla}
            onVerCriterio={onVerCriterio}
            onEditarCriterio={onEditarCriterio}
            onEliminarCriterio={onEliminarCriterio}
          />
        </div>
      )}
    </div>
  );
}
