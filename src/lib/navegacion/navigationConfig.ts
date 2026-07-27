import type { perfilDatosAmpleosInterface } from "@/interfaces/interfaces";
import {
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  DocumentPlusIcon,
  DocumentTextIcon,
  EyeIcon,
  HomeIcon,
  KeyIcon,
  ListBulletIcon,
  LockClosedIcon,
  MapPinIcon,
  MusicalNoteIcon,
  QueueListIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  TableCellsIcon,
  TrophyIcon,
  UsersIcon,
  ClockIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/24/solid";
import type { ComponentType, SVGProps } from "react";
import { FISCAL_NAV_LINKS } from "./fiscalLinks";
import { JURADO_NAV_LINKS } from "./juradoLinks";
import { getMiBandaNavLinks, idBandaDesdePathname } from "./miBandaLinks";

export type NavLinkItem = {
  id: string;
  label: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  visible?: (ctx: NavContext) => boolean;
  /** Si se define, solo coincide la ruta exacta (sin subrutas). */
  exact?: boolean;
};

export type NavContext = {
  rol: string;
  perfil?: perfilDatosAmpleosInterface;
  idBanda?: string | null;
  pathname?: string;
};

const ROLES_MI_BANDA = new Set([
  "director artistico",
  "lider de banda",
  "liderBanda",
  "directorArtistico",
  "dirigente",
]);

export const ADMIN_NAV_LINKS: NavLinkItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/PanelControlPage/dashboard", Icon: HomeIcon },
  { id: "usuarios", label: "Usuarios", href: "/PanelControlPage/usuariosHomePage", Icon: UsersIcon },
  {
    id: "recuperar-contrasena",
    label: "Recuperar contraseña",
    href: "/PanelControlPage/recuperar-contrasena",
    Icon: KeyIcon,
    visible: (ctx) => ctx.rol === "admin",
  },
  { id: "region", label: "Región", href: "/PanelControlPage/regionHomePage", Icon: MapPinIcon },
  { id: "categorias", label: "Categorías", href: "/PanelControlPage/categoriasHomePage", Icon: ListBulletIcon },
  { id: "bandas", label: "Bandas", href: "/PanelControlPage/bandasHomePage", Icon: MusicalNoteIcon },
  { id: "rubricas", label: "Rúbrica", href: "/PanelControlPage/rubricaHomePage", Icon: AdjustmentsHorizontalIcon },
  { id: "ver-rubricas", label: "Ver rúbricas", href: "/PanelControlPage/ver-rubricas", Icon: DocumentTextIcon },
  { id: "evento", label: "Evento", href: "/PanelControlPage/eventosHomePage", Icon: CalendarDaysIcon },
  {
    id: "asistencia-bandas",
    label: "Asistencia de bandas",
    href: "/PanelControlPage/asistencia-bandas",
    Icon: ClipboardDocumentCheckIcon,
  },
  { id: "checkout", label: "Checkout", href: "/PanelControlPage/checkout", Icon: ClipboardDocumentListIcon },
  {
    id: "reporte",
    label: "Resultados por banda",
    href: "/PanelControlPage/resutados-detallados-banda",
    Icon: DocumentTextIcon,
  },
  { id: "copas", label: "Copas", href: "/PanelControlPage/copasHomePage", Icon: TrophyIcon },
  { id: "copasTemporada", label: "Copas Temporada", href: "/PanelControlPage/copasTemporadaPage", Icon: TrophyIcon },
  { id: "controladores", label: "Controladores", href: "/PanelControlPage/controladores", Icon: LockClosedIcon },
  { id: "sanciones", label: "Sanciones", href: "/PanelControlPage/sanciones", Icon: ShieldExclamationIcon },
  {
    id: "aplicacion-sancion",
    label: "Sanciones Aplicadas",
    href: "/PanelControlPage/aplicacion-sancion",
    Icon: ClipboardDocumentListIcon,
  },
  {
    id: "aplicar-sancion",
    label: "Solicitudes de Sanción",
    href: "/PanelControlPage/aplicar-sancion",
    Icon: ClipboardDocumentCheckIcon,
  },
  {
    id: "alertas",
    label: "Alertas",
    href: "/PanelControlPage/alertas",
    Icon: ExclamationTriangleIcon,
  },
];

