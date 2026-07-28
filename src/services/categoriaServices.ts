import { dataBaseSupabase } from "@/lib/supabase";
import { categoriaDatosAmpleosInterface, categoriaInterface, perfilDatosAmpleosInterface, perfilInterface } from "@/models";
import { categoriaInsertSchema, categoriaUpdateSchema } from "@/models/categorias/categoriaSchema";
import { fromDb, fromDbMany, toDb } from "@/services/mappers/caseMapper";
import { parseCamel } from "@/services/mappers/parseCamel";
import PerfilesServices from "./perfilesServices";



type Interface = categoriaInterface;

const tabla = "categorias";
const elId = "id_categoria";

export default class CategoriasServices   {
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
}

    
       

    // 🔹 Trae regiones con su federación (join automático)
async getDatosAmpleos(): Promise<categoriaDatosAmpleosInterface[]> {
    
    try {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select(`
                *,
                federaciones(*)
            `)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) {
            console.error("❌ Error obteniendo regiones con federaciones:", error);
            throw error;
        }

      
        return fromDbMany<categoriaDatosAmpleosInterface>(data ?? []);
    } catch (error) {
        console.error("❌ Error general en getDatosAmpleos:", error);
        throw error;
    }
}

    async get() {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
        .from(tabla).select("*")
        .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);
        if (error) throw error;

        return fromDbMany<categoriaInterface>(data ?? []);
    }

    async getOne(id: string) {
      
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(elId, id)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .single();

        if (error) throw error;
        return fromDb<categoriaInterface>(data);
    }


    async create(dataCreate: Interface) {

        if (!this.perfil || !this.perfil.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const parsed = parseCamel(categoriaInsertSchema, dataCreate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(toDb(parsed as Record<string, unknown>))
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single()

        if (error) throw error;
        return fromDb<categoriaInterface>(data);
    }

    async update(id: string, dataUpdate: Interface) {
   
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const parsed = parseCamel(categoriaUpdateSchema, dataUpdate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(toDb(parsed as Record<string, unknown>))
            .eq(elId, id)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<categoriaInterface>(data);
    }

    async delete(id: string) {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { error } = await dataBaseSupabase
            .from(tabla)
            .delete()
            .eq(elId, id)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;
        return true;
    }
}
