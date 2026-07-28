'use server';
import { createClientServidor } from "@/services/servidor/supabaseServidor";
import { getSupabaseAdmin } from "@/services/servidor/supabaseAdmin";
import type { perfilInterface } from "@/models";
import {
    esErrorConexionBaseDatos,
    esErrorSinInternet,
    mensajeErrorServicio,
} from "@/helpers/errores/mensajesServicio";
import {
    ROLES_PRIVILEGIADOS_USUARIOS,
    esGestorUsuariosFederacion,
    esRolRestringido,
    normalizarNombreRol,
} from "@/helpers/usuarios/rolesUsuarios";
import {
    validarBandaSegunRol,
    validarDatosAuthCrearUsuario,
    validarDatosPerfilCrearUsuario,
    validarFederacion,
    validarNombre,
    validarRol,
} from "@/helpers/usuarios/validacionesCrearUsuario";

type CreateUserOptions = {
    idForaneaRol?: string;
    idForaneaFederacion?: string;
    rolesExcluidos?: string[];
};

export type DatosPerfilNuevoUsuario = {
    nombre: string;
    primerApellido?: string;
    idForaneaRol: string;
    idForaneaFederacion: string;
    idForaneaBanda?: string | null;
    permisos: boolean;
    nombreRol?: string | null;
};

const ROLES_CON_PERMISO_CREAR_USUARIOS = [
    "developer",
    "admin",
    "admin temporal",
    "responsable de usuarios",
    "secretaria",
] as const;

const respuestaError = (message: string) => ({
    data: { user: null, perfil: null },
    error: { message },
});

const rolesExcluidosPorDefecto = (
    nombreRol: string | null | undefined,
    rolesExcluidos?: string[]
) => {
    if (rolesExcluidos?.length) return rolesExcluidos;

    if (esGestorUsuariosFederacion(nombreRol) || normalizarNombreRol(nombreRol) === "admin temporal") {
        return [...ROLES_PRIVILEGIADOS_USUARIOS];
    }

    return [];
};

async function validarPermisoInsertarPerfil(
    supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
    idForaneaRolActor: string | null | undefined,
    nombreRolActor: string | null | undefined
) {
    if (!idForaneaRolActor) {
        return respuestaError("No se pudo determinar el rol de tu perfil para validar permisos.");
    }

    const { data, error } = await supabaseAdmin
        .from("permisos")
        .select("idPermiso")
        .eq("idForaneaRol", idForaneaRolActor)
        .eq("tabla", "perfiles")
        .eq("accion", "INSERT")
        .maybeSingle();

    if (error) {
        if (esErrorSinInternet(error) || esErrorConexionBaseDatos(error)) {
            return respuestaError(mensajeErrorServicio(error, "No se pudo validar permisos sobre perfiles"));
        }
        return respuestaError(mensajeErrorServicio(error, "Error al consultar permisos sobre perfiles"));
    }

    if (!data) {
        return respuestaError(
            `Tu rol (${nombreRolActor ?? "desconocido"}) no tiene permiso para crear perfiles en la base de datos. ` +
                "No se creó ninguna cuenta. Contacta al administrador para que active el permiso INSERT en perfiles."
        );
    }

    return null;
}

function validarDatosPerfilAntesDeAuth(datosPerfil: DatosPerfilNuevoUsuario) {
    const nombre = validarNombre(datosPerfil.nombre);
    if (!nombre.valido) return respuestaError(nombre.mensaje);

    const rol = validarRol(datosPerfil.idForaneaRol);
    if (!rol.valido) return respuestaError(rol.mensaje);

    const federacion = validarFederacion(datosPerfil.idForaneaFederacion);
    if (!federacion.valido) return respuestaError(federacion.mensaje);

    const banda = validarBandaSegunRol(datosPerfil.nombreRol, datosPerfil.idForaneaBanda);
    if (!banda.valido) return respuestaError(banda.mensaje);

    return null;
}

