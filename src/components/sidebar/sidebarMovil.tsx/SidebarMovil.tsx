"use client";

import { perfilDatosAmpleosInterface } from "@/models";
import { getNavLinksByRol, rolTieneNavegacion } from "@/config/navegacion/navigationConfig";
import { idBandaDesdePathname } from "@/config/navegacion/miBandaLinks";
import { Bars3Icon } from "@heroicons/react/16/solid";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import UserDropdown from "@/components/userDropdown/UserDropdown";
import SidebarNav from "@/components/sidebar/SidebarNav";

type SidebarMovilProps = {
  urlFotoPerfil: string;
  haySesionIniciada: boolean;
  handleLogout: () => void;
  rolUser: string;
  perfil: perfilDatosAmpleosInterface;
};

export default function SidebarMovil({
  urlFotoPerfil,
  haySesionIniciada,
  handleLogout,
  rolUser,
  perfil,
}: SidebarMovilProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const links = useMemo(() => {
    if (!rolUser || !rolTieneNavegacion(rolUser)) return [];
    const idBanda =
      idBandaDesdePathname(pathname) ||
      perfil?.idForaneaBanda?.trim() ||
      perfil?.bandas?.idBanda?.trim() ||
      null;
    return getNavLinksByRol(rolUser, { rol: rolUser, perfil, idBanda, pathname });
  }, [rolUser, perfil, pathname]);

  if (links.length === 0) {
    return null;
  }

  const cerrarSidebar = () => setIsOpen(false);

  return (
    <div className="lg:hidden">
      {!isOpen ? (
        <Bars3Icon onClick={() => setIsOpen(true)} className="h-12 w-12 cursor-pointer text-[var(--app-fg)]" aria-label="Abrir menú" />
      ) : (
        <div onClick={cerrarSidebar} className="absolute left-0 top-0 z-50 h-screen w-full bg-gray-900/90">
          <div
            onClick={(e) => e.stopPropagation()}
            className="desaparecer-scrollbar sidebar-bg flex h-screen w-60 animate-slide-in-left flex-col overflow-y-auto py-6 pb-32 font-bold"
          >
            <section className="flex items-center justify-center">
              <UserDropdown
                nombreUsuario={perfil.nombre}
                apellidoUsuario={perfil.primerApellido}
                urlFotoPerfil={urlFotoPerfil}
                haySesion={haySesionIniciada}
                cerrarSesion={handleLogout}
                RutaMiPerfil="/miPerfilPage"
              />
            </section>
            <section className="mt-2">
              <SidebarNav links={links} onNavigate={cerrarSidebar} />
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
