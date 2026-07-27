"use client";

import { perfilDatosAmpleosInterface } from "@/interfaces/interfaces";
import { useInicioSesionStore } from "@/Store/PerfilStore/InicioSesionStore";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import UserDropdown from "../userDropdown/UserDropdown";
import useFotoPerfilHook from "@/hooks/useFotoPerfil/useFotoPerfilHook";
import SidebarMovil from "../sidebar/sidebarMovil.tsx/SidebarMovil";
import { cerrarSesionYLimpiar } from "@/lib/utils/sesion";

const NavBard = () => {
  const [haySesionIniciada, setHaySesionIniciada] = useState<boolean>(false);
  const [perfil, setPerfil] = useState<perfilDatosAmpleosInterface>({} as perfilDatosAmpleosInterface);
  const [direcionHomesegunRol, setDirecionHomesegunRol] = useState<string>("/");
  const [openUserMenu, setOpenUserMenu] = useState(false);



  const { haySesionStore, perfilToken } = useInicioSesionStore();


  const { urlFotoPerfil, loading } = useFotoPerfilHook(perfil);

  useEffect(() => {
    if (!openUserMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById("user-menu");
      const button = document.getElementById("user-menu-button");
      if (menu && !menu.contains(event.target as Node) && button && !button.contains(event.target as Node)) {
        setOpenUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openUserMenu]);

  useEffect(() => {
    const perfilCookie = document.cookie.split(";").find((c) => c.trim().startsWith("perfilActivo="));
    const perfilBruto = perfilCookie ? decodeURIComponent(perfilCookie.split("=")[1]) : null;
    if (perfilBruto) {
      const perfil: perfilDatosAmpleosInterface = JSON.parse(perfilBruto);
   
      if (perfil) {
        setPerfil(perfil);

        if (perfil.roles?.nombreRol === "admin") setDirecionHomesegunRol("/PanelControlPage");
        if (perfil.roles?.nombreRol === "admin temporal") setDirecionHomesegunRol("/PanelControlPage");
        if (perfil.roles?.nombreRol === "developer") setDirecionHomesegunRol("/sup");
        if (perfil.roles?.nombreRol === "presidenteJurado") setDirecionHomesegunRol("/PanelControlPage");
        if (perfil.roles?.nombreRol === "jurado") setDirecionHomesegunRol("/EvaluarPage");
        if (perfil.roles?.nombreRol === "fiscal") setDirecionHomesegunRol("/fiscal");
        if (perfil.roles?.nombreRol === "director artistico") setDirecionHomesegunRol("/mi-banda-page");
        if (perfil.roles?.nombreRol === "lider de banda") setDirecionHomesegunRol("/mi-banda-page");
       
        if (perfil.roles?.nombreRol === "responsable de bandas") setDirecionHomesegunRol("/responsable-bandas");
        if (perfil.roles?.nombreRol === "responsable de rubricas") setDirecionHomesegunRol("/responsable-rubricas");
        if (perfil.roles?.nombreRol === "responsable de usuarios") setDirecionHomesegunRol("/responsable-usuarios");
        if (perfil.roles?.nombreRol === "responsable de eventos") setDirecionHomesegunRol("/responsable-eventos");
        if (perfil.roles?.nombreRol === "responsable de mesa") setDirecionHomesegunRol("/responsable-mesa");
        if (perfil.roles?.nombreRol === "secretaria") setDirecionHomesegunRol("/secretaria");
        if (perfil.roles?.nombreRol === "comite de disciplina") setDirecionHomesegunRol("/diciplina");
        if (perfil.roles?.nombreRol === "dirigente"){
          const idBanda = perfil.idForaneaBanda ?? perfil.bandas?.idBanda;
          if (idBanda) {
            setDirecionHomesegunRol(`/mi-banda-page/${idBanda}`);
            console.log("ID de banda para dirigente:", idBanda);
          }
          

        } 

        setHaySesionIniciada(true);
      }
    }
  }, [haySesionStore, perfilToken]);

  const handleLogout = async () => {
    setOpenUserMenu(false);
    await cerrarSesionYLimpiar();
  };

  // Validación para evitar problemas de hidratación
  if (!haySesionIniciada || !perfil || !perfil.roles?.nombreRol) {
    // Puedes mostrar un loader, mensaje neutro, o simplemente nada
    return (
      <header className="bg-grey-500/5 backdrop-blur-md h-25 w-full flex text-white items-center justify-between px-15 fixed top-0 z-50">
        <div className="flex flex-row items-center">
          <div className="text-xl lg:text-xl font-bold text-slate-400" style={{ letterSpacing: "0.3em" }}>
            <span>AURORA</span>
          </div>
        </div>
      </header>
    );
  } 
  return (
    <div className=" bg-grey-500/5 backdrop-blur-md h-18  w-full flex text-white items-center justify-between px-8 ls:px-15 fixed   top-0 z-50">
      <div className="flex flex-row  items-center   ">
        <div className="text-xl lg:text-xl font-bold " style={{ letterSpacing: "0.3em" }}>
          <Link href={direcionHomesegunRol}>AURORA</Link>
        </div>
      </div>
   

      <div className={` flex `}>
              {
                haySesionIniciada &&
                <div className=" flex justify-center items-center ">
                  <div className="hidden lg:block">

              <UserDropdown 
            
            nombreUsuario={perfil.nombre}
            apellidoUsuario={perfil.primerApellido}
            urlFotoPerfil={urlFotoPerfil} haySesion={haySesionIniciada} 
            cerrarSesion={handleLogout}
            RutaMiPerfil={"/miPerfilPage"}
            />
            </div>
                  <SidebarMovil
                    urlFotoPerfil={urlFotoPerfil}
                    haySesionIniciada={haySesionIniciada}
                    handleLogout={handleLogout}
                    rolUser={perfil.roles?.nombreRol}
                    perfil={perfil}
                  />  
              </div>
            }
            </div>
          </div>
  
  );
};

export default NavBard;
