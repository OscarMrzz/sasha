import { dataBaseSupabase } from "../supabase";
import { bandaDatosAmpleosInterface,bandaInterface, perfilDatosAmpleosInterface } from "@/interfaces/interfaces";
import {
    ACCION_BANDA,
    BandaServicioError,
    clasificarErrorBanda,
    type AccionBanda,
} from "@/lib/errores/bandas/manejoErrorBanda";

type Interface = bandaInterface;

const tabla = "bandas";
const elId = "idBanda";

export default class BandasServices {

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

    async getDatosAmpleos(): Promise<bandaDatosAmpleosInterface[]> {


        try {

              if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
            const { data, error } = await dataBaseSupabase
                .from(tabla)
                .select(` 
                    *,
                    federaciones(*),
                    categorias(*),
                    regiones(*)
                `).eq("idForaneaFederacion", this.perfil.idForaneaFederacion).order('nombreBanda', { ascending: true });

            if (error) {
                console.error("❌ Error obteniendo bandas con datos completos:", error);
                throw error;
            }

        
            return data as bandaDatosAmpleosInterface[];
        } catch (error) {
            console.error("❌ Error general en getDatosAmpleos:", error);
            throw error;
        }
    }

    async get() {
        try{

              if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
            const { data, error } = await dataBaseSupabase.from(tabla).select("*").eq("idForaneaFederacion", this.perfil.idForaneaFederacion).order('nombreBanda', { ascending: true });
        if (error) throw error;
        return data;

        }
        catch(error){
            console.error("❌ Error general en get:", error);
            throw error;
        }
        
    }

    async getOne(id: string) {
        try{
              if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }

   const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("*")
            .eq(elId, id).eq("idForaneaFederacion", this.perfil.idForaneaFederacion)
            .single();

        if (error) throw error;
        return data;

        }
        catch(error){
            console.error("❌ Error general en getOne:", error);
            throw error;
        }
     
    }

    private validarFederacionActiva(data?: Partial<Interface>, accion: AccionBanda = ACCION_BANDA.EDICION) {
        if (!this.perfil?.idForaneaFederacion) {
            throw new BandaServicioError(accion, "sin_federacion_perfil");
        }

        if (data?.idForaneaFederacion && data.idForaneaFederacion !== this.perfil.idForaneaFederacion) {
            throw new BandaServicioError(accion, "federacion_invalida");
        }
    }

    async create(dataCreate: Interface) {
        try{

        this.validarFederacionActiva(dataCreate, ACCION_BANDA.CREACION);
            
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(dataCreate)
            .select("*")
            .single();

        if (error) throw error;
        return data;


        }
        catch(error){
            console.error("❌ Error general en create:", error);
            throw error;
        }


    }

    async update(id: string, dataUpdate: Interface) {
        try {
            this.validarFederacionActiva(dataUpdate, ACCION_BANDA.EDICION);

            const { data, error } = await dataBaseSupabase
                .from(tabla)
                .update(dataUpdate)
                .eq(elId, id)
                .eq("idForaneaFederacion", this.perfil?.idForaneaFederacion)
                .select("*")
                .single();

            if (error) {
                const codigo = clasificarErrorBanda(error, ACCION_BANDA.EDICION);
                throw new BandaServicioError(ACCION_BANDA.EDICION, codigo);
            }
            return data;
        } catch (error) {
            if (error instanceof BandaServicioError) throw error;
            const codigo = clasificarErrorBanda(error, ACCION_BANDA.EDICION);
            throw new BandaServicioError(ACCION_BANDA.EDICION, codigo);
        }
    }

    async delete(id: string) {
        this.validarFederacionActiva(undefined, ACCION_BANDA.ELIMINACION);

        const { error } = await dataBaseSupabase
            .from(tabla)
            .delete()
            .eq(elId, id)
            .eq("idForaneaFederacion", this.perfil?.idForaneaFederacion);

        if (error) throw error;
        return true;
    }


    async subirLogoBanda(file: File, nombreArchivo: string): Promise<string | null> {

        const nombreFinal = `${nombreArchivo}`;
        const { data, error } = await dataBaseSupabase.storage
            .from('imgLogoBandas')
            .upload(nombreFinal , file, {
                cacheControl: '3600',
                upsert: true
            });
        if (error) {
            console.error("❌ Error subiendo el logo de la banda:", error);
            throw error;
        }
        return data.path;
    }
       

    async obtenerUrlLogoBanda(path: string): Promise<string | null> {
        if(!path || path===""){
            return "";
        }

        const { data, error } = await dataBaseSupabase.storage
            .from('imgLogoBandas')
            .createSignedUrl(path, 60*60*24*365);

        if (error) {
            console.error("Error obteniendo URL del logo:", error);
            return "";
        }
        
        return data?.signedUrl ?? "";
    }

    async editarLogoBanda(file: File, nombreArchivo: string): Promise<string> {
        try {
            const nombreFinal = `${nombreArchivo}`;
            const { data, error } = await dataBaseSupabase.storage
                .from('imgLogoBandas')
                .update(nombreFinal , file, {
                    cacheControl: '3600',
                    upsert: true
                });
            if (error) {
                const codigo = clasificarErrorBanda(error, ACCION_BANDA.LOGO);
                throw new BandaServicioError(ACCION_BANDA.LOGO, codigo);
            }
            return data.path;
        } catch (error) {
            if (error instanceof BandaServicioError) throw error;
            const codigo = clasificarErrorBanda(error, ACCION_BANDA.LOGO);
            throw new BandaServicioError(ACCION_BANDA.LOGO, codigo);
        }
    }

}
