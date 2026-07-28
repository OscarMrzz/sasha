import { perfilDatosAmpleosInterface } from "@/models";
import PerfilesServices from "@/services/perfilesServices";
import { useEffect, useRef, useState } from "react";

export default function useFotoPerfilHook(perfil: perfilDatosAmpleosInterface) {
     const [urlFotoPerfil, setUrlFotoPerfil] = useState<string>("");
     const [loading, setLoading] = useState<boolean>(false);
     const perfilServices = useRef(new PerfilesServices());
  useEffect(() => {
    traerFotoPerfil();
  }, [perfil?.urlFotoPerfil]);

  
    const traerFotoPerfil = async () => {
      try {
        setLoading(true);
        const urlFotoPerfil = await perfilServices.current.obtenerUrlFotoPerfil(perfil?.urlFotoPerfil || "");
        setUrlFotoPerfil(urlFotoPerfil || "");
        setLoading(false);
      } catch (error) {
        console.error("❌ Error al obtener la URL de la foto de perfil:", error);
        setUrlFotoPerfil("");
      }
    }


     return {
        urlFotoPerfil,
        loading,
     }
}