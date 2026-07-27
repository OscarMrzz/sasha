import { dataBaseSupabase } from "../supabase";
import { cumplimientosDatosAmpleosInterface, cumplimientosInterface, perfilDatosAmpleosInterface } from "@/interfaces/interfaces";



type Interface = cumplimientosInterface;

const tabla = "cumplimientos";
const elId = "idCumplimiento";

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
                idCumplimiento,
                created_at,
                detalleCumplimiento,
                puntosCumplimiento,
                idForaneaCriterio,
                idCriterio,
                nombreCriterio,
                detallesCriterio,
                puntosCriterio,
                idForaneaRubrica
               
            `)
            .eq('idForaneaFederacion', this.perfil.idForaneaFederacion)


        if (error) {
            console.error("❌ Error obteniendo regiones con cumplimientos:", error);
            throw error;
        }

       
        return data as cumplimientosDatosAmpleosInterface[];
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
                idCumplimiento,
                created_at,
                detalleCumplimiento,
                puntosCumplimiento,
                idForaneaCriterio,
                idCriterio,
                nombreCriterio,
                detallesCriterio,
                puntosCriterio,
                idForaneaRubrica
               
            `)
            .eq('idForaneaFederacion', this.perfil.idForaneaFederacion)
            .eq('idForaneaCriterio', idCriterio).order('puntosCumplimiento', { ascending: true });


        if (error) {
            console.error("❌ Error obteniendo regiones con cumplimientos:", error);
            throw error;
        }

    

       
        return data as cumplimientosDatosAmpleosInterface[];
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
                idCumplimiento,
                created_at,
                detalleCumplimiento,
                puntosCumplimiento,
                idForaneaCriterio
                
            `) 
        
        
        .eq('idForaneaFederacion', this.perfil.idForaneaFederacion)
    
        if (error) throw error;
        return data;
    }
    async getPorCriterio(idCriterio: string) {
       
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
        .from("vistacumplimientosconidforaneafederacion")
            .select(`
                idCumplimiento,
                created_at,
                detalleCumplimiento,
                puntosCumplimiento,
                idForaneaCriterio
                
            `) 
        
        
        .eq('idForaneaFederacion', this.perfil.idForaneaFederacion)
        .eq('idForaneaCriterio', idCriterio);
    
        if (error) throw error;
    return data as cumplimientosInterface[];
    }

    async getOne(id: string) {
       
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vistacumplimientosconidforaneafederacion")
            .select("*")
            .eq(elId, id)
            .eq('idForaneaFederacion', this.perfil.idForaneaFederacion)
           
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
