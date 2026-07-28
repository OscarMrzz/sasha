import { dataBaseSupabase } from "@/lib/supabase";
import { regionesDatosAmpleosInterface, regionesInterface, perfilDatosAmpleosInterface } from "@/models";
import { regionesInsertSchema, regionesUpdateSchema } from "@/models/regiones/regionesSchema";
import { fromDb, fromDbMany, toDb } from "@/services/mappers/caseMapper";
import { parseCamel } from "@/services/mappers/parseCamel";
import PerfilesServices from "./perfilesServices";

type Interface = regionesInterface;

const tabla = "regiones";
const elID = "id_region"

export default class RegionService {
     perfil: perfilDatosAmpleosInterface | null = null;
     
      
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
    }
   
    async getDatosAmpleos(): Promise<regionesDatosAmpleosInterface[]> {
        try {
             
            if (!this.perfil) {
                throw new Error("Perfil no inicializado");
            }

            const { data, error } = await dataBaseSupabase
                .from(tabla)
                .select(`
                    *,
                    federaciones(*)
                `).eq("id_foranea_federacion", this.perfil.idForaneaFederacion)

            if (error) {
                console.error("❌ Error obteniendo regiones con federaciones:", error);
                throw error;
            }

         
            return fromDbMany<regionesDatosAmpleosInterface>(data ?? []);
        } catch (error) {
            console.error("❌ Error general en getDatosAmpleos:", error);
            throw error;
        }
    }

    async get() {
        const { data, error } = await dataBaseSupabase.from(tabla).select("*").eq("id_foranea_federacion", this.perfil?.idForaneaFederacion)
        if (error) throw error;
        return fromDbMany<regionesInterface>(data ?? []);
    }

    async getOne(id: string) {

        try {
            if (!this.perfil) {
                throw new Error("Perfil no inicializado");
                
            }

             const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(elID , id).eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .single();

        if (error) throw error;
        return fromDb<regionesInterface>(data);
    }
        catch (error) {
            console.error("❌ Error general en getOne:", error);
            throw error;
        }
    }

    private validarFederacionActiva(data?: Partial<Interface>) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }

        if (data?.idForaneaFederacion && data.idForaneaFederacion !== this.perfil.idForaneaFederacion) {
            throw new Error("No puedes gestionar regiones de otra federación.");
        }
    }
       

    async create(dataCreate: Interface) {
        this.validarFederacionActiva(dataCreate);

        const parsed = parseCamel(regionesInsertSchema, dataCreate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(toDb(parsed as Record<string, unknown>))
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<regionesInterface>(data);
    }

    async update(id: string, dataUpdate: Interface) {
        this.validarFederacionActiva(dataUpdate);

        const parsed = parseCamel(regionesUpdateSchema, dataUpdate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(toDb(parsed as Record<string, unknown>))
            .eq(elID , id)
            .eq("id_foranea_federacion", this.perfil?.idForaneaFederacion)
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<regionesInterface>(data);
    }

    async delete(id: string) {
        this.validarFederacionActiva();

        const { error } = await dataBaseSupabase
            .from(tabla)
            .delete()
            .eq("id_region", id)
            .eq("id_foranea_federacion", this.perfil?.idForaneaFederacion);

        if (error) throw error;
        return true;
    }
}
