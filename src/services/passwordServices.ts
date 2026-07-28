"use server";

import { createClientServidor } from "@/services/servidor/supabaseServidor";
import { getSupabaseAdmin } from "@/services/servidor/supabaseAdmin";
import {
    esErrorConexionBaseDatos,
    esErrorSinInternet,
    mensajeErrorServicio,
} from "@/helpers/errores/mensajesServicio";
import { normalizarNombreRol } from "@/helpers/usuarios/rolesUsuarios";
import { validarPassword } from "@/helpers/usuarios/validacionesCrearUsuario";
import { fromDb } from "@/services/mappers/caseMapper";

/** Autorización por rol de aplicación; auth.users no usa RLS de public.permisos. */
const ROLES_CON_PERMISO_RESTABLECER = ["developer", "admin"] as const;

export type CorreoUsuario = {
    id: string;
    email: string;
};

const respuestaError = <T>(message: string) => ({
    data: null as T,
    error: { message },
});

type PerfilActor = {
    permisos: boolean | null;
    roles: { nombreRol: string; estadoRol: boolean } | { nombreRol: string; estadoRol: boolean }[] | null;
};

function rolDesdePerfil(perfil: PerfilActor) {
    const roles = perfil.roles;
    if (!roles) return null;
    return Array.isArray(roles) ? roles[0] ?? null : roles;
}

async function validarActorRestablecer() {
    const supabaseServidor = await createClientServidor();
    const {
        data: { user },
        error: userError,
    } = await supabaseServidor.auth.getUser();

    if (userError) {
        if (esErrorSinInternet(userError) || esErrorConexionBaseDatos(userError)) {
            return { ok: false as const, error: mensajeErrorServicio(userError, "No se pudo verificar la sesión") };
        }
        return { ok: false as const, error: "No hay una sesión válida. Vuelve a iniciar sesión." };
    }

    if (!user) {
        return { ok: false as const, error: "No hay una sesión válida. Vuelve a iniciar sesión." };
    }

    const { data: perfilActor, error: perfilError } = await supabaseServidor
        .from("perfiles")
        .select("permisos, roles(nombre_rol, estado_rol)")
        .eq("id_foranea_user", user.id)
        .eq("estado", "activo")
        .maybeSingle();

    if (perfilError) {
        if (esErrorSinInternet(perfilError) || esErrorConexionBaseDatos(perfilError)) {
            return { ok: false as const, error: mensajeErrorServicio(perfilError, "No se pudo validar tu perfil") };
        }
        return { ok: false as const, error: mensajeErrorServicio(perfilError, "No se pudo validar el perfil activo") };
    }

    if (!perfilActor) {
        return { ok: false as const, error: "No se encontró un perfil activo asociado a tu cuenta." };
    }

    const perfil = fromDb<PerfilActor>(perfilActor);
    const rol = rolDesdePerfil(perfil);
    const rolActor = normalizarNombreRol(rol?.nombreRol);
    const puedeRestablecer = ROLES_CON_PERMISO_RESTABLECER.some(
        (rol) => normalizarNombreRol(rol) === rolActor
    );

    if (!puedeRestablecer) {
        return {
            ok: false as const,
            error: `Tu rol (${rol?.nombreRol ?? "desconocido"}) no tiene permiso para restablecer contraseñas.`,
        };
    }

    if (perfil.permisos === false) {
        return {
            ok: false as const,
            error: "Tu usuario no tiene permisos activados. Un administrador debe activarlos antes de usar esta función.",
        };
    }

    if (!rol?.estadoRol) {
        return { ok: false as const, error: "Tu rol está inactivo. No puedes restablecer contraseñas hasta que se reactive." };
    }

    return { ok: true as const };
}

export async function listarCorreosUsuarios() {
    const validacion = await validarActorRestablecer();
    if (!validacion.ok) {
        return respuestaError<CorreoUsuario[]>(validacion.error);
    }

    try {
        const supabaseAdmin = getSupabaseAdmin();
        const correos: CorreoUsuario[] = [];
        let page = 1;
        const perPage = 1000;

        while (true) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });

            if (error) {
                return respuestaError<CorreoUsuario[]>(
                    mensajeErrorServicio(error, "No se pudo obtener la lista de correos")
                );
            }

            const usuarios = data.users ?? [];
            for (const usuario of usuarios) {
                if (usuario.email) {
                    correos.push({ id: usuario.id, email: usuario.email });
                }
            }

            if (usuarios.length < perPage) break;
            page += 1;
        }

        correos.sort((a, b) => a.email.localeCompare(b.email, "es", { sensitivity: "base" }));

        return { data: correos, error: null as null };
    } catch (error) {
        return respuestaError<CorreoUsuario[]>(
            mensajeErrorServicio(error, "Error inesperado al listar correos")
        );
    }
}

export async function restablecerContrasenaUsuario(userId: string, password: string) {
    const validacionPassword = validarPassword(password);
    if (!validacionPassword.valido) {
        return respuestaError<{ ok: true }>(validacionPassword.mensaje);
    }

    const id = userId?.trim();
    if (!id) {
        return respuestaError<{ ok: true }>("Debes seleccionar un usuario.");
    }

    const validacion = await validarActorRestablecer();
    if (!validacion.ok) {
        return respuestaError<{ ok: true }>(validacion.error);
    }

    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { password });

        if (error) {
            return respuestaError<{ ok: true }>(
                mensajeErrorServicio(error, "No se pudo restablecer la contraseña")
            );
        }

        return { data: { ok: true as const }, error: null as null };
    } catch (error) {
        return respuestaError<{ ok: true }>(
            mensajeErrorServicio(error, "Error inesperado al restablecer la contraseña")
        );
    }
}
