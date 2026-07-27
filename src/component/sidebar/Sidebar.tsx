"use client";

import { perfilDatosAmpleosInterface } from "@/interfaces/interfaces";
import { getNavLinksByRol, rolTieneNavegacion } from "@/lib/navegacion/navigationConfig";
import { idBandaDesdePathname } from "@/lib/navegacion/miBandaLinks";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/solid";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import SidebarNav from "./SidebarNav";
import { useSidebarCollapse } from "./useSidebarCollapse";

function leerPerfilCookie(): perfilDatosAmpleosInterface | null {
  if (typeof document === "undefined") return null;
  const perfilCookie = document.cookie.split(";").find((c) => c.trim().startsWith("perfilActivo="));
  const perfilBruto = perfilCookie ? decodeURIComponent(perfilCookie.split("=")[1]) : null;
  if (!perfilBruto) return null;
  try {
    return JSON.parse(perfilBruto) as perfilDatosAmpleosInterface;
  } catch {
    return null;
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle, hydrated } = useSidebarCollapse();
  const [perfil, setPerfil] = useState<perfilDatosAmpleosInterface | null>(null);

  useEffect(() => {
    setPerfil(leerPerfilCookie());
  }, [pathname]);

  const rol = perfil?.roles?.nombreRol ?? "";

  const links = useMemo(() => {
    if (!rol || !rolTieneNavegacion(rol)) return [];
    const idBanda = idBandaDesdePathname(pathname) || perfil?.idForaneaBanda?.trim() || perfil?.bandas?.idBanda?.trim() || null;
    return getNavLinksByRol(rol, { rol, perfil: perfil ?? undefined, idBanda, pathname });
  }, [rol, perfil, pathname]);

  if (!rol || links.length === 0) {
    return null;
  }

  const widthClass = collapsed ? "w-16" : "w-60";

  return (
    <aside
      className={`desaparecer-scrollbar sticky  hidden min-h-screen h-full shrink-0 flex-col border-r border-slate-700/50 bg-slate-800/50 transition-[width] duration-200 lg:flex ${widthClass} ${
        hydrated ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-full pt-16">

    
      <div className={`flex shrink-0 items-center border-b border-slate-700/50 py-2 ${collapsed ? "justify-center px-2" : "justify-end px-3"}`}>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          className="rounded-md p-2 text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-white"
        >
          {collapsed ? (
            <ChevronDoubleRightIcon className="h-5 w-5" />
          ) : (
            <ChevronDoubleLeftIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="min-h-0 flex-1  py-2">
        <SidebarNav links={links} collapsed={collapsed} />
      </div>
      </div>
    </aside>
  );
}
