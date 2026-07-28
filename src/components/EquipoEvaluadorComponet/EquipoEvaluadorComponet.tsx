"use client";

import {  useEffect, useState } from "react";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";
import React from "react";
import { PlusIcon } from "@heroicons/react/16/solid";
import {  registroEquipoEvaluadorDatosAmpleosInterface } from "@/models";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { desactivarRefrescarDataRegistroEquipoEvaluador } from "@/features/EquipoEvaluador/RefrescadorEquipoRegistroEvaluador";
import { activarOverleyFormularioAgregarRegistroEquipoEvaluador } from "@/features/EquipoEvaluador/OverleyEquipoEvaluador";
import RegistroEquipoEvaluadorServices from "@/services/registroEquipoEvaluadorServices";
import TablaRegistroEquipoEvaluadorComponent from "../Tablas/tablaRegistroEquipoEvaluador/TablaRegistroEquipoEvaluador";




export default function RegidstroEquipoEvaluadorComponent() {
  const refrescadorDataRegistroEquipoEvaluador = useSelector(
    (state: RootState) => state.refrescadorDataRegistroEquipoEvaluador.RefrescadorDataRegistroEquipoEvaluador
  );
  const [registrosEquipoEvaluador, setRegistrosEquipoEvaliador] = useState<
    registroEquipoEvaluadorDatosAmpleosInterface[]
  >([]);
  

  const [loading, setLoading] = useState(true);

 
  const dispatch = useDispatch();
  const EventoSeleccionado = useSelector(
    (state: RootState) => state.eventos.EventoSeleccionado
  );

  useEffect(() => {

    traerDatosTabla();
  }, []);

  useEffect(() => {
    if (refrescadorDataRegistroEquipoEvaluador) {
      traerDatosTabla();
    
      dispatch(desactivarRefrescarDataRegistroEquipoEvaluador());
    }
  }, [refrescadorDataRegistroEquipoEvaluador]);

  const abrirFormularioAgregar = () => {
    dispatch(activarOverleyFormularioAgregarRegistroEquipoEvaluador());
  };

  async function traerDatosTabla() {
    const registroEquipoEvaluadorServices = new RegistroEquipoEvaluadorServices();
    try {
      const registroEquipoEvaluadorData: registroEquipoEvaluadorDatosAmpleosInterface[] =
        await registroEquipoEvaluadorServices.getDatosAmpleos(EventoSeleccionado.idEvento);

      setRegistrosEquipoEvaliador(registroEquipoEvaluadorData);

      
      setLoading(false);
    } catch (error) {
      console.error("❌ Error al obtener las registro equipo evaluador:", error);
      setLoading(false);
    }
  }





  return (
    <div className="px-20">
      <div>
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold mb-4">Equipo Evaluador</h1>
            <div className="flex gap-4">
              
     
            </div>
          </div>
          <div className="flex justify-between mb-4">
            <button
              className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-300 cursor-pointer flex justify-center items-center gap-2"
              onClick={abrirFormularioAgregar}
            >
              <PlusIcon className="w-5 h-5   rounded-2xl" />
              Agregar
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <SkeletonTabla />
      ) : (
        <TablaRegistroEquipoEvaluadorComponent
            registrosEquipoEvaluador={registrosEquipoEvaluador}
         
        
        />
      )}
    </div>
  );
}
