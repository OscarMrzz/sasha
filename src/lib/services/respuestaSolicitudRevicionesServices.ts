import { dataBaseSupabase } from "../supabase";
import {   perfilDatosAmpleosInterface, respuestaSolicitudRevicionInterface, respuestaSolicitudRevicionDatosAmpleosInterface }from "@/interfaces/interfaces";
import PerfilesServices from "./perfilesServices";

type Interface = respuestaSolicitudRevicionInterface;

const tabla = "respuestaSolicitudRevicion";
const elId = "idRespuesta";

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
                `).eq("idForaneaFederacion", this.perfil?.idForaneaFederacion)

            if (error) {
                console.error("❌ Error obteniendo regiones con federaciones:", error);
                throw error;
            }

            return data as respuestaSolicitudRevicionDatosAmpleosInterface[];
        } catch (error) {
            console.error("❌ Error general en getDatosAmpleos:", error);
            throw error;
        }
    }


    async get() {
        const { data, error } = await dataBaseSupabase.from(tabla).select("*").eq("idForaneaFederacion", this.perfil?.idForaneaFederacion)
        if (error) throw error;
        return data;
    }

    async getOne(id: string) {
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(elId, id).eq("idForaneaFederacion", this.perfil?.idForaneaFederacion)
            .single();

        if (error) throw error;
        return data;
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
                .eq("idForaneaidForaneaSolicitudRevicion",idSolicitud)
                .eq("idForaneaFederacion", this.perfil?.idForaneaFederacion);
            if (error) {
                console.error("❌ Error obteniendo rubricas por registro cumplido:", error);
                throw error;
            }

            return data as respuestaSolicitudRevicionDatosAmpleosInterface[];
        } catch (error) {
            console.error("❌ Error general en getPorRegistroCumplido:", error);
            throw error;
        }

    }
}
