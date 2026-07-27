import {
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";

export const JURADO_NAV_LINKS = [
  {
    id: "inicio",
    label: "Inicio",
    href: "/EvaluarPage",
    Icon: HomeIcon,
  },
  {
    id: "evaluar",
    label: "Evaluar",
    href: "/EvaluarPage/evaluar",
    Icon: ClipboardDocumentCheckIcon,
  },
  {
    id: "mis-eventos",
    label: "Mis eventos",
    href: "/EvaluarPage/mis-eventos-asignados",
    Icon: CalendarDaysIcon,
  },
  {
    id: "rubricas",
    label: "Rúbricas",
    href: "/EvaluarPage/rubricas",
    Icon: DocumentTextIcon,
  },
] as const;

export function esRutaJuradoActiva(pathname: string, href: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";

  if (href === "/EvaluarPage") {
    return normalized === "/EvaluarPage";
  }

  return normalized === href || normalized.startsWith(`${href}/`);
}
