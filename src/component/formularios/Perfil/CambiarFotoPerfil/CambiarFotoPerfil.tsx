'use client'

import FotoPerfilImage from '@/component/FotoPerfil/FotoPerfilImage';
import PerfilesServices from '@/lib/services/perfilesServices';
import React, { useRef, useState } from 'react'

 type props = {
    onClose: () => void;
    urlFotoPerfilActual: string;
    idMiPerfil: string;
   
 }

function CambiarFotoPerfil({onClose, urlFotoPerfilActual, idMiPerfil}: props) {

       const [previewUrl, setPreviewUrl] = useState<string>(urlFotoPerfilActual);
       const [selectedFile, setSelectedFile] = useState<File | null>(null);
       const [errorMensaje, setErrorMensaje] = useState<string>("");
       const [guardando, setGuardando] = useState(false);

       const perfilesServices = useRef(new PerfilesServices())

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMensaje("");
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (!selectedFile) return;

    setGuardando(true);
    setErrorMensaje("");
    let urlFotoPerfilParaDB = "";

    try {
      const resultadoFotoPerfil = await perfilesServices.current.subirFotoPerfil(
        selectedFile,
        `${idMiPerfil.replace(/\s+/g, "_")}_foto_perfil`
      );
      if (resultadoFotoPerfil) {
        urlFotoPerfilParaDB = resultadoFotoPerfil;
      } else {
        setErrorMensaje("No se pudo subir la foto de perfil. Intenta de nuevo.");
        setGuardando(false);
        return;
      }
    } catch (error) {
      console.error("❌ Error subiendo la foto de perfil:", error);
      setErrorMensaje("Error al subir la foto. Verifica tu conexión e intenta de nuevo.");
      setGuardando(false);
      return;
    }

    try {
      const foto = await perfilesServices.current.cambiarURLFotoPerfil(idMiPerfil, urlFotoPerfilParaDB);
      if (!foto) {
        setErrorMensaje("La foto se subió pero no se pudo actualizar el perfil.");
        setGuardando(false);
        return;
      }
    } catch (error) {
      console.error("❌ Error actualizando la URL de la foto de perfil:", error);
      setErrorMensaje("Error al guardar la foto en tu perfil. Intenta de nuevo.");
      setGuardando(false);
      return;
    }

    setGuardando(false);
    onClose();
  };

  return (
    <div className='flex  flex-col w-full h-full p-8  items-center '> 
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6   items-center">

       <div className="flex flex-col">
               <label className="relative w-60 h-60 rounded-full bg-gray-300 cursor-pointer hover:bg-gray-400 transition-colors overflow-hidden ">
                 <input
                   type="file"
                   id="urlFotoPerfil"
                   name="urlFotoPerfil"
                   onChange={handleFileChange}
                   className="hidden"
                   accept="image/*"
                 />
                 <FotoPerfilImage
                   src={previewUrl}
                   alt="Foto de perfil"
                   fill
                   className="object-cover"
                   fallbackIconClassName="w-20 h-20"
                 />
               </label>
             </div>
        {errorMensaje ? (
          <p className="text-sm text-red-400 text-center max-w-xs" role="alert">{errorMensaje}</p>
        ) : null}
        <div className="w-full flex flex-col   gap-2 items-center">
       <button
         type='submit'
         disabled={!selectedFile || guardando}
         className='w-60 bg-blue-600 text-white px-4 py-2 hover:bg-blue-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
       >
         {guardando ? "Guardando…" : "Aceptar"}
       </button>
       <button type="button" onClick={onClose} className='w-60 border-2 px-4 py-2'>Cancelar</button>
        </div>
                 </form>
      
    </div>
  )
}

export default CambiarFotoPerfil
