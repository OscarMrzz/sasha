import { dataBaseSupabase } from "@/lib/supabase";
import {   perfilDatosAmpleosInterface, solicitudRevicionInterface, solicitudRevicionDatosAmpleosInterface, vistaSolicitudRevicionInterface } from "@/models";
import PerfilesServices from "./perfilesServices";

type Interface = solicitudRevicionInterface;

const tabla = "solicitudRevicion";
const elId = "idSolicitud";

export default class SolicitudRevicionServices {

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

    async getDatosAmpleos(): Promise<solicitudRevicionDatosAmpleosInterface[]> {
        try {
            const { data, error } = await dataBaseSupabase
                .from(tabla)
                .select(`
                    *,
                    federaciones(*),
                   perfiles(*),
                   registroCumplimientos(*)
                `).eq("idForaneaFederacion", this.perfil?.idForaneaFederacion)

            if (error) {
                console.error("❌ Error obteniendo regiones con federaciones:", error);
                throw error;
            }

            return data as solicitudRevicionDatosAmpleosInterface[];
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
    async getVista() {
        const { data, error } = await dataBaseSupabase.from("vista_solicitud_revicion").select("*").eq("idForaneaFederacion", this.perfil?.idForaneaFederacion)
        if (error) throw error;
        return data as vistaSolicitudRevicionInterface[];
    }

    async getVistaPendientesDelDiaPorEventos(
        idsEventos: string[],
        fechaLocalISO: string,
    ): Promise<vistaSolicitudRevicionInterface[]> {
        if (idsEventos.length === 0) return [];

        const [year, month, day] = fechaLocalISO.split("-").map(Number);
        const inicioDia = new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
        const finDia = new Date(year, month - 1, day + 1, 0, 0, 0, 0).toISOString();

        const { data, error } = await dataBaseSupabase
            .from("vista_solicitud_revicion")
            .select("*")
            .eq("idForaneaFederacion", this.perfil?.idForaneaFederacion)
            .in("idForaneaEvento", idsEventos)
            .eq("estado", "pendiente")
            .gte("created_at", inicioDia)
            .lt("created_at", finDia);

        if (error) throw error;
        return data as vistaSolicitudRevicionInterface[];
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


async getPorRegistroCumplido(idRegistroCumplido: string): Promise<solicitudRevicionDatosAmpleosInterface[]> {
        try {
            const { data, error } = await dataBaseSupabase
                .from(tabla)
                .select(`
                    *,
                    federaciones(*),
                    registroCumplimientos(*),
                    perfiles(*)

                `)
                .eq("idForaneaRegistroCumplimiento", idRegistroCumplido)
                .eq("idForaneaFederacion", this.perfil?.idForaneaFederacion);
            if (error) {
                console.error("❌ Error obteniendo rubricas por registro cumplido:", error);
                throw error;
            }

            return data as solicitudRevicionDatosAmpleosInterface[];
        } catch (error) {
            console.error("❌ Error general en getPorRegistroCumplido:", error);
            throw error;
        }

    }
}
