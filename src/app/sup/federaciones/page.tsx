"use client";

import FederacionesService from "@/lib/services/federacionesServices";
import { useEffect, useState } from "react";
import { federacionInterface } from "@/interfaces/interfaces";
import SkeletonTabla from "@/component/skeleton/SkeletonTabla/Page";
import React from "react";

import OverleyModalFormulario from "@/component/modales/OverleyModalFormulario/Page";
import { PlusIcon } from "@heroicons/react/16/solid";
import FormularioAgregarFederacionComponent from "@/component/formularios/formulariosFederaciones/formularioAgregarFederacionComponent/Page";

const FederacionesHomePage = () => {
  const [federaciones, setFederaciones] = useState<federacionInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFormularioAgregar, setOpenFormularioAgregar] = useState(false);

  const abrirFormularioAgregar = () => {
    setOpenFormularioAgregar(true);
  };
  const cerrarFormularioAgregar = () => {
    setOpenFormularioAgregar(false);
  };

  // Cargar datos al iniciar el componente

  useEffect(() => {
    traerDatosTabla();
  }, []);

  async function traerDatosTabla() {
    const federacionesService = new FederacionesService();
    try {
      const federacionesData: federacionInterface[] = await federacionesService.get();
      setFederaciones(federacionesData);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error al obtener las federaciones:", error);
      setLoading(false);
    }
  }

  return (
    <div className=" w-full">
      <OverleyModalFormulario open={openFormularioAgregar} onClose={cerrarFormularioAgregar}>
        <FormularioAgregarFederacionComponent refresacar={traerDatosTabla} onClose={cerrarFormularioAgregar} />
      </OverleyModalFormulario>
      <div className="flex flex-col justify-start  mb-4">
        <h1 className="text-2xl font-bold mb-4">Federaciones</h1>
        <button
          className="bg-slate-100 px-4 py-2 w-32 rounded-lg text-slate-700 hover:bg-slate-300 cursor-pointer flex justify-center items-center gap-2"
          onClick={abrirFormularioAgregar}
        >
          <PlusIcon className="w-5 h-5   rounded-2xl" />
          Agregar
        </button>
      </div>

      {loading ? <SkeletonTabla /> : (
        <div className="flex flex-col gap-4">
            {
                federaciones.map((federacion) => (
                    <div 
                    key={federacion.idFederacion}
                    className="w-full h-24 bg-slate-700 flex p-4 rounded-lg shadow-md  hover:bg-slate-600 transition-colors duration-300 cursor-pointer"
                    >
                        <p>{federacion.nombreFederacion}</p>
                    </div>
                ))
            }
        </div>
      )}
    </div>
  );
};

export default FederacionesHomePage;
