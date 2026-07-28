import { dataBaseSupabase } from "@/lib/supabase";
import { fetchResultadosPreliminaresEvento } from "./resultadosServices";
import {  
    perfilDatosAmpleosInterface, 
    registroCumplimientoEvaluacionDatosAmpleosInterface, 
    registroCumplimientoEvaluacionInterface, resultadosEventoDatosAmpleosInterface, 
    resultadosEventoInterface, 
    resultadosGeneralesInterface, 
    vistaResultadosModel, 
    vistaResultadosPreliminaresInterface,
    vistaResultadosTenporadaInterface } from "@/models";
import { fromDb, fromDbMany, toDb } from "@/services/mappers/caseMapper";




type Interface = registroCumplimientoEvaluacionInterface;

const tabla = "registro_cumplimiento_evaluaciones";
const elId = "id_registro_cumplimiento_evaluacion";

/**
 * `vista_resultados_temporada` devuelve id_banda/nombre_banda/id_categoria/
 * nombre_categoria en snake_case, pero `vistaResultadosTenporadaInterface`
 * conserva esos campos en camelCase (el resto de columnas ya son snake_case
 * en la interfaz, p. ej. total_antes_sanciones).
 */
function mapVistaResultadosTemporadaRow(
    row: Record<string, unknown>,
): vistaResultadosTenporadaInterface {
    const { id_banda, nombre_banda, id_categoria, nombre_categoria, ...rest } = row;
    return {
        ...rest,
        idBanda: id_banda as string,
        nombreBanda: nombre_banda as string,
        idCategoria: id_categoria as string,
        nombreCategoria: nombre_categoria as string,
    } as vistaResultadosTenporadaInterface;
}

function mapVistaResultadosTemporadaRows(
    rows: Record<string, unknown>[] | null,
): vistaResultadosTenporadaInterface[] {
    return (rows ?? []).map(mapVistaResultadosTemporadaRow);
}

/** Indica si un error de insert es por registro duplicado (UNIQUE o RLS anti-duplicado). */
export function esErrorInsertDuplicadoEvaluacion(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;
    const e = error as { code?: string; message?: string };
    if (e.code === "23505") return true;
    const msg = (e.message ?? "").toLowerCase();
    return (
        msg.includes("duplicate") ||
        msg.includes("duplicad") ||
        msg.includes("row-level security") ||
        msg.includes("violates row-level security policy")
    );
}




