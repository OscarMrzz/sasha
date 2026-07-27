 import { dataBaseSupabase } from "../supabase";
 import { bandaInterface, perfilDatosAmpleosInterface, registroEventoDatosAmpleosInterface, RegistroEventoInterface, vistaAsistenBandasModel, vistaBandasEventoInterface } from "@/interfaces/interfaces";
import PerfilesServices from "./perfilesServices";
 

 
 type Interface = RegistroEventoInterface; 
 
 const tabla = "registroEventos";
 const elId = "idEvento";
 
 export default class RegistroEventossServices   {
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
 async getDatosAmpleos(): Promise<registroEventoDatosAmpleosInterface[]> {
  
     try {
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const { data, error } = await dataBaseSupabase
             .from(tabla)
             .select(`
                 *,
                 federaciones(*),
                 regiones(*)
             `)
             .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
             .order("fechaEvento", { ascending: true });
 
         if (error) {
             console.error("❌ Error obteniendo regiones con federaciones:", error);
             throw error;
         }
 
      
         return data as registroEventoDatosAmpleosInterface[];
     } catch (error) {
         console.error("❌ Error general en getDatosAmpleos:", error);
         throw error;
     }
 }

  async getDatosAmpleosFiltradosRegion(idForaneaRegion:string): Promise<registroEventoDatosAmpleosInterface[]> {
  
     try {
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const { data, error } = await dataBaseSupabase
             .from(tabla)
             .select(`
                 *,
                 federaciones(*),
                 regiones(*)
             `)
             .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
             .eq("idForaneaRegion", idForaneaRegion)
             .order("fechaEvento", { ascending: true });
 
         if (error) {
             console.error("❌ Error obteniendo regiones con federaciones:", error);
             throw error;
         }
 
      
         return data as registroEventoDatosAmpleosInterface[];
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
     async getAsistenciaBandasEvento(idEvento:string) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }

        
        if (!idEvento) {
            return [] as bandaInterface[];
        }

        const { data, error } = await dataBaseSupabase
            .from("vista_asistencia_bandas").select("*")
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            
            .eq("idForaneaEvento", idEvento)

        if (error) throw error;

        const datosPuros: vistaAsistenBandasModel[] = data;
        const datosBandas: bandaInterface[] = datosPuros.map(dato => ({
                idBanda: dato.idBanda,
                created_at: dato.created_at,
                AliasBanda: dato.AliasBanda,
                nombreBanda: dato.nombreBanda,
                idForaneaCategoria: dato.idForaneaCategoria,
                idForaneaRegion: dato.idForaneaRegion,
                idForaneaFederacion: dato.idForaneaFederacion,
                ciudadBanda: dato.ciudadBanda,
                urlLogoBanda: dato.urlLogoBanda,
                fechaFundacionBanda: dato.fechaFundacionBanda,
                fechaInscripcionAFederacion: dato.fechaInscripcionAFederacion,
                ubicacionSedeBanda: dato.ubicacionSedeBanda

           }));
   
           const bandasUnicasMap = new Map<string, bandaInterface>();
           const datosFinales: bandaInterface[] = [];
              datosBandas.forEach(banda => {
                if (!bandasUnicasMap.has(banda.idBanda)) {  
                    bandasUnicasMap.set(banda.idBanda, banda);
                    datosFinales.push(banda);
                }
            });

            
         return datosFinales as bandaInterface[];
     }

     async getEventosAsistidoByIdForaneaBanda(idForaneaBanda:string) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        if (!idForaneaBanda) {
            return [] as registroEventoDatosAmpleosInterface[];
        }
        
        // Hacer join con la tabla de eventos para obtener todos los datos necesarios
        const { data, error } = await dataBaseSupabase
            .from("vista_asistencia_bandas")
            .select(`
                *,
                registroEventos!inner(
                    idEvento,
                    fechaEvento,
                    LugarEvento,
                    created_at,
                    estado_evento,
                    tipo_evento,
                    dimensiones_cancha,
                    tipo_lugar
                )
            `)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            .eq("idBanda", idForaneaBanda)
         
        if (error) throw error;

        /* Convertir a formato de evento */
        const datosPuros: any[] = data; // Usar any porque ahora incluye el join
        const eventos: RegistroEventoInterface[] = datosPuros.map(dato => ({
                idEvento: dato.registroEventos.idEvento,
                fechaEvento: dato.registroEventos.fechaEvento,
                LugarEvento: dato.registroEventos.LugarEvento,
                idForaneaRegion: dato.idForaneaRegion,
                idForaneaFederacion: dato.idForaneaFederacion,
                created_at: dato.registroEventos.created_at,
                estado_evento: dato.registroEventos.estado_evento,
                tipo_evento: dato.registroEventos.tipo_evento,
                dimensiones_cancha: dato.registroEventos.dimensiones_cancha ?? "",
                tipo_lugar: dato.registroEventos.tipo_lugar ?? "abierto",

           }));

        const eventosUnicos = this.ExtraerEventosUnicos(eventos as registroEventoDatosAmpleosInterface[]);
       
        return eventosUnicos as registroEventoDatosAmpleosInterface[];
    }

    ExtraerEventosUnicos(eventos: registroEventoDatosAmpleosInterface[]): registroEventoDatosAmpleosInterface[] {
        const eventosUnicosMap = new Map<string, registroEventoDatosAmpleosInterface>();
        const eventosUnicos: registroEventoDatosAmpleosInterface[] = [];
        eventos.forEach(evento => {
            if (!eventosUnicosMap.has(evento.idEvento)) {
                eventosUnicosMap.set(evento.idEvento, evento);
                eventosUnicos.push(evento);
            }
        });
        return eventosUnicos;
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

     async iniciarEvento(id: string) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update({ estado_evento: "iniciado" })
            .eq(elId, id)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single();

        if (error) throw error;
        return data;
     }
     async finalizarEvento(id: string) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update({ estado_evento: "finalizado" })
            .eq(elId, id)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single();

        if (error) throw error;
        return data;
     }
     async cancelarEvento(id: string) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update({ estado_evento: "cancelado" })
            .eq(elId, id)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single();

        if (error) throw error;
        return data;
     }



     async getVistaBandasEventoByIdEvento(idEvento: string) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vista_bandas_evento")
            .select("*")
            .eq("idEvento", idEvento)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion);
        if (error) throw error;
        return data;
    }
     async getVistaBandasEventoByIdEventoIdBanda(idEvento: string, idBanda: string) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vista_bandas_evento")
            .select("*")
            .eq("idEvento", idEvento)
            .eq("idBanda", idBanda)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion);
        if (error) throw error;
        return data;
    }
     async getVistaBandasEventoByBandaEnCancha(idEvento: string, idEvaluador: string): Promise<vistaBandasEventoInterface> {
        if (!idEvento?.trim() || !idEvaluador?.trim()) {
            throw new Error("idEvento e idEvaluador son obligatorios.");
        }
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vista_bandas_evento")
            .select("*")
            .eq("idEvento", idEvento)
            .eq("estado_cancha", "ya_en_cancha")
            .eq("idForaneaPerfil", idEvaluador)
            .single();

        if (error) throw error;
        return data as vistaBandasEventoInterface;
    }
 }

/* 

  export interface vistaBandasEventoInterface {
    id_confirmacion_asistencia: string; // uuid
    estado_asistencia: boolean;          // boolean
    estado_cancha: string;              // text
    idEvento: string;                   // uuid
    LugarEvento: string;                // text
    estado_evento: string;              // text
    idBanda: string;                    // uuid
    nombreBanda: string;                // text
    AliasBanda: string;                 // text
    idCategoria: string;                // uuid
    nombreCategoria: string;            // text
  }

*/






 