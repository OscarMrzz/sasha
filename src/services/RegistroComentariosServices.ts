 import { dataBaseSupabase } from "@/lib/supabase";
 import {  perfilDatosAmpleosInterface, registroComentariosDatosAmpleosInterface, registroComentariosInterface } from "@/models";
 

 
 
 type Interface = registroComentariosInterface;
 
 const tabla = "registroComentarios";
 const elId = "idRegistroComentario";
 
 
 
 
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
              ,registroEventos(*),
                 bandas(*),
                 
              
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
             .eq("idForaneaFederacion", this.perfil.idForaneaFederacion);
 
         if (error) {
             console.error("❌ Error obteniendo regiones con federaciones:", error);
             throw error;
         }
 
       
         return data as registroComentariosDatosAmpleosInterface[];
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
               .select(`
                 *
              ,registroEventos(*),
                 bandas(*),
                 
               
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
             .eq(elId, id)
             .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
             .single();
 
         if (error) throw error;
         return data;
     }
 
     async getPorEvento(idEvento: string) {
         
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const { data, error } = await dataBaseSupabase
             .from(tabla)
               .select(`
                 *
              ,registroEventos(*),
                 bandas(*),
                 
                
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
             .eq("idForaneaEvento", idEvento)
             .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            
 
         if (error) throw error;
         return data;
     }
     async getPorBanda(idBanda: string) {
         
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const { data, error } = await dataBaseSupabase
             .from(tabla)
             .select(`
                 *
              ,registroEventos(*),
                 bandas(*),
                 
        
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
             .eq("idForaneaBanda", idBanda)
             .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
          
 
         if (error) throw error;
         return data;
     }
     async getPorBandaYEvento(idBanda: string, idEvento: string) {
         
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const { data, error } = await dataBaseSupabase
             .from(tabla)
               .select(`
                 *
              ,registroEventos(*),
                 bandas(*),
                 
             
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
             .eq("idForaneaBanda", idBanda)
             .eq("idForaneaEvento", idEvento)
             .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
       
 
        if (error) throw error;
        return data as registroComentariosDatosAmpleosInterface[];
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
            .eq("idForaneaBanda", idBanda)
            .eq("idForaneaEvento", idEvento)
            .eq("idForaneaRubrica", idRubrica)
            .eq("idForaneaFederacion", this.perfil.idForaneaFederacion);

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
              ,registroEventos(*),
                 bandas(*),
                 
             
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
             .eq("idForaneaRubrica", idRubrica)
           
             .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
             .single();
 
         if (error) throw error;
         return data;
     }
     async getPorRubricaYEvento(idRubrica: string, idEvento: string) {
         
         if (!this.perfil?.idForaneaFederacion) {
             throw new Error("No hay federación en el perfil del usuario.");
         }
         const { data, error } = await dataBaseSupabase
             .from(tabla)
                .select(`
                 *
              ,registroEventos(*),
                 bandas(*),
                 
             
                 categorias(*),
                 regiones(*),
                 perfiles(*),
                 federaciones(*),
                 rubricas(*)
             `)
             .eq("idForaneaRubrica", idRubrica)
             .eq("idForaneaEvento", idEvento)
           
             .eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            
 
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
 