export const SECRETARIA_NAV_LINKS: NavLinkItem[] = [
  { id: "usuarios", label: "Usuarios", href: "/secretaria/usuarios", Icon: UsersIcon },
  { id: "bandas", label: "Bandas", href: "/secretaria/bandas", Icon: MusicalNoteIcon },
  { id: "categorias", label: "Categorías", href: "/secretaria/categorias", Icon: ListBulletIcon },
  { id: "eventos", label: "Eventos", href: "/secretaria/eventos", Icon: CalendarDaysIcon },
  { id: "regiones", label: "Regiones", href: "/secretaria/regiones", Icon: MapPinIcon },
  {
    id: "asistencia-bandas",
    label: "Asistencia de bandas",
    href: "/secretaria/asistencia-bandas",
    Icon: ClipboardDocumentCheckIcon,
  },
  { id: "checkout", label: "Checkout", href: "/secretaria/checkout", Icon: ClipboardDocumentListIcon },
  { id: "ranking", label: "Ranking por puntos", href: "/secretaria/ranking", Icon: QueueListIcon },
  { id: "copas", label: "Ranking por copas", href: "/secretaria/ranking-por-copas", Icon: TrophyIcon },
  {
    id: "condensados",
    label: "Condensados",
    href: "/secretaria/condensado-por-rubrica",
    Icon: ChartBarSquareIcon,
  },
  { id: "rubricas", label: "Rubricas", href: "/secretaria/rubricas", Icon: ClipboardDocumentListIcon },
  { id: "sanciones", label: "Sanciones", href: "/secretaria/sanciones", Icon: ShieldExclamationIcon },
  {
    id: "sanciones-aplicadas",
    label: "Sanciones aplicadas",
    href: "/secretaria/sanciones-aplicadas",
    Icon: TableCellsIcon,
  },
  {
    id: "solicitar-sancion",
    label: "Solicitar Sanción",
    href: "/secretaria/solicitar-sancion-administrativa",
    Icon: DocumentPlusIcon,
  },
];

const DEVELOPER_NAV_LINKS: NavLinkItem[] = [
  { id: "home", label: "Inicio", href: "/dev", Icon: HomeIcon, exact: true },
  { id: "controladores", label: "Controladores", href: "/dev/controladores", Icon: LockClosedIcon },
  {
    id: "recuperar-contrasena",
    label: "Recuperar contraseña",
    href: "/dev/recuperar-contrasena",
    Icon: KeyIcon,
  },
  {
    id: "alertas",
    label: "Alertas",
    href: "/dev/alertas",
    Icon: ExclamationTriangleIcon,
  },
  {
    id: "auditoria-eventos",
    label: "Auditoría eventos",
    href: "/dev/auditoria",
    Icon: EyeIcon,
  },
  {
    id: "auditoria-general",
    label: "Auditoría general",
    href: "/dev/auditoria-general",
    Icon: ClipboardDocumentListIcon,
  },
];

const DICIPLINA_NAV_LINKS: NavLinkItem[] = [
  { id: "mis-eventos", label: "Mis eventos", href: "/diciplina/mis-eventos", Icon: CalendarDaysIcon },
  { id: "checkout-llegada", label: "Checkout llegada", href: "/diciplina/checkout-llegada", Icon: ClockIcon },
  { id: "checkout-entrada", label: "Checkout entrada", href: "/diciplina/checkout-entrada", Icon: ArrowRightCircleIcon },
  {
    id: "historial-checkout",
    label: "Historial checkout",
    href: "/diciplina/historial-chekout",
    Icon: ClipboardDocumentListIcon,
  },
];

const RESPONSABLE_BANDAS_LINKS: NavLinkItem[] = [
  { id: "bandas", label: "Bandas", href: "/responsable-bandas", Icon: MusicalNoteIcon, exact: true },
  { id: "categorias", label: "Categorías", href: "/responsable-bandas/categorias", Icon: ListBulletIcon },
  { id: "regiones", label: "Regiones", href: "/responsable-bandas/regiones", Icon: MapPinIcon },
];

const RESPONSABLE_EVENTOS_LINKS: NavLinkItem[] = [
  { id: "eventos", label: "Eventos", href: "/responsable-eventos", Icon: CalendarDaysIcon, exact: true },
  { id: "regiones", label: "Regiones", href: "/responsable-eventos/regiones", Icon: MapPinIcon },
];

