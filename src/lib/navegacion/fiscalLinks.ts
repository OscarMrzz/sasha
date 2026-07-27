import {
  CalendarDaysIcon,
  ChartBarSquareIcon,
  DocumentPlusIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";

export const FISCAL_NAV_LINKS = [
  {
    id: "inicio",
    label: "Inicio",
    href: "/fiscal",
    Icon: HomeIcon,
  },
  {
    id: "fiscalizar",
    label: "Fiscalizar",
    href: "/fiscal/fiscalizar",
    Icon: ChartBarSquareIcon,
  },
  {
    id: "mis-eventos",
    label: "Mis eventos",
    href: "/fiscal/mis-eventos-asignados",
    Icon: CalendarDaysIcon,
  },
  {
    id: "solicitar-copa",
    label: "Solicitar copa",
    href: "/fiscal/solicitar-copa",
    Icon: DocumentPlusIcon,
  },
] as const;

export function esRutaFiscalActiva(pathname: string, href: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";

  if (href === "/fiscal") {
    return normalized === "/fiscal";
  }

  return normalized === href || normalized.startsWith(`${href}/`);
}
