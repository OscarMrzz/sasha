"use client";
import FotoPerfilImage from "@/components/FotoPerfil/FotoPerfilImage";
import { UserIcon } from "@heroicons/react/16/solid";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

type prop = {
  urlFotoPerfil: string;
  haySesion: boolean;
  nombreUsuario: string;
  apellidoUsuario: string;
  cerrarSesion: () => void;
  RutaMiPerfil: string;
};

export default function UserDropdown({
  urlFotoPerfil,
  haySesion,
  nombreUsuario,
  apellidoUsuario,
  cerrarSesion,
  RutaMiPerfil,
}: prop) {
  const [urlFotoPerfilActual, setUrlFotoPerfilActual] = useState<string>("");
  const [haySesionIniciada, setHaySesionIniciada] = useState<boolean>(haySesion);
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });

  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  const clickFueraMenu = (evento: MouseEvent) => {
    const target = evento.target as Node;
    if (menuRef.current?.contains(target)) return;
    if (triggerRef.current?.contains(target)) return;
    setOpenMenu(false);
  };
  
  useEffect(() => {
    document.addEventListener("click", clickFueraMenu);
    return () => {
      document.removeEventListener("click", clickFueraMenu);
    };
  }, []);

  useEffect(() => {
    setUrlFotoPerfilActual(urlFotoPerfil);
    setHaySesionIniciada(haySesion);
  }, [urlFotoPerfil, haySesion]);

  const handleClickMenu = () => {
    if (!openMenu && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const isLg = window.matchMedia("(min-width: 1024px)").matches;
      
      let left = rect.left;
      if (isLg) {
        // lg:right-5 behavior: align right edge of menu 20px from right edge of trigger
        // menu width is w-72 (18rem = 288px)
        // 20px offset
        left = rect.right - 20 - 288;
      }

      setMenuCoords({
        top: rect.bottom,
        left: left,
      });
    }
    setOpenMenu(!openMenu);
  };

  const handleClickCerrarSesion = () => {
    cerrarSesion();
    setOpenMenu(false);
  };
  const handleClickAbrirPerfil = () => {
    setOpenMenu(false);
  };

  if (!haySesionIniciada) {
    return (
      <div>
        <div className="bg-slate-500 rounded-full p-2 ">
          <UserIcon className="h-6 w-6 text-slate-200 " />
        </div>
      </div>
    );
  }

  return (
    <div className=" relative   ">
      
      <div
        ref={triggerRef}
        onClick={handleClickMenu}
        className="relative overflow-hidden p-2 w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center shadow-lg cursor-pointer "
      >
        <FotoPerfilImage
          src={urlFotoPerfilActual}
          alt="Foto de perfil"
          fill
          className="object-cover rounded-full"
          fallbackIconClassName="w-6 h-6"
        />
      </div>
      {openMenu && createPortal(
        <div
          ref={menuRef}
          style={{ 
            top: menuCoords.top, 
            left: menuCoords.left,
            position: 'fixed',
            zIndex: 9999 
          }}
          className="p-4 h-90 min-h-60 w-72 bg-slate-600 rounded-xl shadow-lg"
        >
          <Link href={RutaMiPerfil} className="flex gap-2 items-center border-b border-slate-300 pb-4">
            <div>
              <div className="relative overflow-hidden p-2 w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center shadow-lg cursor-pointer ">
                <FotoPerfilImage
                  src={urlFotoPerfilActual}
                  alt="Foto de perfil"
                  fill
                  className="object-cover rounded-full"
                  fallbackIconClassName="w-6 h-6"
                />
              </div>
            </div>
            <div>
              <p className="font-light">
                {nombreUsuario} {apellidoUsuario}
              </p>
            </div>
          </Link>
          <div className="flex flex-col gap-2 pt-4 font-light">
            <Link href={RutaMiPerfil} className="flex items-center gap-2" onClick={handleClickAbrirPerfil}>
              <UserIcon className="w-6 h-6" />
              Perfil
            </Link>
            <p onClick={handleClickCerrarSesion} className="flex items-center gap-2 cursor-pointer">
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
              Cerrar sesión
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