export default class  RegistroCumplimientoServices   {
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

    
       

 
async getDatosAmpleos(): Promise<registroCumplimientoEvaluacionDatosAmpleosInterface[]> {
     
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
                criterios_evaluacion(*),
                cumplimientos(*),
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

      
        return fromDbMany<registroCumplimientoEvaluacionDatosAmpleosInterface>(data ?? []);
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
        return fromDbMany<registroCumplimientoEvaluacionInterface>(data ?? []);
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
                criterios_evaluacion(*),
                cumplimientos(*),
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
        return fromDb<registroCumplimientoEvaluacionDatosAmpleosInterface>(data);
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
                criterios_evaluacion(*),
                cumplimientos(*),
                categorias(*),
                regiones(*),
                perfiles(*),
                federaciones(*),
                rubricas(*)
            `)
            .eq("id_foranea_evento", idEvento)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;
       return fromDbMany<registroCumplimientoEvaluacionDatosAmpleosInterface>(data ?? []);
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
                criterios_evaluacion(*),
                cumplimientos(*),
                categorias(*),
                regiones(*),
                perfiles(*),
                federaciones(*),
                rubricas(*)
            `)
            .eq("id_foranea_banda", idBanda)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;
        return fromDbMany<registroCumplimientoEvaluacionDatosAmpleosInterface>(data ?? []);
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
                criterios_evaluacion(*),
                cumplimientos(*),
                categorias(*),
                regiones(*),
                perfiles(*),
                federaciones(*),
                rubricas(*)
            `)
            .eq("id_foranea_banda", idBanda)
            .eq("id_foranea_evento", idEvento)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;
        return fromDbMany<registroCumplimientoEvaluacionDatosAmpleosInterface>(data ?? []);
    }

    async getIdsCriteriosGuardadosEnRubrica(
        idBanda: string,
        idEvento: string,
        idRubrica: string,
    ): Promise<Set<string>> {
        if (!this.perfil?.idForaneaFederacion) {
            await this.initPerfil();
        }
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }

        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("id_foranea_criterio")
            .eq("id_foranea_banda", idBanda)
            .eq("id_foranea_evento", idEvento)
            .eq("id_foranea_rubrica", idRubrica)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;

        const ids = fromDbMany<{ idForaneaCriterio?: string | null }>(data ?? [])
            .map((row) => row.idForaneaCriterio)
            .filter((id): id is string => Boolean(id?.trim()));

        return new Set(ids);
    }

    async getPorEventoCategoria( idEvento: string, idCategoria: string) {
         
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
              .select(`
                *
             ,registro_eventos(*),
                bandas(*),
                criterios_evaluacion(*),
                cumplimientos(*),
                categorias(*),
                regiones(*),
                perfiles(*),
                federaciones(*),
                rubricas(*)
            `)
            .eq("id_foranea_categoria", idCategoria)
            .eq("id_foranea_evento", idEvento)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;
        return fromDbMany<registroCumplimientoEvaluacionDatosAmpleosInterface>(data ?? []);
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
                criterios_evaluacion(*),
                cumplimientos(*),
                categorias(*),
                regiones(*),
                perfiles(*),
                federaciones(*),
                rubricas(*)
            `)
            .eq("id_foranea_rubrica", idRubrica)
          
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;
        return fromDbMany<registroCumplimientoEvaluacionDatosAmpleosInterface>(data ?? []);
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
                criterios_evaluacion(*),
                cumplimientos(*),
                categorias(*),
                regiones(*),
                perfiles(*),
                federaciones(*),
                rubricas(*)
            `)
            .eq("id_foranea_rubrica", idRubrica)
            .eq("id_foranea_evento", idEvento)
          
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;
       return fromDbMany<registroCumplimientoEvaluacionDatosAmpleosInterface>(data ?? []);
    }


   
    async getResultadosEvento(idEvento: string): Promise<resultadosGeneralesInterface[]> {
         
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        
        // Obtener todas las evaluaciones del evento
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select(`
                *,
                registro_eventos(*),
                bandas(*),
                criterios_evaluacion(*),
                cumplimientos(*),
                categorias(*),
                regiones(*),
                perfiles(*),
                federaciones(*),
                rubricas(*)
            `)
            .eq("id_foranea_evento", idEvento)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;

        if (!data || data.length === 0) {
            return [];
        }

        // Agrupar por banda y sumar los puntos
        const resultadosPorBanda = new Map<string, resultadosGeneralesInterface>();

        const evaluaciones = fromDbMany<registroCumplimientoEvaluacionDatosAmpleosInterface>(data);
        evaluaciones.forEach((evaluacion) => {
            const idBanda = evaluacion.idForaneaBanda;
            
            if (!resultadosPorBanda.has(idBanda)) {
                resultadosPorBanda.set(idBanda, {
                    banda: evaluacion.bandas,
                    evento: evaluacion.registroEventos,
                    categoria: evaluacion.categorias,
                    region: evaluacion.regiones,
                    totalPuntos: 0
                });
            }
            
            // Sumar los puntos de esta evaluación
            const puntos = evaluacion.puntosObtenidos || 0;
            const resultado = resultadosPorBanda.get(idBanda);
            if (resultado) {
                resultado.totalPuntos += puntos;
            }
        });

        // Convertir el Map a array y ordenar por puntos descendente
        return Array.from(resultadosPorBanda.values())
            .sort((a, b) => b.totalPuntos - a.totalPuntos);
    }
    async getResultadosEventoYCategoria(idEvento: string, idCategoria: string): Promise<resultadosGeneralesInterface[]> {
         
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        
        // Obtener todas las evaluaciones del evento
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select(`
                *,
                registro_eventos(*),
                bandas(*),
                criterios_evaluacion(*),
                cumplimientos(*),
                categorias(*),
                regiones(*),
                perfiles(*),
                federaciones(*),
                rubricas(*)
            `)
            .eq("id_foranea_evento", idEvento)
            .eq("id_foranea_categoria", idCategoria)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;

        if (!data || data.length === 0) {
            return [];
        }

        // Agrupar por banda y sumar los puntos
        const resultadosPorBanda = new Map<string, resultadosGeneralesInterface>();

        const evaluaciones = fromDbMany<registroCumplimientoEvaluacionDatosAmpleosInterface>(data);
        evaluaciones.forEach((evaluacion) => {
            const idBanda = evaluacion.idForaneaBanda;
            
            if (!resultadosPorBanda.has(idBanda)) {
                resultadosPorBanda.set(idBanda, {
                    banda: evaluacion.bandas,
                    evento: evaluacion.registroEventos,
                    categoria: evaluacion.categorias,
                    region: evaluacion.regiones,
                    totalPuntos: 0
                });
            }
            
            // Sumar los puntos de esta evaluación
            const puntos = evaluacion.puntosObtenidos || 0;
            const resultado = resultadosPorBanda.get(idBanda);
            if (resultado) {
                resultado.totalPuntos += puntos;
            }
        });

        // Convertir el Map a array y ordenar por puntos descendente
        return Array.from(resultadosPorBanda.values())
            .sort((a, b) => b.totalPuntos - a.totalPuntos);
    }
 


    async create(dataCreate: Interface) {
         
        if (!this.perfil || !this.perfil.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .insert(toDb(dataCreate as unknown as Record<string, unknown>))
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single()

        if (error) throw error;
        return fromDb<registroCumplimientoEvaluacionInterface>(data);
    }

    async update(id: string, dataUpdate: Interface) {
         
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .update(toDb(dataUpdate as unknown as Record<string, unknown>))
            .eq(elId, id)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .select("*")
            .single();

        if (error) throw error;
        return fromDb<registroCumplimientoEvaluacionInterface>(data);
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

   async puntosTemporadabanda(idBanda: string, anio: number): Promise<number> {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        if (!anio || typeof anio !== 'number' || anio < 1900) {
            throw new Error("Año inválido proporcionado para el cálculo de puntos.");
        }

        // Construir rango para created_at: desde el inicio del año hasta el inicio del siguiente año (exclusive)
        const fechaInicio = new Date(Date.UTC(anio, 0, 1)).toISOString(); // 00:00:00 UTC del 1 de enero
        const fechaFin = new Date(Date.UTC(anio+1 , 0, 1)).toISOString(); // 00:00:00 UTC del 1 de enero del siguiente año

        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("puntos_obtenidos")
            .eq("id_foranea_banda", idBanda)
            .gte("created_at", fechaInicio)
            .lt("created_at", fechaFin)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);
        if (error) throw error;

        const totalPuntos = fromDbMany<{ puntosObtenidos?: number | null }>(data ?? [])
            .reduce((total, registro) => total + (registro.puntosObtenidos || 0), 0);
        return totalPuntos;

    }

    async resultadosTemporadaPorBanda(
      idBanda: string,
      idCategoria: string
    ): Promise<vistaResultadosTenporadaInterface | null> {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }

        try {
            let query = dataBaseSupabase
                .from("vista_resultados_temporada")
                .select("*")
                .eq("id_banda", idBanda);

            const cat = idCategoria?.trim();
            if (cat) {
                query = query.eq("id_categoria", cat);
            }

            const { data, error } = await query.maybeSingle();

            if (error) {
                throw error;
            }

            // Si no hay datos, devuelve null
            if (!data) {
                return null;
            }

            return mapVistaResultadosTemporadaRow(data);
        } catch (error) {
            throw error;
        }
    }

    async promedioBandaTemporada(idBanda: string, anio: number, decimales?: number): Promise<number> {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        if (!anio || typeof anio !== 'number' || anio < 1900) {
            throw new Error("Año inválido proporcionado para el cálculo de promedio.");
        }

        // Construir rango para created_at: desde el inicio del año hasta el inicio del siguiente año (exclusive)
        const fechaInicio = new Date(Date.UTC(anio, 0, 1)).toISOString();
        const fechaFin = new Date(Date.UTC(anio + 1, 0, 1)).toISOString();

        // Solicitamos también el idForaneaEvento para poder agrupar por evento
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("puntos_obtenidos, id_foranea_evento")
            .eq("id_foranea_banda", idBanda)
            .gte("created_at", fechaInicio)
            .lt("created_at", fechaFin)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;
        if (!data || data.length === 0) {
            return 0;
        }

        // Agrupar por evento y sumar puntos por cada evento
        const puntosPorEvento = new Map<string, number>();
        fromDbMany<{ idForaneaEvento?: string | null; puntosObtenidos?: number | null }>(data).forEach((registro) => {
            const idEvento = registro.idForaneaEvento ?? 'sin_evento';
            const puntos = Number(registro.puntosObtenidos ?? 0) || 0;
            const actual = puntosPorEvento.get(idEvento) || 0;
            puntosPorEvento.set(idEvento, actual + puntos);
        });

        // Calcular promedio entre eventos
        const sumaEventos = Array.from(puntosPorEvento.values()).reduce((t, v) => t + v, 0);
        const cantidadEventos = puntosPorEvento.size;
        if (cantidadEventos === 0) return 0;
        const promedio = sumaEventos / cantidadEventos;

        if (typeof decimales === 'number') {
            return Number(promedio.toFixed(decimales));
        }

        return promedio;
    }

    async posicionTablaBandaTemporada(idBanda: string, anio: number): Promise<number> {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const puntosBanda = await this.puntosTemporadabanda(idBanda, anio);

        // Obtener todas las bandas en la federación
        const { data, error } = await dataBaseSupabase
            .from(tabla)
            .select("id_foranea_banda")
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
            .neq("id_foranea_banda", idBanda); // Excluir la banda actual
        if (error) throw error;

        const bandasUnicas = Array.from(
            new Set(
                fromDbMany<{ idForaneaBanda?: string | null }>(data ?? [])
                    .map((item) => item.idForaneaBanda)
                    .filter((id): id is string => Boolean(id)),
            ),
        );
        let posicion = 1; // Comenzar en posición 1 (mejor posición)

        // Comparar puntos con cada banda
        for (const otraBandaId of bandasUnicas) {
            const puntosOtraBanda = await this.puntosTemporadabanda(otraBandaId, anio);
            if (puntosOtraBanda > puntosBanda) {
                posicion++;
            }
        }
        return posicion;
    }


    async resultadosEventoCategoria(idEvento: string, idCategoria: string): Promise<vistaResultadosPreliminaresInterface[]> {
        await this.initPerfil();
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        return fetchResultadosPreliminaresEvento(
            idEvento,
            idCategoria,
            this.perfil.idForaneaFederacion
        );
    }
    async getVistaResultadosByIdBanda(idbanda: string): Promise<vistaResultadosModel[]> {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vista_resultados_generales") 
            .select("*")
            .eq("id_foranea_banda", idbanda)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion)
           
        if (error) throw error;
        return data as vistaResultadosModel[];

    }

    /** Misma vista que getVistaResultadosByIdBanda, filtrada por un solo evento (evita sumar varios eventos en el detalle por banda). */
    async getVistaResultadosByIdBandaYEvento(idBanda: string, idEvento: string): Promise<vistaResultadosModel[]> {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vista_resultados_generales")
            .select("*")
            .eq("id_foranea_banda", idBanda)
            .eq("id_foranea_evento", idEvento)
           

        if (error) throw error;
        return (data ?? []) as vistaResultadosModel[];
    }


 

    async getVistaResultadosTemporada () : Promise<vistaResultadosTenporadaInterface[]> {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vista_resultados_temporada") 
            .select("*")
         

        if (error) throw error;
        return mapVistaResultadosTemporadaRows(data);
    }

    async getVistaResultadosTemporadaByIdBanda(idbanda: string): Promise<vistaResultadosTenporadaInterface> {

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vista_resultados_temporada") 
            .select("*")
            .eq("id_banda", idbanda)
         
            .maybeSingle();

        if (error) throw error;
        if (!data) {
            throw new Error("No hay fila en vista_resultados_temporada para esta banda.");
        }
        return mapVistaResultadosTemporadaRow(data);
    }

    async getVistaResultadosTemporadaActual(): Promise<vistaResultadosTenporadaInterface[]> {
        const anioActual = new Date().getFullYear();

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }
        const { data, error } = await dataBaseSupabase
            .from("vista_resultados_temporada") 
            .select("*")
      
        if (error) throw error;
        return mapVistaResultadosTemporadaRows(data);
    }

    /** Resultados agregados por evento para una banda (año de temporada actual). Usado en estadísticas. */
    async getResultadosEventosPorBanda(idBanda: string): Promise<resultadosEventoInterface[]> {
        const anioActual = new Date().getFullYear();

        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }

        const { data, error } = await dataBaseSupabase
            .from("vista_resultados_eventos")
            .select("*")
            .eq("id_foranea_banda", idBanda)
         
          

        if (error) throw error;
        return (data ?? []) as resultadosEventoInterface[];
    }

    /** Cantidad de registros de penalización asociados a la banda en la federación actual. */
    async getPenalizacionesPorBanda(idBanda: string): Promise<number> {
        if (!this.perfil?.idForaneaFederacion) {
            throw new Error("No hay federación en el perfil del usuario.");
        }

        const { count, error } = await dataBaseSupabase
            .from("registro_penalizaciones")
            .select("*", { count: "exact", head: true })
            .eq("id_foranea_banda", idBanda)
            .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

        if (error) throw error;
        return count ?? 0;
    }

     
}