async function validarRolDestino(
    supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
    perfilActor: {
        idForaneaFederacion: string | null;
        roles?: { nombreRol?: string | null } | null;
    },
    options: CreateUserOptions
) {
    const rolActor = normalizarNombreRol(perfilActor.roles?.nombreRol);
    const rolesExcluidos = rolesExcluidosPorDefecto(perfilActor.roles?.nombreRol, options.rolesExcluidos);

    if (!options.idForaneaRol || !options.idForaneaFederacion) {
        return respuestaError(
            "Faltan datos obligatorios: selecciona el rol y la federación del nuevo usuario."
        );
    }

    if (rolActor !== "developer" && options.idForaneaFederacion !== perfilActor.idForaneaFederacion) {
        return respuestaError("No puedes crear usuarios en otra federación.");
    }

    const { data: rolDestino, error: rolError } = await supabaseAdmin
        .from("roles")
        .select("*")
        .eq("idRol", options.idForaneaRol)
        .eq("idForaneaFederacion", options.idForaneaFederacion)
        .maybeSingle();

    if (rolError) {
        if (esErrorSinInternet(rolError) || esErrorConexionBaseDatos(rolError)) {
            return respuestaError(mensajeErrorServicio(rolError, "No se pudo validar el rol"));
        }
        return respuestaError(mensajeErrorServicio(rolError, "Error al consultar el rol seleccionado"));
    }

    if (!rolDestino || rolDestino.estadoRol === false) {
        return respuestaError("El rol seleccionado no está disponible o está inactivo.");
    }

    if (esRolRestringido(rolDestino.nombreRol, rolesExcluidos)) {
        return respuestaError("No puedes crear usuarios con ese rol.");
    }

    return null;
}

async function insertarPerfilConAdmin(
    supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
    idForaneaUser: string,
    datosPerfil: DatosPerfilNuevoUsuario
) {
    const filaPerfil = {
        nombre: datosPerfil.nombre.trim(),
        segundoNombre: "",
        primerApellido: datosPerfil.primerApellido?.trim() || "",
        segundoApellido: "",
        alias: "",
        fechaNacimiento: null,
        sexo: "",
        idForaneaFederacion: datosPerfil.idForaneaFederacion,
        identidad: "",
        numeroTelefono: "",
        direccion: "",
        idForaneaRol: datosPerfil.idForaneaRol,
        idForaneaUser,
        idForaneaBanda: datosPerfil.idForaneaBanda || null,
        permisos: datosPerfil.permisos,
        urlFotoPerfil: "",
        estado: "activo",
    };

    const { data, error } = await supabaseAdmin
        .from("perfiles")
        .insert(filaPerfil)
        .select("*")
        .single();

    if (error) {
        throw new Error(mensajeErrorServicio(error, "No se pudo guardar el perfil del usuario"));
    }

    return data as perfilInterface;
}