const RESPONSABLE_USUARIOS_LINKS: NavLinkItem[] = [
  { id: "usuarios", label: "Usuarios", href: "/responsable-usuarios", Icon: UsersIcon },
];

const RESPONSABLE_RUBRICAS_LINKS: NavLinkItem[] = [
  { id: "rubricas", label: "Rúbricas", href: "/responsable-rubricas", Icon: ClipboardDocumentListIcon, exact: true },
  { id: "ver-rubricas", label: "Ver rúbricas", href: "/responsable-rubricas/ver-rubricas", Icon: EyeIcon },
  { id: "categorias", label: "Categorías", href: "/responsable-rubricas/categorias", Icon: ListBulletIcon },
  { id: "regiones", label: "Regiones", href: "/responsable-rubricas/regiones", Icon: MapPinIcon },
];

const RESPONSABLE_MESA_LINKS: NavLinkItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/responsable-mesa", Icon: HomeIcon, exact: true },
  { id: "eventos", label: "Eventos", href: "/responsable-mesa/eventos", Icon: CalendarDaysIcon },
  { id: "asignar-copas", label: "Asignar copas", href: "/responsable-mesa/asignar-copas", Icon: TrophyIcon },
  { id: "consultar-copas", label: "Consultar copas", href: "/responsable-mesa/consultar-copas", Icon: TableCellsIcon },
  { id: "alertas", label: "Alertas", href: "/responsable-mesa/alertas", Icon: ExclamationTriangleIcon },
];

const NAV_BY_ROL: Record<string, NavLinkItem[] | ((ctx: NavContext) => NavLinkItem[])> = {
  admin: ADMIN_NAV_LINKS,
  "admin temporal": ADMIN_NAV_LINKS,
  developer: DEVELOPER_NAV_LINKS,
  secretaria: SECRETARIA_NAV_LINKS,
  jurado: [...JURADO_NAV_LINKS],
  fiscal: [...FISCAL_NAV_LINKS],
  "comite de disciplina": DICIPLINA_NAV_LINKS,
  "responsable de bandas": RESPONSABLE_BANDAS_LINKS,
  "responsable de eventos": RESPONSABLE_EVENTOS_LINKS,
  "responsable de usuarios": RESPONSABLE_USUARIOS_LINKS,
  "responsable de rubricas": RESPONSABLE_RUBRICAS_LINKS,
  "responsable de mesa": RESPONSABLE_MESA_LINKS,
};

function idBandaDelPerfil(perfil?: perfilDatosAmpleosInterface): string | null {
  const id = perfil?.idForaneaBanda?.trim() || perfil?.bandas?.idBanda?.trim() || null;
  return id || null;
}

function resolveIdBanda(ctx: NavContext): string | null {
  if (ctx.idBanda) return ctx.idBanda;
  if (ctx.pathname) {
    const fromPath = idBandaDesdePathname(ctx.pathname);
    if (fromPath) return fromPath;
  }
  return idBandaDelPerfil(ctx.perfil);
}

export function esRutaActiva(pathname: string, href: string, options?: { exact?: boolean }): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const normalizedHref = href.replace(/\/$/, "") || "/";

  if (options?.exact || normalizedHref === "/fiscal" || normalizedHref === "/EvaluarPage" || normalizedHref === "/dev") {
    return normalized === normalizedHref;
  }

  return normalized === normalizedHref || normalized.startsWith(`${normalizedHref}/`);
}

export function getNavLinksByRol(rol: string, ctx: NavContext = { rol }): NavLinkItem[] {
  const fullCtx: NavContext = { ...ctx, rol };

  if (ROLES_MI_BANDA.has(rol)) {
    const idBanda = resolveIdBanda(fullCtx);
    if (!idBanda) return [];
    return getMiBandaNavLinks(idBanda);
  }

  const entry = NAV_BY_ROL[rol];
  if (!entry) return [];

  const links = typeof entry === "function" ? entry(fullCtx) : entry;
  return links.filter((link) => !link.visible || link.visible(fullCtx));
}

export function rolTieneNavegacion(rol: string | undefined | null): boolean {
  if (!rol) return false;
  if (ROLES_MI_BANDA.has(rol)) return true;
  return rol in NAV_BY_ROL;
}
