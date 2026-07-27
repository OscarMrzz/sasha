import { dataBaseSupabase } from "../supabase";
import { perfilInterface, perfilDatosAmpleosInterface } from "@/interfaces/interfaces";
import { mensajeErrorServicio } from "@/lib/errores/mensajesServicio";
import {
    esGestorUsuariosFederacion,
    esRolRestringido,
    filtrarPerfilesPermitidos,
} from "@/lib/usuarios/rolesUsuarios";
import {
    validarDatosPerfilCrearUsuario,
    type DatosPerfilCrearUsuario,
} from "@/lib/usuarios/validacionesCrearUsuario";

type Interface = perfilInterface;

const tabla = "perfiles";
const elId = "idPerfil";

/** Bucket de fotos de perfil (debe coincidir con Storage en Supabase). */
export function getPerfilFotosBucketId(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_BUCKET_PERFILES || "img-fotos-perfiles-aurora";
}

/**
 * Convierte lo guardado en `perfiles.urlFotoPerfil` al path interno del bucket para `createSignedUrl`.
 * Devuelve "" si el valor ya es una URL absoluta (no se firma aquí) o está vacío.
 */
export function normalizePerfilFotoStoragePathForSigning(raw: string | null | undefined): string {
    const bucket = getPerfilFotosBucketId();
    const t = (raw ?? "").trim();
    if (!t) return "";
    if (/^https?:\/\//i.test(t) || t.startsWith("blob:") || t.startsWith("data:")) return "";
    let path = t.replace(/^\/+/, "");
    const prefix = `${bucket}/`;
    if (path.startsWith(prefix)) path = path.slice(prefix.length);
    return path;
}

export default class PerfilesServices {
         perfil: perfilDatosAmpleosInterface | null = null;
     
      
    constructor() {
       
    }

    async getDatosAmpleos(idFederacion:string,rolusuario:string): Promise<perfilDatosAmpleosInterface[]> {
           
          
        try {
            if(rolusuario==="developer"){
                
            const { data, error } = await dataBaseSupabase
                .from(tabla)
                .select(` 
                    *,
                    federaciones(*),
                    roles(*)
          
                `).eq("estado", "activo")
                .order("nombre", { ascending: true });

            if (error) {
                console.error("❌ Error obteniendo bandas con datos completos:", error);
                throw error;
            }

   
            return data as perfilDatosAmpleosInterface[];



            }else{

            
            
            const { data, error } = await dataBaseSupabase
                .from(tabla)
                .select(` 
                    *,
                    federaciones(*),
                    roles(*)
          
                `)
                .eq("idForaneaFederacion", idFederacion)
                .eq("estado", "activo")
                .order("nombre", { ascending: true });

            if (error) {
                console.error("❌ Error obteniendo bandas con datos completos:", error);
                throw error;
            }

   
            return data as perfilDatosAmpleosInterface[];
            }
        } catch (error) {
            console.error("❌ Error general en getDatosAmpleos:", error);
            throw error;
        }
    }

    async getDatosAmpleosExcluyendoRoles(
        idFederacion: string,
        rolusuario: string,
        rolesExcluidos: readonly string[]
    ): Promise<perfilDatosAmpleosInterface[]> {
        const perfiles = await this.getDatosAmpleos(idFederacion, rolusuario);
        return filtrarPerfilesPermitidos(perfiles, rolesExcluidos);
    }

    async get() {
        const { data, error } = await dataBaseSupabase.from(tabla).select("*");
        if (error) throw error;
        return data;
    }
    async getOneDatosAmpleos(id: string): Promise<perfilDatosAmpleosInterface> {
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select(`
                *,
                federaciones(*),
                roles(*)
            `)
            .eq(elId, id)
            .single();
        if (error) throw error;
        return data as perfilDatosAmpleosInterface;
    }
    async getEquipoEvaluador(idFederacion: string): Promise<perfilDatosAmpleosInterface[]> {
        const rolesPermitidos = [
            "fiscal",
            "jurado",
            "responsable de mesa",
            "comite de disciplina",
        ] as const;
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            // inner join para que el filtro por rol sea estricto
            .select("*, roles!inner(*)")
            .eq("estado", "activo")
            .eq("idForaneaFederacion", idFederacion)
            .in("roles.nombreRol", [...rolesPermitidos])
            .order("nombre", { ascending: true });
        if (error) throw error;
        return data;
    }

    async getOne(id: string) {
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(elId, id)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Carga el perfil por `auth.users.id` sin llamar a `getUser()` (útil tras sign-in para evitar carrera de sesión).
     * Devuelve `null` cuando no existe perfil para ese usuario, en lugar de lanzar.
     */
    async getPerfilPorUserId(userId: string): Promise<perfilDatosAmpleosInterface | null> {
        if (typeof window === "undefined") {
            throw new Error("No se puede obtener el perfil en el servidor");
        }
        if (!userId) return null;
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*, federaciones(*), roles(*)")
            .eq("idForaneaUser", userId)
            .maybeSingle();
        if (error) {
            console.error("❌ getPerfilPorUserId error:", error);
            return null;
        }
        return (data as perfilDatosAmpleosInterface) ?? null;
    }

    async getUsuarioLogiado(): Promise<perfilDatosAmpleosInterface > {
        if (typeof window === "undefined") {
            throw new Error("No se puede obtener el usuario logueado en el servidor");
        }

        const { data: sessionData } = await dataBaseSupabase.auth.getSession();
        const userIdFromSession = sessionData?.session?.user?.id;
        if (!userIdFromSession) {
            throw new Error("No hay usuario logueado");
        }

        const perfil = await this.getPerfilPorUserId(userIdFromSession);
        if (!perfil) throw new Error("Perfil no encontrado para el usuario logueado");
        return perfil;
    }
    async getUsuarioLogiadoBanda(): Promise<perfilDatosAmpleosInterface > {
        if (typeof window === "undefined") {
            throw new Error("No se puede obtener el usuario logueado en el servidor");
        }

        const { data: sessionData } = await dataBaseSupabase.auth.getSession();
        const userIdFromSession = sessionData?.session?.user?.id;
        if (!userIdFromSession) {
            throw new Error("No hay usuario logueado");
        }

        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*, federaciones(*), bandas(*), roles(*)")
            .eq("idForaneaUser", userIdFromSession)
            .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error("Perfil no encontrado para el usuario logueado");
        return data as perfilDatosAmpleosInterface ;
    }

    async create(dataCreate: Interface) {
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(dataCreate)
            .select("*")
            .single();

        if (error) throw error;
        return data;
    }

    async createUsuario(dataCreate: Interface, nombreRol?: string | null) {
        const validacion = validarDatosPerfilCrearUsuario({
            nombre: dataCreate.nombre,
            idForaneaRol: dataCreate.idForaneaRol ?? "",
            idForaneaFederacion: dataCreate.idForaneaFederacion ?? "",
            idForaneaUser: dataCreate.idForaneaUser ?? "",
            idForaneaBanda: dataCreate.idForaneaBanda,
            nombreRol,
        } satisfies DatosPerfilCrearUsuario);

        if (!validacion.valido) {
            throw new Error(validacion.mensaje);
        }

        try {
            const { data, error } = await dataBaseSupabase
                .from(tabla)
                .insert(dataCreate)
                .select("*")
                .single();

            if (error) {
                throw new Error(mensajeErrorServicio(error, "No se pudo guardar el perfil del usuario"));
            }

            return data;
        } catch (error) {
            if (error instanceof Error && !error.message.includes("No se pudo guardar")) {
                throw new Error(mensajeErrorServicio(error, "Error al crear el perfil del usuario"));
            }
            throw error;
        }
    }

    async update(id: string, dataUpdate: Interface) {
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(dataUpdate)
            .eq(elId, id)
            .select("*")
            .single();

        if (error) throw error;
        return data;
    }

    private async validarGestionResponsableUsuarios(
        idPerfil: string,
        rolesExcluidos: readonly string[],
        dataUpdate?: Interface
    ) {
        if (rolesExcluidos.length === 0) return;

        const perfilActivo = await this.getUsuarioLogiado();
        if (!esGestorUsuariosFederacion(perfilActivo.roles?.nombreRol)) return;

        const perfilObjetivo = await this.getOneDatosAmpleos(idPerfil);
        if (perfilObjetivo.idForaneaFederacion !== perfilActivo.idForaneaFederacion) {
            throw new Error("No puedes gestionar usuarios de otra federación.");
        }
        if (esRolRestringido(perfilObjetivo.roles?.nombreRol, rolesExcluidos)) {
            throw new Error("No puedes gestionar usuarios con roles protegidos.");
        }

        if (!dataUpdate) return;
        if (dataUpdate.idForaneaFederacion !== perfilActivo.idForaneaFederacion) {
            throw new Error("No puedes mover usuarios a otra federación.");
        }
        if (!dataUpdate.idForaneaRol) {
            throw new Error("El usuario debe tener un rol válido.");
        }

        const { data: rolDestino, error } = await dataBaseSupabase
            .from("roles")
            .select("*")
            .eq("idRol", dataUpdate.idForaneaRol)
            .eq("idForaneaFederacion", perfilActivo.idForaneaFederacion)
            .maybeSingle();

        if (error) throw error;
        if (!rolDestino || rolDestino.estadoRol === false || esRolRestringido(rolDestino.nombreRol, rolesExcluidos)) {
            throw new Error("No puedes asignar ese rol.");
        }
    }

    async updateRestringido(id: string, dataUpdate: Interface, rolesExcluidos: readonly string[]) {
        await this.validarGestionResponsableUsuarios(id, rolesExcluidos, dataUpdate);
        return this.update(id, dataUpdate);
    }
    async EliminarPerfilDeFederacion(id: string, dataUpdate: Interface) {
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(dataUpdate)
            .eq(elId, id)
            .select("*")
            .single();

        if (error) throw error;
        return data;
    }

    async delete(idForaneaUser: string) {
        const { error } = await dataBaseSupabase
            .from(tabla)
            .update({ estado: "inactivo", permisos: false })
            .eq("idForaneaUser", idForaneaUser)
         

        if (error) throw error;
        return true;
    }

    async deleteRestringido(idPerfil: string, rolesExcluidos: readonly string[]) {
        await this.validarGestionResponsableUsuarios(idPerfil, rolesExcluidos);

        const { error } = await dataBaseSupabase
            .from(tabla)
            .update({ estado: "inactivo", permisos: false })
            .eq(elId, idPerfil);

        if (error) throw error;
        return true;
    }


    private getBucketFotosPerfiles() {
        return getPerfilFotosBucketId();
    }

    async subirFotoPerfil(file: File, nombreArchivo: string): Promise<string | null> {

        const nombreFinal = `${nombreArchivo}`;
        const { data, error } = await dataBaseSupabase.storage
            .from(this.getBucketFotosPerfiles())
            .upload(nombreFinal , file, {
                cacheControl: '3600',
                upsert: true
            });
        if (error) {
            console.error("❌ Error subiendo la foto de perfil:", error);
            // Error típico cuando el bucket no existe.
            if ((error as any)?.message?.toLowerCase?.().includes("bucket not found")) {
                throw new Error(
                    `Bucket de Storage no encontrado. Crea el bucket "${this.getBucketFotosPerfiles()}" en Supabase o configura NEXT_PUBLIC_SUPABASE_BUCKET_PERFILES con el nombre correcto.`
                );
            }
            throw error;
        }
        return data.path;
    }
       

    /**
     * Resuelve `urlFotoPerfil` para mostrar en UI: URL absoluta se devuelve tal cual;
     * path de Storage se firma con `createSignedUrl`.
     */
    async obtenerUrlFotoPerfil(raw: string | null | undefined): Promise<string | null> {
        const trimmed = (raw ?? "").trim();
        if (!trimmed) return "";

        if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
            return trimmed;
        }

        const path = normalizePerfilFotoStoragePathForSigning(trimmed);
        if (!path) {
            console.warn("❌ urlFotoPerfil no se pudo normalizar para firmar:", trimmed);
            return "";
        }

        const bucket = this.getBucketFotosPerfiles();
        const { data, error } = await dataBaseSupabase.storage
            .from(bucket)
            .createSignedUrl(path, 60 * 60 * 24 * 365);

        if (error) {
            const errAny = error as { statusCode?: number; status?: string; message?: string; name?: string };
            const status = errAny.statusCode ?? errAny.status;
            console.error("❌ Error obteniendo URL de la foto de perfil:", {
                message: error.message,
                status,
                name: errAny.name,
                path,
                bucket,
                supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "(sin NEXT_PUBLIC_SUPABASE_URL)",
            });
            console.error(
                "   → Si el status es 400 u 'not found': el objeto no existe en Storage de ESTE proyecto (común: BD con paths de otro entorno). Verifica en Studio: Storage →",
                bucket,
                "→ Objects, o SQL: select name from storage.objects where bucket_id =",
                `'${bucket}'`,
                "and name =",
                `'${path}';`,
            );
            console.error(
                "   → Asegura que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY apuntan al mismo Supabase donde subiste el archivo.",
            );
            return "";
        }

        return data?.signedUrl ?? "";
    }

    async editarFotoPerfil(file: File, nombreArchivo: string): Promise<string | null> {

        const nombreFinal = `${nombreArchivo}`;
        const { data, error } = await dataBaseSupabase.storage
            .from(this.getBucketFotosPerfiles())
            .update(nombreFinal , file, {
                cacheControl: '3600',
                upsert: true
            });
        if (error) {
            console.error("❌ Error editando la foto de perfil:", error);
            if ((error as any)?.message?.toLowerCase?.().includes("bucket not found")) {
                throw new Error(
                    `Bucket de Storage no encontrado. Crea el bucket "${this.getBucketFotosPerfiles()}" en Supabase o configura NEXT_PUBLIC_SUPABASE_BUCKET_PERFILES con el nombre correcto.`
                );
            }
            throw error;
        }
        return data.path;
    }

    async cambiarURLFotoPerfil(idForaneaUser: string, urlFotoPerfil: string) {
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update({ urlFotoPerfil })
            .eq("idForaneaUser", idForaneaUser)
            .select("*")
            .single();

        if (error) throw error;
        return data;
    }
}
