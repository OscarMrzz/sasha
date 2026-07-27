import { dataBaseSupabase } from "../supabase";
import { categoriaDatosAmpleosInterface, categoriaInterface, perfilDatosAmpleosInterface, perfilInterface } from "@/interfaces/interfaces";
import PerfilesServices from "./perfilesServices";



type Interface = categoriaInterface;

const tabla = "categorias";
const elId = "idCategoria";

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
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion);

        if (error) {
            console.error("❌ Error obteniendo regiones con federaciones:", error);
            throw error;
        }

      
        return data as categoriaDatosAmpleosInterface[];
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
        .eq("idForaneaFederacion", this.perfil.idForaneaFederacion);
        if (error) throw error;

        return data;
    }

    async getOne(id: string) {
      
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(elId, id)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            .single();

        if (error) throw error;
        return data;
    }


    async create(dataCreate: Interface) {

        if (!this.perfil || !this.perfil.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(dataCreate)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single()

        if (error) throw error;
        return data;
    }

    async update(id: string, dataUpdate: Interface) {
   
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(dataUpdate)
            .eq(elId, id)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single();

        if (error) throw error;
        return data;
    }

    async delete(id: string) {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { error } = await dataBaseSupabase
            .from(tabla)
            .delete()
            .eq(elId, id)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion);

        if (error) throw error;
        return true;
    }
}
