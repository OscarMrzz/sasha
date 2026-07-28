 import { dataBaseSupabase } from "@/lib/supabase";
 import {  perfilDatosAmpleosInterface, registroComentariosDatosAmpleosInterface, registroComentariosInterface } from "@/models";
 import { registroComentariosInsertSchema, registroComentariosUpdateSchema } from "@/models/comentarios/registroComentariosSchema";
 import { fromDb, fromDbMany, toDb } from "@/services/mappers/caseMapper";
 import { parseCamel } from "@/services/mappers/parseCamel";


 
 type Interface = registroComentariosInterface;
 
 const tabla = "registro_comentarios";
 const elId = "id_registro_comentario";
 
 
 
 
 export default class RegistroComentariosServices  {
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
 
     
        
 
  
 async getDatosAmpleos(): Promise<registroComentariosDatosAmpleosInterface[]> {
     
     try {
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
      
         const { data, error } = await dataBaseSupabase
             .from(tabla)
             .select(`
                 *
              ,registro_eventos(*),
                 bandas(*),
                 
              
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
             .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);
 
         if (error) {
             console.error("❌ Error obteniendo regiones con federaciones:", error);
             throw error;
         }
 
       
        return fromDbMany<registroComentariosDatosAmpleosInterface>(data ?? []);
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
        return fromDbMany<registroComentariosInterface>(data ?? []);
    }
 
     async getOne(id: string) {
         
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const { data, error } = await dataBaseSupabase
             .from(tabla)
               .select(`
                 *
              ,registro_eventos(*),
                 bandas(*),
                 
               
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
            .eq(elId, id)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .single();

        if (error) throw error;
        return fromDb<registroComentariosDatosAmpleosInterface>(data);
    }

    async getPorEvento(idEvento: string) {
         
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const { data, error } = await dataBaseSupabase
             .from(tabla)
               .select(`
                 *
              ,registro_eventos(*),
                 bandas(*),
                 
                
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
            .eq("id_foranea_evento", idEvento)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
           

        if (error) throw error;
        return fromDbMany<registroComentariosDatosAmpleosInterface>(data ?? []);
    }
    async getPorBanda(idBanda: string) {
         
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const { data, error } = await dataBaseSupabase
             .from(tabla)
             .select(`
                 *
              ,registro_eventos(*),
                 bandas(*),
                 
        
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
            .eq("id_foranea_banda", idBanda)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
         

        if (error) throw error;
        return fromDbMany<registroComentariosDatosAmpleosInterface>(data ?? []);
    }
    async getPorBandaYEvento(idBanda: string, idEvento: string) {
         
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const { data, error } = await dataBaseSupabase
             .from(tabla)
               .select(`
                 *
              ,registro_eventos(*),
                 bandas(*),
                 
             
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
             .eq("id_foranea_banda", idBanda)
             .eq("id_foranea_evento", idEvento)
             .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
       
 
       if (error) throw error;
       return fromDbMany<registroComentariosDatosAmpleosInterface>(data ?? []);
   }

    /** Indica si la rúbrica ya fue aplicada a la banda en el evento (cualquier jurado). */
    async rubricaYaEvaluadaEnEvento(
        idBanda: string,
        idEvento: string,
        idRubrica: string,
    ): Promise<boolean> {
        if (!idBanda?.trim() || !idEvento?.trim() || !idRubrica?.trim()) {
            return false;
        }

        if (!this.perfil?.idForaneaFederacion) {
            await this.initPerfil();
        }

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }

        const { count, error } = await dataBaseSupabase
            .from(tabla)
            .select(elId, { count: "exact", head: true })
            .eq("id_foranea_banda", idBanda)
            .eq("id_foranea_evento", idEvento)
            .eq("id_foranea_rubrica", idRubrica)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;
        return (count ?? 0) > 0;
    }

     async getPorRubrica(idRubrica: string) {
         
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const { data, error } = await dataBaseSupabase
             .from(tabla)
               .select(`
                 *
              ,registro_eventos(*),
                 bandas(*),
                 
             
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
            .eq("id_foranea_rubrica", idRubrica)
          
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .single();

        if (error) throw error;
        return fromDb<registroComentariosDatosAmpleosInterface>(data);
    }
    async getPorRubricaYEvento(idRubrica: string, idEvento: string) {
         
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const { data, error } = await dataBaseSupabase
             .from(tabla)
                .select(`
                 *
              ,registro_eventos(*),
                 bandas(*),
                 
             
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
             .eq("id_foranea_rubrica", idRubrica)
             .eq("id_foranea_evento", idEvento)
           
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
           

        if (error) throw error;
        return fromDbMany<registroComentariosDatosAmpleosInterface>(data ?? []);
    }


    async create(dataCreate: Interface) {
        
        if (!this.perfil || !this.perfil.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const parsed = parseCamel(registroComentariosInsertSchema, dataCreate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(toDb(parsed as Record<string, unknown>))
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single()

        if (error) throw error;
        return fromDb<registroComentariosInterface>(data);
    }

    async update(id: string, dataUpdate: Interface) {
        
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const parsed = parseCamel(registroComentariosUpdateSchema, dataUpdate);
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(toDb(parsed as Record<string, unknown>))
            .eq(elId, id)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<registroComentariosInterface>(data);
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
 