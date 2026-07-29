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

const AVATAR_CLASS =
  "relative flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[var(--vz-border-strong)] bg-[var(--vz-surface)] shadow-sm";

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
        left = rect.right - 20 - 288;
      }

      setMenuCoords({
        top: rect.bottom + 8,
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
        <div className="rounded-full border border-[var(--vz-border-strong)] bg-[var(--vz-surface)] p-2">
          <UserIcon className="h-6 w-6 text-[var(--app-fg-muted)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={triggerRef} onClick={handleClickMenu} className={AVATAR_CLASS}>
        <FotoPerfilImage
          src={urlFotoPerfilActual}
          alt="Foto de perfil"
          fill
          className="rounded-full object-cover"
          fallbackIconClassName="h-6 w-6 text-[var(--brand)]"
        />
      </div>
      {openMenu &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              top: menuCoords.top,
              left: menuCoords.left,
              position: "fixed",
              zIndex: 9999,
            }}
            className="min-h-60 w-72 rounded-xl border border-[var(--vz-border)] bg-white p-4 text-[var(--app-fg)] shadow-[0_16px_40px_-20px_rgba(15,23,42,0.25)]"
          >
            <Link
              href={RutaMiPerfil}
              className="flex items-center gap-3 border-b border-[var(--vz-border)] pb-4"
            >
              <div className={AVATAR_CLASS}>
                <FotoPerfilImage
                  src={urlFotoPerfilActual}
                  alt="Foto de perfil"
                  fill
                  className="rounded-full object-cover"
                  fallbackIconClassName="h-6 w-6 text-[var(--brand)]"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--vz-black)]">
                  {nombreUsuario} {apellidoUsuario}
                </p>
                <p className="mt-0.5 text-xs text-[var(--app-fg-muted)]">Ver perfil</p>
              </div>
            </Link>
            <div className="flex flex-col gap-1 pt-3">
              <Link
                href={RutaMiPerfil}
                className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-[var(--app-fg)] transition-colors hover:bg-[var(--vz-surface)]"
                onClick={handleClickAbrirPerfil}
              >
                <UserIcon className="h-5 w-5 text-[var(--brand)]" />
                Perfil
              </Link>
              <button
                type="button"
                onClick={handleClickCerrarSesion}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Cerrar sesión
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
