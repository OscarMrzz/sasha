export type SeccionAtajos = "panel" | "secretaria" | "dev";

export interface PaginaNavegable {
  id: string;
  nombre: string;
  ruta: string;
  valorBuscado: string[];
  rolesPermitidos?: string[];
}

export const NAV_PANEL: PaginaNavegable[] = [
  { id: "dashboard", nombre: "Dashboard", ruta: "/PanelControlPage/dashboard", valorBuscado: ["Dashboard", "Inicio", "Home"] },
  {
    id: "federacion",
    nombre: "Federaciones",
    ruta: "/PanelControlPage/federacionesHomePage",
    valorBuscado: ["Federaciones"],
    rolesPermitidos: ["developer"],
  },
  { id: "usuarios", nombre: "Usuarios", ruta: "/PanelControlPage/usuariosHomePage", valorBuscado: ["Usuarios"] },
  {
    id: "recuperar-contrasena",
    nombre: "Recuperar contraseña",
    ruta: "/PanelControlPage/recuperar-contrasena",
    valorBuscado: ["Recuperar contraseña", "contraseña", "password"],
    rolesPermitidos: ["admin"],
  },
  { id: "region", nombre: "Región", ruta: "/PanelControlPage/regionHomePage", valorBuscado: ["Regiones", "Región"] },
  { id: "categorias", nombre: "Categorías", ruta: "/PanelControlPage/categoriasHomePage", valorBuscado: ["Categorias", "Categorías"] },
  { id: "bandas", nombre: "Bandas", ruta: "/PanelControlPage/bandasHomePage", valorBuscado: ["Bandas"] },
  { id: "rubricas", nombre: "Rúbrica", ruta: "/PanelControlPage/rubricaHomePage", valorBuscado: ["Rubricas", "Rúbrica", "criterios", "indicadores", "cumplimiento"] },
  { id: "ver-rubricas", nombre: "Ver rúbricas", ruta: "/PanelControlPage/ver-rubricas", valorBuscado: ["Ver rúbricas", "rúbricas"] },
  {
    id: "evento",
    nombre: "Evento",
    ruta: "/PanelControlPage/eventosHomePage",
    valorBuscado: ["Eventos", "Evento", "Calendario", "lugares", "fechas", "equipos", "evaluador", "equipo evaluador"],
  },
  { id: "asistencia-bandas", nombre: "Asistencia de bandas", ruta: "/PanelControlPage/asistencia-bandas", valorBuscado: ["Asistencia de bandas", "Asistencia"] },
  { id: "checkout", nombre: "Checkout", ruta: "/PanelControlPage/checkout", valorBuscado: ["Checkout"] },
  { id: "reporte", nombre: "Resultados por banda", ruta: "/PanelControlPage/resutados-detallados-banda", valorBuscado: ["Resultados por banda", "Resultados"] },
  { id: "copas", nombre: "Copas", ruta: "/PanelControlPage/copasHomePage", valorBuscado: ["Copas"] },
  { id: "copasTemporada", nombre: "Copas Temporada", ruta: "/PanelControlPage/copasTemporadaPage", valorBuscado: ["Copas Temporada", "Temporada"] },
  { id: "controladores", nombre: "Controladores", ruta: "/PanelControlPage/controladores", valorBuscado: ["controladores", "controlador", "permisos"] },
  { id: "sanciones", nombre: "Sanciones", ruta: "/PanelControlPage/sanciones", valorBuscado: ["Sanciones"] },
  { id: "aplicacion-sancion", nombre: "Sanciones Aplicadas", ruta: "/PanelControlPage/aplicacion-sancion", valorBuscado: ["Sanciones Aplicadas"] },
  { id: "aplicar-sancion", nombre: "Solicitudes de Sanción", ruta: "/PanelControlPage/aplicar-sancion", valorBuscado: ["Solicitudes de Sanción", "Solicitudes"] },
  { id: "alertas", nombre: "Alertas", ruta: "/PanelControlPage/alertas", valorBuscado: ["Alertas", "duplicados", "evaluación"] },
  { id: "perfil", nombre: "Perfil", ruta: "/miPerfilPage", valorBuscado: ["Perfil", "Mi perfil", "Cuenta", "yo"] },
];

