"use client";

import { perfilDatosAmpleosInterface } from "@/models";
import { getNavLinksByRol, rolTieneNavegacion } from "@/config/navegacion/navigationConfig";
import { idBandaDesdePathname } from "@/config/navegacion/miBandaLinks";
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
      className={`desaparecer-scrollbar sidebar-bg sticky top-0 hidden min-h-screen shrink-0 flex-col self-stretch border-r transition-[width] duration-200 lg:flex ${widthClass} ${
        hydrated ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex min-h-full flex-1 flex-col pt-16">
        <div
          className={`flex shrink-0 items-center border-b border-[var(--sidebar-border)] py-2 ${
            collapsed ? "justify-center px-2" : "justify-end px-3"
          }`}
        >
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
            className="rounded-md p-2 text-[var(--sidebar-fg-muted)] transition-colors hover:bg-[var(--vz-surface-hover)] hover:text-[var(--sidebar-fg)]"
          >
            {collapsed ? (
              <ChevronDoubleRightIcon className="h-5 w-5" />
            ) : (
              <ChevronDoubleLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <SidebarNav links={links} collapsed={collapsed} />
        </div>
      </div>
    </aside>
  );
}
