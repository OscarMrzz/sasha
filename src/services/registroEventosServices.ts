 import { dataBaseSupabase } from "@/lib/supabase";
 import { bandaInterface, perfilDatosAmpleosInterface, registroEventoDatosAmpleosInterface, RegistroEventoInterface, vistaAsistenBandasModel, vistaBandasEventoInterface } from "@/models";
import { registroEventoInsertSchema, registroEventoUpdateSchema } from "@/models/eventos/registroEventoSchema";
import { fromDb, fromDbMany, toDb } from "@/services/mappers/caseMapper";
import { parseCamel } from "@/services/mappers/parseCamel";
import PerfilesServices from "./perfilesServices";
 

 
type Interface = RegistroEventoInterface; 
 
const tabla = "registro_eventos";
const elId = "id_evento";

/**
 * `vistaBandasEventoInterface` conserva algunas claves en snake_case
 * (id_confirmacion_asistencia, estado_asistencia, estado_cancha,
 * estado_evento, id_foranea_rubrica) mientras el resto se expone en
 * camelCase/PascalCase; la vista `vista_bandas_evento` devuelve todo en
 * snake_case, así que se convierte selectivamente.
 */
function mapVistaBandasEventoRow(
  row: Record<string, unknown>,
): vistaBandasEventoInterface {
  const {
    id_evento,
    lugar_evento,
    id_banda,
    nombre_banda,
    alias_banda,
    id_categoria,
    nombre_categoria,
    id_foranea_perfil,
    ...rest
  } = row;
  return {
    ...rest,
    idEvento: id_evento as string,
    LugarEvento: lugar_evento as string,
    idBanda: id_banda as string,
    nombreBanda: nombre_banda as string,
    AliasBanda: alias_banda as string,
    idCategoria: id_categoria as string,
    nombreCategoria: nombre_categoria as string,
    idForaneaPerfil: id_foranea_perfil as string,
  } as vistaBandasEventoInterface;
}
 
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
             .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
             .order("fecha_evento", { ascending: true });
 
         if (error) {
             console.error("❌ Error obteniendo regiones con federaciones:", error);
             throw error;
         }

      
         return fromDbMany<registroEventoDatosAmpleosInterface>(data ?? []);
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
             .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
             .eq("id_foranea_region", idForaneaRegion)
             .order("fecha_evento", { ascending: true });
 
         if (error) {
             console.error("❌ Error obteniendo regiones con federaciones:", error);
             throw error;
         }

      
         return fromDbMany<registroEventoDatosAmpleosInterface>(data ?? []);
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
         return fromDbMany<RegistroEventoInterface>(data ?? []);
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
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            
            .eq("id_foranea_evento", idEvento)

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
                registro_eventos!inner(
                    id_evento,
                    fecha_evento,
                    lugar_evento,
                    created_at,
                    estado_evento,
                    tipo_evento,
                    dimensiones_cancha,
                    tipo_lugar
                )
            `)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .eq("id_banda", idForaneaBanda)
         
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
             .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
             .single();
 
         if (error) throw error;
         return fromDb<RegistroEventoInterface>(data);
     }


     async create(dataCreate: Interface) {
      
         if (!this.perfil || !this.perfil.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const parsed = parseCamel(registroEventoInsertSchema, dataCreate);
         const { data, error } = await dataBaseSupabase
             .from(tabla)
             .insert(toDb(parsed as Record<string, unknown>))
             .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
             .select("*")
             .single()

         if (error) throw error;
         return fromDb<RegistroEventoInterface>(data);
     }

     async update(id: string, dataUpdate: Interface) {
      
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const parsed = parseCamel(registroEventoUpdateSchema, dataUpdate);
         const { data, error } = await dataBaseSupabase
             .from(tabla)
             .update(toDb(parsed as Record<string, unknown>))
             .eq(elId, id)
             .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
             .select("*")
             .single();

         if (error) throw error;
         return fromDb<RegistroEventoInterface>(data);
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

     async iniciarEvento(id: string) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
           .update({ estado_evento: "iniciado" })
           .eq(elId, id)
           .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
           .select("*")
           .single();

       if (error) throw error;
       return fromDb<RegistroEventoInterface>(data);
     }
     async finalizarEvento(id: string) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update({ estado_evento: "finalizado" })
            .eq(elId, id)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single();

       if (error) throw error;
       return fromDb<RegistroEventoInterface>(data);
     }
     async cancelarEvento(id: string) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update({ estado_evento: "cancelado" })
            .eq(elId, id)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single();

       if (error) throw error;
       return fromDb<RegistroEventoInterface>(data);
     }



     async getVistaBandasEventoByIdEvento(idEvento: string) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vista_bandas_evento")
            .select("*")
            .eq("id_evento", idEvento)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);
        if (error) throw error;
        return (data ?? []).map(mapVistaBandasEventoRow);
    }
     async getVistaBandasEventoByIdEventoIdBanda(idEvento: string, idBanda: string) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vista_bandas_evento")
            .select("*")
            .eq("id_evento", idEvento)
            .eq("id_banda", idBanda)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);
        if (error) throw error;
        return (data ?? []).map(mapVistaBandasEventoRow);
    }
     async getVistaBandasEventoByBandaEnCancha(idEvento: string, idEvaluador: string): Promise<vistaBandasEventoInterface> {
        if (!idEvento?.trim() || !idEvaluador?.trim()) {
            throw new Error("id_evento e idEvaluador son obligatorios.");
        }
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vista_bandas_evento")
            .select("*")
            .eq("id_evento", idEvento)
            .eq("estado_cancha", "ya_en_cancha")
            .eq("id_foranea_perfil", idEvaluador)
            .single();

        if (error) throw error;
        return mapVistaBandasEventoRow(data);
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






 