import { dataBaseSupabase } from "@/lib/supabase";
import {   perfilDatosAmpleosInterface, respuestaSolicitudRevicionInterface, respuestaSolicitudRevicionDatosAmpleosInterface }from "@/models";
import { fromDb, fromDbMany, toDb } from "@/services/mappers/caseMapper";
import PerfilesServices from "./perfilesServices";

type Interface = respuestaSolicitudRevicionInterface;

const tabla = "respuesta_solicitud_revision";
const elId = "id_respuesta";

export default class RespuestaSolicitudRevicionesServices {

      perfil: perfilDatosAmpleosInterface | null = null;
      private perfilInitialized = false;
      
    constructor() {
        if (typeof window !== 'undefined') {
            this.initPerfil()
        }
    }
    
    async initPerfil() {
        if (typeof window === 'undefined') return;
        
        const perfilCookie = document.cookie.split(';').find(c => c.trim().startsWith('perfilActivo='));
        const perfilBruto = perfilCookie ? decodeURIComponent(perfilCookie.split('=')[1]) : null;
        if (perfilBruto) {
            this.perfil = JSON.parse(perfilBruto) as perfilDatosAmpleosInterface;
        }
        this.perfilInitialized = true;
    }

    async getDatosAmpleos(): Promise<respuestaSolicitudRevicionDatosAmpleosInterface[]> {
        try {
            const { data, error } = await dataBaseSupabase
                .from(tabla)
                .select(`
                    *,
                    federaciones(*),
                    solicitudReviciones(*),
                   perfiles(*)
                `).eq("id_foranea_federacion", this.perfil?.idForaneaFederacion)

            if (error) {
                console.error("❌ Error obteniendo regiones con federaciones:", error);
                throw error;
            }

            return fromDbMany<respuestaSolicitudRevicionDatosAmpleosInterface>(data ?? []);
        } catch (error) {
            console.error("❌ Error general en getDatosAmpleos:", error);
            throw error;
        }
    }


    async get() {
        const { data, error } = await dataBaseSupabase.from(tabla).select("*").eq("id_foranea_federacion", this.perfil?.idForaneaFederacion)
        if (error) throw error;
        return fromDbMany<respuestaSolicitudRevicionInterface>(data ?? []);
    }

    async getOne(id: string) {
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(elId, id).eq("id_foranea_federacion", this.perfil?.idForaneaFederacion)
            .single();

        if (error) throw error;
        return fromDb<respuestaSolicitudRevicionInterface>(data);
    }

    async create(dataCreate: Interface) {
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(toDb(dataCreate as unknown as Record<string, unknown>))
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<respuestaSolicitudRevicionInterface>(data);
    }

    async update(id: string, dataUpdate: Interface) {
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(toDb(dataUpdate as unknown as Record<string, unknown>))
            .eq(elId, id)
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<respuestaSolicitudRevicionInterface>(data);
    }

    async delete(id: string) {
        const { error } = await dataBaseSupabase
            .from(tabla)
            .delete()
            .eq(elId, id);

        if (error) throw error;
        return true;
    }


async getPorSolicitud(idSolicitud: string): Promise<respuestaSolicitudRevicionDatosAmpleosInterface[]> {
        try {
            const { data, error } = await dataBaseSupabase
                .from(tabla)
                .select(`
                    *,
                    federaciones(*),
                    registroCumplidos(*),
                    perfiles(*)

                `)
                .eq("id_foranea_solicitud_revision", idSolicitud)
                .eq("id_foranea_federacion", this.perfil?.idForaneaFederacion);
            if (error) {
                console.error("❌ Error obteniendo rubricas por registro cumplido:", error);
                throw error;
            }

            return fromDbMany<respuestaSolicitudRevicionDatosAmpleosInterface>(data ?? []);
        } catch (error) {
            console.error("❌ Error general en getPorRegistroCumplido:", error);
            throw error;
        }

    }
}