export const NAV_SECRETARIA: PaginaNavegable[] = [
  { id: "usuarios", nombre: "Usuarios", ruta: "/secretaria/usuarios", valorBuscado: ["Usuarios"] },
  { id: "bandas", nombre: "Bandas", ruta: "/secretaria/bandas", valorBuscado: ["Bandas"] },
  { id: "categorias", nombre: "Categorías", ruta: "/secretaria/categorias", valorBuscado: ["Categorias", "Categorías"] },
  { id: "eventos", nombre: "Eventos", ruta: "/secretaria/eventos", valorBuscado: ["Eventos", "Calendario"] },
  { id: "regiones", nombre: "Regiones", ruta: "/secretaria/regiones", valorBuscado: ["Regiones", "Región"] },
  { id: "asistencia-bandas", nombre: "Asistencia de bandas", ruta: "/secretaria/asistencia-bandas", valorBuscado: ["Asistencia de bandas", "Asistencia"] },
  { id: "checkout", nombre: "Checkout", ruta: "/secretaria/checkout", valorBuscado: ["Checkout"] },
  { id: "ranking", nombre: "Ranking por puntos", ruta: "/secretaria/ranking", valorBuscado: ["Ranking por puntos", "Ranking", "puntos"] },
  { id: "copas", nombre: "Ranking por copas", ruta: "/secretaria/ranking-por-copas", valorBuscado: ["Ranking por copas", "Copas"] },
  { id: "condensados", nombre: "Condensados", ruta: "/secretaria/condensado-por-rubrica", valorBuscado: ["Condensados", "rúbrica"] },
  { id: "rubricas", nombre: "Rubricas", ruta: "/secretaria/rubricas", valorBuscado: ["Rubricas", "Rúbricas"] },
  { id: "sanciones", nombre: "Sanciones", ruta: "/secretaria/sanciones", valorBuscado: ["Sanciones"] },
  { id: "sanciones-aplicadas", nombre: "Sanciones aplicadas", ruta: "/secretaria/sanciones-aplicadas", valorBuscado: ["Sanciones aplicadas"] },
  { id: "solicitar-sancion", nombre: "Solicitar Sanción", ruta: "/secretaria/solicitar-sancion-administrativa", valorBuscado: ["Solicitar Sanción", "Solicitar"] },
  { id: "perfil", nombre: "Perfil", ruta: "/miPerfilPage", valorBuscado: ["Perfil", "Mi perfil", "Cuenta", "yo"] },
];

export const NAV_DEV: PaginaNavegable[] = [
  { id: "home", nombre: "Inicio", ruta: "/dev", valorBuscado: ["Inicio", "Developer", "Dev", "Home"] },
  { id: "controladores", nombre: "Controladores", ruta: "/dev/controladores", valorBuscado: ["controladores", "controlador", "permisos"] },
  {
    id: "recuperar-contrasena",
    nombre: "Recuperar contraseña",
    ruta: "/dev/recuperar-contrasena",
    valorBuscado: ["Recuperar contraseña", "contraseña", "password"],
  },
  { id: "alertas", nombre: "Alertas", ruta: "/dev/alertas", valorBuscado: ["Alertas", "duplicados", "evaluación"] },
  {
    id: "auditoria-eventos",
    nombre: "Auditoría eventos",
    ruta: "/dev/auditoria",
    valorBuscado: ["Auditoría eventos", "auditoria", "eventos en curso", "cancha", "participación"],
  },
  {
    id: "auditoria-general",
    nombre: "Auditoría general",
    ruta: "/dev/auditoria-general",
    valorBuscado: ["Auditoría general", "bitácora", "historial acciones"],
  },
  { id: "perfil", nombre: "Perfil", ruta: "/miPerfilPage", valorBuscado: ["Perfil", "Mi perfil", "Cuenta", "yo"] },
];

const NAV_POR_SECCION: Record<SeccionAtajos, PaginaNavegable[]> = {
  panel: NAV_PANEL,
  secretaria: NAV_SECRETARIA,
  dev: NAV_DEV,
};

export function obtenerPaginasPorSeccion(seccion: SeccionAtajos): PaginaNavegable[] {
  return NAV_POR_SECCION[seccion];
}

export function filtrarPaginasPorRol(paginas: PaginaNavegable[], nombreRol: string | undefined): PaginaNavegable[] {
  if (!nombreRol) return paginas;

  return paginas.filter((pagina) => {
    if (!pagina.rolesPermitidos || pagina.rolesPermitidos.length === 0) return true;
    return pagina.rolesPermitidos.includes(nombreRol);
  });
}

export function obtenerRolDesdeCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;

  const perfilCookie = document.cookie.split(";").find((c) => c.trim().startsWith("perfilActivo="));
  if (!perfilCookie) return undefined;

  try {
    const perfilBruto = decodeURIComponent(perfilCookie.split("=")[1]);
    const perfil = JSON.parse(perfilBruto) as { roles?: { nombreRol?: string } };
    return perfil.roles?.nombreRol;
  } catch {
    return undefined;
  }
}
