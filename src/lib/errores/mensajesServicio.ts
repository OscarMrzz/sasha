type ErrorLike = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
  name?: string;
  status?: number;
};

const TEXTO_ERROR = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as ErrorLike).message;
    if (typeof message === "string") return message;
  }
  return "";
};

const CODIGO_ERROR = (error: unknown): string => {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as ErrorLike).code;
    if (typeof code === "string") return code;
  }
  return "";
};

const TEXTO_NORMALIZADO = (error: unknown): string => TEXTO_ERROR(error).trim().toLowerCase();

export function esErrorSinInternet(error: unknown): boolean {
  const texto = TEXTO_NORMALIZADO(error);
  const name = error instanceof Error ? error.name : (error as ErrorLike)?.name;

  return (
    name === "TypeError" ||
    texto.includes("failed to fetch") ||
    texto.includes("fetch failed") ||
    texto.includes("networkerror") ||
    texto.includes("network request failed") ||
    texto.includes("err_internet_disconnected") ||
    texto.includes("load failed") ||
    texto.includes("net::err_")
  );
}

export function esErrorConexionBaseDatos(error: unknown): boolean {
  const texto = TEXTO_NORMALIZADO(error);
  const codigo = CODIGO_ERROR(error);
  const status = (error as ErrorLike)?.status;

  return (
    codigo === "PGRST000" ||
    codigo === "PGRST002" ||
    codigo === "08006" ||
    codigo === "08001" ||
    codigo === "57P01" ||
    status === 503 ||
    status === 504 ||
    texto.includes("connection") ||
    texto.includes("conexion") ||
    texto.includes("econnrefused") ||
    texto.includes("etimedout") ||
    texto.includes("timeout") ||
    texto.includes("database") ||
    texto.includes("postgres") ||
    texto.includes("servidor no disponible")
  );
}

export function esErrorPermisos(error: unknown): boolean {
  const texto = TEXTO_NORMALIZADO(error);
  const codigo = CODIGO_ERROR(error);

  return (
    codigo === "42501" ||
    codigo === "PGRST301" ||
    texto.includes("permission denied") ||
    texto.includes("not authorized") ||
    texto.includes("row-level security") ||
    texto.includes("violates row-level security") ||
    texto.includes("revisar_permisos") ||
    texto.includes("no tienes permiso") ||
    texto.includes("insufficient privilege")
  );
}

const TRADUCCIONES_AUTH: Record<string, string> = {
  "user already registered":
    "Ya existe un usuario registrado con ese correo electrónico. Usa otro correo o recupera la cuenta existente.",
  "email address is invalid": "El correo electrónico no tiene un formato válido.",
  "password should be at least 6 characters":
    "La contraseña debe tener al menos 6 caracteres.",
  "signup requires a valid password": "Debes indicar una contraseña válida.",
  "invalid login credentials": "Las credenciales no son válidas.",
};

function traducirMensajeAuth(mensaje: string): string | null {
  const normalizado = mensaje.trim().toLowerCase();
  for (const [clave, traduccion] of Object.entries(TRADUCCIONES_AUTH)) {
    if (normalizado.includes(clave)) return traduccion;
  }
  return null;
}

export function mensajeErrorServicio(error: unknown, contexto: string): string {
  if (esErrorSinInternet(error)) {
    return "No hay conexión a internet. Revisa tu red e inténtalo de nuevo.";
  }

  if (esErrorConexionBaseDatos(error)) {
    return "No se pudo conectar con la base de datos. Intenta de nuevo en unos momentos.";
  }

  if (esErrorPermisos(error)) {
    return "Tu rol no tiene permiso para realizar esta acción. Si crees que es un error, contacta al administrador.";
  }

  const mensaje = TEXTO_ERROR(error);
  if (mensaje) {
    const traduccionAuth = traducirMensajeAuth(mensaje);
    if (traduccionAuth) return traduccionAuth;
    return `${contexto}: ${mensaje}`;
  }

  if (error && typeof error === "object") {
    const partes = [contexto];
    for (const key of ["details", "hint", "code"] as const) {
      const valor = (error as ErrorLike)[key];
      if (typeof valor === "string" && valor.trim()) partes.push(valor.trim());
    }
    if (partes.length > 1) return partes.join(" · ");
  }

  return `${contexto}. Revisa tu conexión o permisos e inténtalo de nuevo.`;
}
