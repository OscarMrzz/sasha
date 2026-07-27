import { agregarCriterioEvaluar } from "@/feacture/evaluar/evaluarSlice";

import {
  criterioEvaluacionDatosAmpleosInterface,
  cumplimientosDatosAmpleosInterface,
} from "@/interfaces/interfaces";
import cumplimientossServices from "@/lib/services/cumplimientosServices";
import type { EvaluarDraftItem } from "@/lib/evaluarPersistence";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";

type Props = {
  criterioSelecionado: criterioEvaluacionDatosAmpleosInterface;
  criterioNoEvaluado: string
  onSeleccionarCumplimiento: (item: EvaluarDraftItem) => void;
};

export default function EvaluarCriterioComponent({
  criterioSelecionado,
  criterioNoEvaluado,
  onSeleccionarCumplimiento,
}: Props) {



  const dispatch = useDispatch();
  const criterioEvaluado = useSelector(
    (state: RootState) => state.evaluarCriterio.evaluaciones[criterioSelecionado.idCriterio]
  );



  const [listCumplimientoOriginales, setListCumplimientoOriginales] =
    React.useState<cumplimientosDatosAmpleosInterface[]>([]);
  const [listCumplimiento, setListCumplimiento] = React.useState<
    cumplimientosDatosAmpleosInterface[]
  >([]);
  const [cumplimientoSelecionado, setCumplimientoSelecionado] =
    React.useState<cumplimientosDatosAmpleosInterface | null>(null);

  const [cargandoCumplimientos, setCargandoCumplimientos] =
    React.useState<boolean>(true);

  useEffect(() => {
    const fetchCumplimientos = async () => {
      setCargandoCumplimientos(true);
      try {
        const cumplimientoServices = new cumplimientossServices();
        const datosCumplimientos = await cumplimientoServices.getByIdCriterio(criterioSelecionado.idCriterio);
        setListCumplimientoOriginales(datosCumplimientos);
        setListCumplimiento(datosCumplimientos);
      } catch (error) {
        console.error("Error fetching cumplimientos:", error);
      } finally {
        setCargandoCumplimientos(false);
      }
    };
    fetchCumplimientos();
  }, []);

  useEffect(() => {
    if (!criterioEvaluado?.idCumplimiento) {
      setCumplimientoSelecionado(null);
      return;
    }

    const cumplimientoGuardado = listCumplimiento.find(
      (cumplimiento) => cumplimiento.idCumplimiento === criterioEvaluado.idCumplimiento
    );

    if (cumplimientoGuardado) {
      setCumplimientoSelecionado(cumplimientoGuardado);
    }
  }, [criterioEvaluado?.idCumplimiento, listCumplimiento]);

 

 const  onclickCumplimientoSelecionado= (cumplimiento: cumplimientosDatosAmpleosInterface) =>{
    const evaluacion = {
      idCriterio: criterioSelecionado.idCriterio,
      idCumplimiento: cumplimiento.idCumplimiento,
      valor: cumplimiento.puntosCumplimiento,
    };

    setCumplimientoSelecionado(cumplimiento);
    dispatch(agregarCriterioEvaluar(evaluacion));
    onSeleccionarCumplimiento(evaluacion);
  }

  return (
    <div 
    className={` min-h-120     
      ${criterioSelecionado.idCriterio === criterioNoEvaluado? " border-4 border-red-500" : "border-2 border-transparent"}
    `}>
      <div className="p-2">
        <h3 className="text-2xl font-bold">
          {criterioSelecionado.nombreCriterio}
        </h3>
        <details>
          <summary className="text-slate-500">Detalles</summary>
          <p className="text-slate-300">{criterioSelecionado.detallesCriterio}</p>
        </details>
     
     
      </div>
      {cargandoCumplimientos ? (
        <div className="w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-slate-500  w-3/4"></div>
            <div className="h-10 bg-slate-500  w-5/6"></div>
            <div className="h-10 bg-slate-500  w-2/3"></div>
          </div>
        </div>
      ) : (
        <section className="flex flex-col gap-4">
          {listCumplimiento.map((cumplimiento,index) => (
            <label
              key={cumplimiento.idCumplimiento}
              style={{animationDelay: `${index * 120}ms`}}
              className={`animate-zoom-in flex flex-row cursor-pointer border-2 border-transparent p-2 rounded-lg shadow transition-colors
        ${
          cumplimientoSelecionado?.idCumplimiento ===
          cumplimiento.idCumplimiento
            ? "evaluar-cumplimiento-neon-selected"
            : "bg-slate-700 hover:bg-slate-600"
        }`}
            >
              <input
                type="radio"
                name={`cum-${criterioSelecionado.idCriterio}`}
                value={cumplimiento.idCumplimiento}
                checked={criterioEvaluado?.idCumplimiento === cumplimiento.idCumplimiento}
                onChange={() => onclickCumplimientoSelecionado(cumplimiento)}
                className="hidden"
              />
              <div className="flex  min-h-16 flex-row gap-4 ml-4">
                <span className="text-2xl font-bold flex justify-end items-center pr-4 border-r-2 border-slate-400  w-14 max-w-14 min-w-14">{cumplimiento.puntosCumplimiento}</span>
         
                <span>{cumplimiento.detalleCumplimiento}</span>
              </div>
            </label>
          ))}
        </section>
      )}
    </div>
  );
}
