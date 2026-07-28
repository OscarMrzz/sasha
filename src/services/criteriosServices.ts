import { dataBaseSupabase } from "@/lib/supabase";
import { criterioEvaluacionDatosAmpleosInterface, criterioEvaluacionInterface, perfilDatosAmpleosInterface } from "@/models";



type Interface = criterioEvaluacionInterface;

const tabla = "criteriosEvalucion";
const elId = "idCriterio";

export default class CriteriosServices   {
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



    
       


async getDatosAmpleos(): Promise<criterioEvaluacionDatosAmpleosInterface[]> {
     
    try {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select(`
                *,
                rubricas(*)
            `).eq("rubricas.idForaneaFederacion", this.perfil.idForaneaFederacion)
            

        if (error) {
            console.error("❌ Error obteniendo regiones con federaciones:", error);
            throw error;
        }


        return data as criterioEvaluacionDatosAmpleosInterface[];
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
        .from(tabla)
            .select(`
                *,
                rubricas(*)
            `).eq("rubricas.idForaneaFederacion", this.perfil.idForaneaFederacion)
     
        if (error) throw error;

        const datosEnteros = data as criterioEvaluacionDatosAmpleosInterface[];
        const datosSimples:criterioEvaluacionInterface[] = datosEnteros.map(({ rubricas, ...rest }) => rest)


        return datosSimples as criterioEvaluacionInterface[];
    }
    async getByCategoria(idCategoria: string) {
         
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
      .from(tabla)
            .select(`
                *,
                rubricas(*)
            `)
            .eq("rubricas.idForaneaCategoria", idCategoria)
            
            .eq("rubricas.idForaneaFederacion", this.perfil.idForaneaFederacion)
     
        if (error) throw error;

        const datosEnteros = data as criterioEvaluacionDatosAmpleosInterface[];
        const datosSimples:criterioEvaluacionInterface[] = datosEnteros.map(({ rubricas, ...rest }) => rest)
        return datosSimples as criterioEvaluacionInterface[];
    }

    async getOne(id: string) {
         
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(elId, id).eq("rubricas.idForaneaFederacion", this.perfil.idForaneaFederacion)
        
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
         

        if (error) throw error;
        return true;
    }
}
