"use client";

import React, { useState, useEffect } from "react";
import PerfilesServices from "@/lib/services/perfilesServices";
import { criterioEvaluacionDatosAmpleosInterface, criterioEvaluacionInterface, perfilDatosAmpleosInterface } from "@/interfaces/interfaces";
import CriteriosServices from "@/lib/services/criteriosServices";
import { useDispatch } from "react-redux";
import { desactivarOverleyFormularioEditarCriterio } from "@/feacture/overleys/overleySlice";
import { setCriterioSeleccionado } from "@/feacture/Criterios/CriteriosSlice";
import { activarRefrescarDataCriterios } from "@/feacture/RefrescadorData/refrescadorDataSlice";
import { activarRefrescarDataRubricas } from "@/feacture/RefrescadorData/refrescadorDataSlice";

const inputBaseClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition focus:border-primario/80 focus:bg-white/[0.07] focus:ring-2 focus:ring-primario/35";

const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wide text-white/70";

type Props = {
    criterioAEditar: criterioEvaluacionDatosAmpleosInterface;
  refresacar: () => void;
  onClose?: () => void;
};



export default  function FormularioEditarCriterioComponet  ({criterioAEditar, refresacar, onClose }: Props)  {

  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
  nombreCriterio: "",
      detallesCriterio: "",
      puntosCriterio: 0,
    idForaneaRubrica: "",
   
  });
   const [loading, setLoading] = useState(false);
  const [perfil, setPerfil] = useState<perfilDatosAmpleosInterface>({} as perfilDatosAmpleosInterface);

 
  useEffect(()=>{
    const perfilesServices = new PerfilesServices()
  perfilesServices.getUsuarioLogiado().then((perfil) => {
    if (perfil) {
      setPerfil(perfil);
    }
  });
}, []);
   


 
 

  useEffect(()=>{
    const perfilesServices = new PerfilesServices()
  perfilesServices.getUsuarioLogiado().then((perfil) => {
    if (perfil) {
      setPerfil(perfil);
    }
  });
}, []);

 useEffect(()=>{
    if(criterioAEditar){
        cargarDatosFormulario();
    }
 }, []);


 const cargarDatosFormulario =() =>{
    setFormData({
        nombreCriterio: criterioAEditar.nombreCriterio,
        detallesCriterio: criterioAEditar.detallesCriterio,
        puntosCriterio: criterioAEditar.puntosCriterio,
        idForaneaRubrica: criterioAEditar.idForaneaRubrica,
    });
 };



  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

  

    try {
      const criterioServices = new CriteriosServices();
      const nuevoCriterio: Omit<criterioEvaluacionInterface, "idCriterio" | "created_at"> = {
          nombreCriterio: formData.nombreCriterio,
          detallesCriterio: formData.detallesCriterio,
          puntosCriterio: formData.puntosCriterio,
          idForaneaRubrica: formData.idForaneaRubrica,
         
      };

      await criterioServices.update(criterioAEditar.idCriterio, nuevoCriterio as criterioEvaluacionInterface);

      dispatch(
        setCriterioSeleccionado({
          ...criterioAEditar,
          nombreCriterio: formData.nombreCriterio,
          detallesCriterio: formData.detallesCriterio,
          puntosCriterio: Number(formData.puntosCriterio),
        })
      );

      // Limpiar formulario
      setFormData({
        nombreCriterio: "",
        detallesCriterio: "",
        puntosCriterio: 0,
        idForaneaRubrica: "",
      });
    } catch (error) {
      console.error("❌ Error al crear la Categoria:", error);
      alert("Error al editar la Categoria");
    } finally {
      setLoading(false);
      dispatch(activarRefrescarDataCriterios());
      dispatch(activarRefrescarDataRubricas());
      refresacar?.();
      dispatch(desactivarOverleyFormularioEditarCriterio());
    }
  };
  const onClickCancelar=()=>{
      setFormData({
        nombreCriterio: "",
        detallesCriterio: "",
        puntosCriterio: 0,
        idForaneaRubrica: "",
      });
    dispatch(desactivarOverleyFormularioEditarCriterio());
  }

  return (
    <div className="p-2 lg:px-8">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primario">Editar criterio</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Actualizar criterio</h2>
          <p className="mt-2 text-sm text-white/55">Modifica los datos del criterio y guarda cambios.</p>
        </header>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit} aria-label="formulario para editar criterio">
            <div>
              <label className={labelClass} htmlFor="nombreCriterio">
                Nombre <span className="text-primario">*</span>
              </label>
              <input
                type="text"
                id="nombreCriterio"
                name="nombreCriterio"
                value={formData.nombreCriterio}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Ej. Afinación"
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="detallesCriterio">
                Detalles <span className="text-primario">*</span>
              </label>
              <input
                type="text"
                id="detallesCriterio"
                name="detallesCriterio"
                value={formData.detallesCriterio}
                onChange={handleInputChange}
                className={inputBaseClass}
                placeholder="Describe el criterio"
                required
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="puntosCriterio">
                Puntos (%) <span className="text-primario">*</span>
              </label>
              <input
                type="number"
                id="puntosCriterio"
                name="puntosCriterio"
                value={formData.puntosCriterio}
                onChange={handleInputChange}
                className={inputBaseClass}
                min={-100}
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onClickCancelar}
                className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-primario px-6 py-3 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-white/25 disabled:text-white/50 disabled:shadow-none"
              >
                {loading ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