export async function createUser(
    email: string,
    password: string,
    options: CreateUserOptions = {},
    datosPerfil?: DatosPerfilNuevoUsuario
) {
    const validacionAuth = validarDatosAuthCrearUsuario({ email, password });
    if (!validacionAuth.valido) {
        return respuestaError(validacionAuth.mensaje);
    }

    if (!datosPerfil) {
        return respuestaError("Faltan los datos del perfil para crear el usuario.");
    }

    const errorDatosPerfil = validarDatosPerfilAntesDeAuth(datosPerfil);
    if (errorDatosPerfil) return errorDatosPerfil;

    try {
        const supabaseServidor = await createClientServidor();
        const {
            data: { user },
            error: userError,
        } = await supabaseServidor.auth.getUser();

        if (userError) {
            if (esErrorSinInternet(userError) || esErrorConexionBaseDatos(userError)) {
                return respuestaError(mensajeErrorServicio(userError, "No se pudo verificar la sesión"));
            }
            return respuestaError("No hay una sesión válida para crear usuarios. Vuelve a iniciar sesión.");
        }

        if (!user) {
            return respuestaError("No hay una sesión válida para crear usuarios. Vuelve a iniciar sesión.");
        }

        const { data: perfilActor, error: perfilError } = await supabaseServidor
            .from("perfiles")
            .select("*, roles(*)")
            .eq("idForaneaUser", user.id)
            .eq("estado", "activo")
            .maybeSingle();

        if (perfilError) {
            if (esErrorSinInternet(perfilError) || esErrorConexionBaseDatos(perfilError)) {
                return respuestaError(mensajeErrorServicio(perfilError, "No se pudo validar tu perfil"));
            }
            return respuestaError(mensajeErrorServicio(perfilError, "No se pudo validar el perfil activo"));
        }

        if (!perfilActor) {
            return respuestaError("No se encontró un perfil activo asociado a tu cuenta.");
        }

        const rolActor = normalizarNombreRol(perfilActor.roles?.nombreRol);
        const puedeCrear = ROLES_CON_PERMISO_CREAR_USUARIOS.some(
            (rol) => normalizarNombreRol(rol) === rolActor
        );

        if (!puedeCrear) {
            return respuestaError(
                `Tu rol (${perfilActor.roles?.nombreRol ?? "desconocido"}) no tiene permiso para crear usuarios.`
            );
        }

        if (perfilActor.permisos === false) {
            return respuestaError(
                "Tu usuario no tiene permisos activados. Un administrador debe activarlos antes de crear usuarios."
            );
        }

        if (!perfilActor.roles?.estadoRol) {
            return respuestaError("Tu rol está inactivo. No puedes crear usuarios hasta que se reactive.");
        }

        const supabaseAdmin = getSupabaseAdmin();

        const errorPermisoPerfil = await validarPermisoInsertarPerfil(
            supabaseAdmin,
            perfilActor.idForaneaRol,
            perfilActor.roles?.nombreRol
        );
        if (errorPermisoPerfil) return errorPermisoPerfil;

        const opcionesConPerfil: CreateUserOptions = {
            ...options,
            idForaneaRol: options.idForaneaRol ?? datosPerfil.idForaneaRol,
            idForaneaFederacion: options.idForaneaFederacion ?? datosPerfil.idForaneaFederacion,
        };

        const errorRol = await validarRolDestino(supabaseAdmin, perfilActor, opcionesConPerfil);
        if (errorRol) return errorRol;

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: email.trim(),
            password,
            email_confirm: true,
        });

        if (error) {
            return respuestaError(mensajeErrorServicio(error, "No se pudo crear la cuenta de acceso"));
        }

        const userCreadoId = data.user?.id;
        if (!userCreadoId) {
            return respuestaError("No se pudo obtener el identificador del usuario creado.");
        }

        const validacionPerfilCompleta = validarDatosPerfilCrearUsuario({
            nombre: datosPerfil.nombre,
            idForaneaRol: datosPerfil.idForaneaRol,
            idForaneaFederacion: datosPerfil.idForaneaFederacion,
            idForaneaUser: userCreadoId,
            idForaneaBanda: datosPerfil.idForaneaBanda,
            nombreRol: datosPerfil.nombreRol,
        });

        if (!validacionPerfilCompleta.valido) {
            await supabaseAdmin.auth.admin.deleteUser(userCreadoId);
            return respuestaError(validacionPerfilCompleta.mensaje);
        }

        try {
            const perfil = await insertarPerfilConAdmin(supabaseAdmin, userCreadoId, datosPerfil);
            return { data: { user: data.user, perfil }, error: null as null };
        } catch (perfilInsertError) {
            await supabaseAdmin.auth.admin.deleteUser(userCreadoId);
            const mensaje =
                perfilInsertError instanceof Error
                    ? perfilInsertError.message
                    : mensajeErrorServicio(perfilInsertError, "Error al crear el perfil del usuario");
            return respuestaError(
                `${mensaje} La cuenta de acceso no se guardó para evitar usuarios sin perfil.`
            );
        }
    } catch (error) {
        return respuestaError(mensajeErrorServicio(error, "Error inesperado al crear el usuario"));
    }
}
