import {
  esErrorConexionBaseDatos,
  esErrorPermisos,
  esErrorSinInternet,
} from "@/lib/errores/mensajesServicio";
import erroresBandas from "./erroresBandas.json";

export const ACCION_BANDA = {
  EDICION: "edicion",
  LOGO: "logo",
  CREACION: "creacion",
  ELIMINACION: "eliminacion",
} as const;

export type AccionBanda = (typeof ACCION_BANDA)[keyof typeof ACCION_BANDA];

type ErrorLike = {
  code?: string;
  message?: string;
};

const CODIGO_ERROR = (error: unknown): string => {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as ErrorLike).code;
    if (typeof code === "string") return code;
  }
  return "";
};

const TEXTO_ERROR = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as ErrorLike).message;
    if (typeof message === "string") return message;
  }
  return "";
};

export class BandaServicioError extends Error {
  readonly accion: AccionBanda;
  readonly codigo: string;

  constructor(accion: AccionBanda, codigo: string) {
    super(`${accion}:${codigo}`);
    this.accion = accion;
    this.codigo = codigo;
    this.name = "BandaServicioError";
  }
}

function resolverMensajeBanda(accion: AccionBanda, codigo: string): string {
  const seccion = erroresBandas[accion] as Record<string, string> | undefined;
  if (!seccion || Object.keys(seccion).length === 0) {
    return erroresBandas.edicion.desconocido;
  }
  const mensaje = seccion[codigo];
  if (typeof mensaje === "string" && mensaje.length > 0) return mensaje;
  const fallback = seccion.desconocido;
  if (typeof fallback === "string" && fallback.length > 0) return fallback;
  return erroresBandas.edicion.desconocido;
}

function esArchivoInvalido(error: unknown): boolean {
  const texto = TEXTO_ERROR(error).toLowerCase();
  const codigo = CODIGO_ERROR(error);
  return (
    codigo === "InvalidMimeType" ||
    codigo === "invalid_mime_type" ||
    texto.includes("mime") ||
    texto.includes("invalid file") ||
    texto.includes("archivo") ||
    texto.includes("payload too large") ||
    texto.includes("entity too large")
  );
}

export function clasificarErrorBanda(error: unknown, accion: AccionBanda): string {
  if (error instanceof BandaServicioError) return error.codigo;

  if (esErrorSinInternet(error)) return "sin_internet";
  if (esErrorConexionBaseDatos(error)) return "sin_conexion_servidor";
  if (esErrorPermisos(error)) return "permiso_denegado";

  if (accion === ACCION_BANDA.LOGO && esArchivoInvalido(error)) {
    return "archivo_invalido";
  }

  if (accion === ACCION_BANDA.EDICION && CODIGO_ERROR(error) === "PGRST116") {
    return "banda_no_encontrada";
  }

  return "desconocido";
}

function manejoErrorBanda(error: unknown, accionPorDefecto: AccionBanda): string {
  if (error instanceof BandaServicioError) {
    return resolverMensajeBanda(error.accion, error.codigo);
  }
  const codigo = clasificarErrorBanda(error, accionPorDefecto);
  return resolverMensajeBanda(accionPorDefecto, codigo);
}

export function manejoErrorEdicionBanda(error: unknown): string {
  return manejoErrorBanda(error, ACCION_BANDA.EDICION);
}

export function manejoErrorLogoBanda(error: unknown): string {
  return manejoErrorBanda(error, ACCION_BANDA.LOGO);
}
