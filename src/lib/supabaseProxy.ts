import { perfilDatosAmpleosInterface, perfilInterface } from "@/interfaces/interfaces";
import { validarAccesoPerfil } from "@/lib/usuarios/validarAccesoPerfil";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export type RazonInvalida =
  | "no_user"
  | "usuario_no_encontrado"
  | "usuario_eliminado"
  | "sin_permisos"
  | "rol_inactivo";

export type ResultadoValidacion =
  | { ok: true; rol: string; perfil: perfilInterface }
  | { ok: false; razon: RazonInvalida };

export function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  return { supabase, response };
}

/**
 * Valida que la sesión sea coherente con la BD.
 * Nunca lanza: cualquier inconsistencia se devuelve como `{ ok: false, razon }`.
 */
export const validarSesion = async (
  idUser: string,
  request: NextRequest
): Promise<ResultadoValidacion> => {
  if (!idUser) {
    return { ok: false, razon: "no_user" };
  }

  const { supabase } = updateSession(request);

  const { data: perfil, error: errPerfil } = await supabase
    .from("perfiles")
    .select("*, roles(*)")
    .eq("idForaneaUser", idUser)
    .maybeSingle();

  if (errPerfil) {
    console.error("❌ validarSesion: error consultando perfil", errPerfil);
    return { ok: false, razon: "usuario_no_encontrado" };
  }

  if (!perfil) {
    return { ok: false, razon: "usuario_no_encontrado" };
  }

  const perfilTipado = perfil as perfilDatosAmpleosInterface;
  const acceso = validarAccesoPerfil(perfilTipado);

  if (acceso === "usuario_eliminado") {
    return { ok: false, razon: "usuario_eliminado" };
  }
  if (acceso === "sin_permisos") {
    return { ok: false, razon: "sin_permisos" };
  }
  if (acceso === "rol_inactivo") {
    return { ok: false, razon: "rol_inactivo" };
  }

  const nombreRol = perfilTipado.roles?.nombreRol ?? "";
  return { ok: true, rol: nombreRol, perfil: perfilTipado as perfilInterface };
};

/**
 * Convierte una razón a su slug de URL para `/error/<slug>`.
 */
export function razonASlug(razon: Exclude<RazonInvalida, "no_user">): string {
  switch (razon) {
    case "usuario_no_encontrado":
      return "usuario-no-encontrado";
    case "usuario_eliminado":
      return "usuario-eliminado";
    case "sin_permisos":
      return "sin-permisos";
    case "rol_inactivo":
      return "rol-inactivo";
  }
}

// ---------------------------------------------------------------------------
// API legacy: se mantiene mientras quede algún caller, pero ahora es null-safe.
// ---------------------------------------------------------------------------

const getByIdUSer = async (idUser: string, request: NextRequest): Promise<perfilInterface | null> => {
  if (!idUser) return null;
  const { supabase } = updateSession(request);
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("idForaneaUser", idUser)
    .maybeSingle();
  if (error) {
    console.error("❌ getByIdUSer error:", error);
    return null;
  }
  return (data as perfilInterface) ?? null;
};

export const perfilTienePermiso = async (idUser: string, request: NextRequest): Promise<boolean> => {
  const perfil = await getByIdUSer(idUser, request);
  if (!perfil) return false;
  return perfil.permisos === true;
};

const getRol = async (perfil: perfilInterface | null, request: NextRequest) => {
  if (!perfil || !perfil.idForaneaRol) return null;
  const { supabase } = updateSession(request);
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .eq("idRol", perfil.idForaneaRol)
    .eq("idForaneaFederacion", perfil.idForaneaFederacion)
    .maybeSingle();
  if (error) {
    console.error("❌ getRol error:", error);
    return null;
  }
  return data;
};

const tienePermisolRol = async (perfil: perfilInterface | null, request: NextRequest): Promise<boolean> => {
  const rol = await getRol(perfil, request);
  if (!rol) return false;
  return rol.estadoRol === true;
};

export const rolData = async (idUser: string, request: NextRequest) => {
  const perfil = await getByIdUSer(idUser, request);
  const dataRoll = await getRol(perfil, request);
  const rol = dataRoll?.nombreRol ?? "";
  const rolTienePrmiso = await tienePermisolRol(perfil, request);
  return { rol, rolTienePrmiso };
};
