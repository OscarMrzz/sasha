import { dataBaseSupabase } from "@/lib/supabase";
import { regionesDatosAmpleosInterface, regionesInterface, perfilDatosAmpleosInterface } from "@/models";
import PerfilesServices from "./perfilesServices";

type Interface = regionesInterface;

const tabla = "regiones";
const elID = "idRegion"

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
                `).eq("idForaneaFederacion", this.perfil.idForaneaFederacion)

            if (error) {
                console.error("❌ Error obteniendo regiones con federaciones:", error);
                throw error;
            }

         
            return data as regionesDatosAmpleosInterface[];
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

        try {
            if (!this.perfil) {
                throw new Error("Perfil no inicializado");
                
            }

             const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(elID , id).eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            .single();

        if (error) throw error;
        return data;
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

        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(dataCreate)
            .select("*")
            .single();

        if (error) throw error;
        return data;
    }

    async update(id: string, dataUpdate: Interface) {
        this.validarFederacionActiva(dataUpdate);

        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(dataUpdate)
            .eq(elID , id)
            .eq("idForaneaFederacion", this.perfil?.idForaneaFederacion)
            .select("*")
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string) {
        this.validarFederacionActiva();

        const { error } = await dataBaseSupabase
            .from(tabla)
            .delete()
            .eq("idRegion", id)
            .eq("idForaneaFederacion", this.perfil?.idForaneaFederacion);

        if (error) throw error;
        return true;
    }
}
