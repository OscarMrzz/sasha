import { dataBaseSupabase } from "@/lib/supabase";
import { cumplimientosDatosAmpleosInterface, cumplimientosInterface, perfilDatosAmpleosInterface } from "@/models";
import { cumplimientosInsertSchema, cumplimientosUpdateSchema } from "@/models/cumplimientos/cumplimientosSchema";
import { fromDb, fromDbMany, toDb } from "@/services/mappers/caseMapper";
import { parseCamel } from "@/services/mappers/parseCamel";



type Interface = cumplimientosInterface;

const tabla = "cumplimientos";
const elId = "id_cumplimiento";

export default class cumplimientossServices   {
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

    
       

    // 🔹 Trae regiones con su federación (join automático)
async getDatosAmpleos(): Promise<cumplimientosDatosAmpleosInterface[]> {
   
    try {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vistacumplimientoscondatosampleosidforaneafederacion")
            .select(`
                id_cumplimiento,
                created_at,
                detalle_cumplimiento,
                puntos_cumplimiento,
                id_foranea_criterio,
                id_criterio,
                nombre_criterio,
                detalles_criterio,
                puntos_criterio,
                id_foranea_rubrica
               
            `)
            .eq('id_foranea_federacion', this.perfil.idForaneaFederacion)


        if (error) {
            console.error("❌ Error obteniendo regiones con cumplimientos:", error);
            throw error;
        }

       
        return fromDbMany<cumplimientosDatosAmpleosInterface>(data ?? []);
    } catch (error) {
        console.error("❌ Error general en getDatosAmpleos:", error);
        throw error;
    }
}
async getByIdCriterio(idCriterio: string): Promise<cumplimientosDatosAmpleosInterface[]> {
   
    try {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vistacumplimientoscondatosampleosidforaneafederacion")
            .select(`
                id_cumplimiento,
                created_at,
                detalle_cumplimiento,
                puntos_cumplimiento,
                id_foranea_criterio,
                id_criterio,
                nombre_criterio,
                detalles_criterio,
                puntos_criterio,
                id_foranea_rubrica
               
            `)
            .eq('id_foranea_federacion', this.perfil.idForaneaFederacion)
            .eq('id_foranea_criterio', idCriterio).order('puntos_cumplimiento', { ascending: true });


        if (error) {
            console.error("❌ Error obteniendo regiones con cumplimientos:", error);
            throw error;
        }

    

       
        return fromDbMany<cumplimientosDatosAmpleosInterface>(data ?? []);
    } catch (error) {
        console.error("❌ Error general en getByIdCriterio:", error);
        throw error;
    }
}

    async get() {
       
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
        .from("vistacumplimientosconidforaneafederacion")
            .select(`
                id_cumplimiento,
                created_at,
                detalle_cumplimiento,
                puntos_cumplimiento,
                id_foranea_criterio
                
            `) 
        
        
        .eq('id_foranea_federacion', this.perfil.idForaneaFederacion)
    
        if (error) throw error;
        return fromDbMany<cumplimientosInterface>(data ?? []);
    }
    async getPorCriterio(idCriterio: string) {
       
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
        .from("vistacumplimientosconidforaneafederacion")
            .select(`
                id_cumplimiento,
                created_at,
                detalle_cumplimiento,
                puntos_cumplimiento,
                id_foranea_criterio
                
            `) 
        
        
        .eq('id_foranea_federacion', this.perfil.idForaneaFederacion)
        .eq('id_foranea_criterio', idCriterio);
    
        if (error) throw error;
    return fromDbMany<cumplimientosInterface>(data ?? []);
    }

    async getOne(id: string) {
       
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vistacumplimientosconidforaneafederacion")
            .select("*")
            .eq(elId, id)
            .eq('id_foranea_federacion', this.perfil.idForaneaFederacion)
           
            .single();

        if (error) throw error;
        return fromDb<cumplimientosInterface>(data);
    }


    async create(dataCreate: Interface) {
       
        if (!this.perfil || !this.perfil.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const parsed = parseCamel(cumplimientosInsertSchema, dataCreate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(toDb(parsed as Record<string, unknown>))
       
            .select("*")
            .single()

        if (error) throw error;
        return fromDb<cumplimientosInterface>(data);
    }

    async update(id: string, dataUpdate: Interface) {
       
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const parsed = parseCamel(cumplimientosUpdateSchema, dataUpdate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(toDb(parsed as Record<string, unknown>))
            .eq(elId, id)
      
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<cumplimientosInterface>(data);
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
