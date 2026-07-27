import {
  CalendarDaysIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  HomeIcon,
  BellAlertIcon,
  ShieldExclamationIcon,
  TableCellsIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export type MiBandaNavLink = {
  id: string;
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/** Segmentos bajo /mi-banda-page que no son idBanda (rutas globales). */
const SEGMENTOS_NO_BANDA = new Set([
  "notificaciones",
  "eventos",
  "servicio-no-disponible",
]);

const RUTAS_GLOBALES_MI_BANDA = [
  "/mi-banda-page/notificaciones",
  "/mi-banda-page/eventos",
] as const;

export function getMiBandaNavLinks(idBanda: string, options?: { includeInicio?: boolean }): MiBandaNavLink[] {
  const base = `/mi-banda-page/${idBanda}`;
  const links: MiBandaNavLink[] = [];

  if (options?.includeInicio !== false) {
    links.push({ id: "inicio", label: "Inicio", href: base, Icon: HomeIcon });
  }

  links.push(
    { id: "notificaciones", label: "Notificaciones", href: `/mi-banda-page/notificaciones`, Icon: BellAlertIcon },
    { id: "estadisticas", label: "Estadísticas", href: `${base}/estadisticas`, Icon: ChartBarIcon },
    { id: "tabla", label: "ranking por puntos", href: `${base}/ranking-por-puntos`, Icon: TableCellsIcon },
    { id: "ranking-copas", label: "Ranking por copas", href: `${base}/ranking-por-copas`, Icon: TrophyIcon },
    { id: "eventos", label: "Agenda de eventos", href: "/mi-banda-page/eventos", Icon: CalendarDaysIcon },
    { id: "resultados", label: "Resultados", href: `${base}/resultados`, Icon: ClipboardDocumentListIcon },
    { id: "rubricas", label: "Rúbricas", href: `${base}/rubricas`, Icon: DocumentTextIcon },
    { id: "sanciones", label: "Sanciones", href: `${base}/sanciones`, Icon: ShieldExclamationIcon },
   
  );

  return links;
}

export function esRutaMiBandaActiva(pathname: string, href: string, idBanda: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const normalizedHref = href.replace(/\/$/, "") || "/";
  const base = `/mi-banda-page/${idBanda}`;

  if (normalizedHref === base) {
    return normalized === base;
  }

  if (
    RUTAS_GLOBALES_MI_BANDA.includes(
      normalizedHref as (typeof RUTAS_GLOBALES_MI_BANDA)[number],
    )
  ) {
    return normalized === normalizedHref;
  }

  return (
    normalized === normalizedHref ||
    normalized.startsWith(`${normalizedHref}/`)
  );
}

export function idBandaDesdePathname(pathname: string): string | null {
  const match = pathname.match(/^\/mi-banda-page\/([^/]+)/);
  const id = match?.[1]?.trim();
  if (!id || SEGMENTOS_NO_BANDA.has(id)) return null;
  return id;
}
