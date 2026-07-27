
"use client";
import React, { useEffect } from 'react'
import FederacionesServices from "@/lib/services/federacionesServices";
import { federacionInterface } from "@/interfaces/interfaces";

type Props = {
    federacionAEditar:federacionInterface
  refresacar: () => void;
  onClose: () => void;
};



export default function FormularioEditarFederacionComponent  ({refresacar, onClose,federacionAEditar }: Props) {
    const [formData, setFormData] = React.useState({
        nombreFederacion: "",
    });

  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    cargarDatosFormulario();
  }, []);

  const cargarDatosFormulario = () => {
    setFormData({
        nombreFederacion: federacionAEditar.nombreFederacion,
    })
  }


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement >) => 
        {
        const { name, value } = e.target;
      setFormData((prev) => ({...prev,[name]: value, }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
    
     
    
        try {
          const bandasServices = new FederacionesServices();
          const nuevaFederacion: Omit<federacionInterface, "idFederacion" | "created_at"> = {
            nombreFederacion: formData.nombreFederacion,
          
          };
    
          await bandasServices.update(federacionAEditar.idFederacion, nuevaFederacion as federacionInterface);
        
    
          // Limpiar formulario
          setFormData({
            nombreFederacion: "",
          
          });
        } catch (error) {
          console.error("❌ Error al crear la banda:", error);
          alert("Error al editar la federacion");
        } finally {
          setLoading(false);
             refresacar();
        onClose();
        }
      };




  const onClickCancelar=()=>{
      setFormData({
        nombreFederacion: "",
      });
    onClose();
  }
  return (
    < >
    <div className='p-2 lg:px-25 '>


    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-4">Editar Federación</h2>
      <div>
        <label htmlFor="nombreFederacion">Nombre de la Federación</label>
        <input 
          className="border p-2 rounded w-full"
          type="text"
          id="nombreFederacion"
          name="nombreFederacion"
          value={formData.nombreFederacion}
          onChange={handleInputChange}
          required
        />
      </div>
      <button className='bg-gray-200 text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors duration-300 cursor-pointer'
       type="submit" disabled={loading}>
        {loading ? "Cargando..." : "Editar"}
      </button>
    <button onClick={()=>onClickCancelar()} className="w-full bg-gray-400 px-4 py-2 rounded-md cursor-pointer hover:bg-gray-300 hover:text-gray-700">Cancelar</button>
    </form>
        </div>

      
    </>
  )
}


