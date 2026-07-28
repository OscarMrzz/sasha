import { dataBaseSupabase } from "@/lib/supabase";
import { criterioEvaluacionDatosAmpleosInterface, criterioEvaluacionInterface, perfilDatosAmpleosInterface } from "@/models";
import { criterioEvaluacionInsertSchema, criterioEvaluacionUpdateSchema } from "@/models/criterios/criterioEvaluacionSchema";
import { fromDb, fromDbMany, toDb } from "@/services/mappers/caseMapper";
import { parseCamel } from "@/services/mappers/parseCamel";



type Interface = criterioEvaluacionInterface;

const tabla = "criterios_evaluacion";
const elId = "id_criterio";

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
            `).eq("rubricas.id_foranea_federacion", this.perfil.idForaneaFederacion)
            

        if (error) {
            console.error("❌ Error obteniendo regiones con federaciones:", error);
            throw error;
        }


        return fromDbMany<criterioEvaluacionDatosAmpleosInterface>(data ?? []);
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
            `).eq("rubricas.id_foranea_federacion", this.perfil.idForaneaFederacion)
     
        if (error) throw error;

        const datosEnteros = fromDbMany<criterioEvaluacionDatosAmpleosInterface>(data ?? []);
        const datosSimples:criterioEvaluacionInterface[] = datosEnteros.map(({ rubricas, ...rest }) => rest)


        return datosSimples;
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
            .eq("rubricas.id_foranea_categoria", idCategoria)
            
            .eq("rubricas.id_foranea_federacion", this.perfil.idForaneaFederacion)
     
        if (error) throw error;

        const datosEnteros = fromDbMany<criterioEvaluacionDatosAmpleosInterface>(data ?? []);
        const datosSimples:criterioEvaluacionInterface[] = datosEnteros.map(({ rubricas, ...rest }) => rest)
        return datosSimples;
    }

    async getOne(id: string) {
         
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(elId, id).eq("rubricas.id_foranea_federacion", this.perfil.idForaneaFederacion)
        
            .single();

        if (error) throw error;
        return fromDb<criterioEvaluacionInterface>(data);
    }


    async create(dataCreate: Interface) {
         
        if (!this.perfil || !this.perfil.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const parsed = parseCamel(criterioEvaluacionInsertSchema, dataCreate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(toDb(parsed as Record<string, unknown>))
          
            .select("*")
            .single()

        if (error) throw error;
        return fromDb<criterioEvaluacionInterface>(data);
    }

    async update(id: string, dataUpdate: Interface) {
         
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const parsed = parseCamel(criterioEvaluacionUpdateSchema, dataUpdate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(toDb(parsed as Record<string, unknown>))
            .eq(elId, id)
        
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<criterioEvaluacionInterface>(data);
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
