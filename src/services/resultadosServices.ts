import type {
  perfilDatosAmpleosInterface,
  registroComentariosDatosAmpleosInterface,
  registroCumplimientoEvaluacionDatosAmpleosInterface,
  rubricaInterface,
  vistaCondensado,
  vistaResultadosModel,
  vistaResultadosPreliminaresInterface,
} from "@/models";
import { dataBaseSupabase } from "@/lib/supabase";
import { fromDbMany } from "@/services/mappers/caseMapper";

/** PostgREST a veces entrega errores mal serializables (se ven como `{}` en consola). */
function mensajeSupabase(err: unknown): string {
  if (err instanceof Error && err.message.trim()) return err.message;
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    const partes = ["message", "details", "hint", "code"]
      .map((k) => {
        const v = o[k];
        return typeof v === "string" && v.trim() ? v.trim() : null;
      })
      .filter(Boolean);
    if (partes.length) return partes.join(" · ");
  }
  try {
    const json = JSON.stringify(err);
    if (json !== "{}" && json !== "null") return json;
  } catch {
    /* ignore */
  }
  return String(err);
}

/**
 * Misma información que expondría la vista por filas, pero leyendo el registro
 * base como el resto de la app evaluadora (POSTgREST a veces falla con la vista).
 */
function registrosEvaluacionAVista(
  rows: registroCumplimientoEvaluacionDatosAmpleosInterface[]
): vistaResultadosModel[] {
  return rows.map((row) => {
    const re = row.registroEventos;
    const fechaRaw = re?.fechaEvento != null ? String(re.fechaEvento) : "";
    const fechaEvento =
      fechaRaw.length >= 10 ? fechaRaw.slice(0, 10) : fechaRaw;
    let anioEvento = 0;
    if (fechaEvento.length >= 4) {
      const y = Number.parseInt(fechaEvento.slice(0, 4), 10);
      anioEvento = Number.isFinite(y) ? y : 0;
    }
    return {
      idRegistroCumplimientoEvaluacion: row.idRegistroCumplimientoEvaluacion,
      idForaneaRegion: row.idForaneaRegion,
      idForaneaCategoria: row.idForaneaCategoria,
      idForaneaPerfil: row.idForaneaPerfil,
      idForaneaFederacion: row.idForaneaFederacion,
      idForaneaEvento: row.idForaneaEvento,
      idForaneaBanda: row.idForaneaBanda,
      idForaneaRubrica: row.idForaneaRubrica,
      idForaneaCumplimiento: row.idForaneaCumplimiento,
      fechaEvento,
      anioEvento,
      puntosObtenidos: Number(row.puntosObtenidos ?? 0),
      nombreCriterio: row.criteriosEvalucion?.nombreCriterio ?? "",
      detalleCumplimiento: row.cumplimientos?.detalleCumplimiento ?? "",
      LugarEvento: re?.LugarEvento ?? "",
      nombreBanda: row.bandas?.nombreBanda ?? "",
      nombreRubrica: row.rubricas?.nombreRubrica ?? "",
      nombreRegion: row.regiones?.nombreRegion ?? "",
      nombreCategoria: row.categorias?.nombreCategoria ?? "",
      nombre: row.perfiles?.nombre ?? "",
      idForaneaCriterio:
        row.cumplimientos?.idForaneaCriterio ?? row.idForaneaCriterio ?? "",
    };
  });
}
function calcularPuntosRubricas(
  rubricasList: rubricaInterface[],
  resultados: vistaResultadosModel[]
): Record<string, number> {
  const puntosRubricas: Record<string, number> = {};
  for (const rubrica of rubricasList) {
    puntosRubricas[rubrica.idRubrica] = resultados
      .filter((r) => r.idForaneaRubrica === rubrica.idRubrica)
      .reduce((acc, r) => acc + r.puntosObtenidos, 0);
  }
  return puntosRubricas;
}

export type ResultadosCompletosPayload = {
  resultados: vistaResultadosModel[];
  rubricasList: rubricaInterface[];
  comentariosList: registroComentariosDatosAmpleosInterface[];
  puntosRubricas: Record<string, number>;
  totalGeneral: number;
};

export class ResultadosService {
  perfil: perfilDatosAmpleosInterface | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      void this.initPerfil();
    }
  }

  async initPerfil(): Promise<void> {
    if (typeof window === "undefined") return;
    const perfilCookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("perfilActivo="));
    const perfilBruto = perfilCookie
      ? decodeURIComponent(perfilCookie.split("=")[1])
      : null;
    if (perfilBruto) {
      this.perfil = JSON.parse(perfilBruto) as perfilDatosAmpleosInterface;
    }
  }

  async getVistaResultadosPorBandaYEvento(
    idBanda: string,
    idEvento: string
  ): Promise<vistaResultadosModel[]> {
    /** Misma consulta amplia que `RegistroCumplimientoServices.getPorBandaYEvento`,
     *  pero sin `.eq(idForaneaFederacion, perfil)` — coincide con la vista antes usada aquí */
    try {
      const { data, error } = await dataBaseSupabase
        .from("registro_cumplimiento_evaluaciones")
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
        .eq("id_foranea_banda", idBanda)
        .eq("id_foranea_evento", idEvento);

      if (error) throw error;
      return registrosEvaluacionAVista(
        fromDbMany<registroCumplimientoEvaluacionDatosAmpleosInterface>(data ?? [])
      );
    } catch (e) {
      const msg = mensajeSupabase(e);
      throw new Error(
        `registroCumplimientoEvaluaciones (${idBanda} / ${idEvento}): ${msg}`,
        { cause: e }
      );
    }
  }

  async getRubricasPorCategoria(idCategoria: string): Promise<rubricaInterface[]> {
    if (!this.perfil?.idForaneaFederacion) {
      throw new Error("No hay federación en el perfil del usuario.");
    }
    const { data, error } = await dataBaseSupabase
      .from("rubricas")
      .select("*")
      .eq("id_foranea_categoria", idCategoria)
      .eq("id_foranea_federacion", this.perfil.idForaneaFederacion);

    if (error) throw error;
    return fromDbMany<rubricaInterface>(data ?? []);
  }

  async getComentariosPorBandaYEvento(
    idBanda: string,
    idEvento: string
  ): Promise<registroComentariosDatosAmpleosInterface[]> {
    if (!this.perfil?.idForaneaFederacion) {
      throw new Error("No hay federación en el perfil del usuario.");
    }
    const { data, error } = await dataBaseSupabase
      .from("registro_comentarios")
      .select(`
        *,
        registro_eventos(*),
        bandas(*),
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
    return fromDbMany<registroComentariosDatosAmpleosInterface>(data ?? []);
  }

  async getResultadosCompletos(
    idBanda: string,
    idEvento: string,
    idCategoria?: string
  ): Promise<ResultadosCompletosPayload> {
    // Resultados siempre se intentan; rúbricas y comentarios son opcionales
    // (si fallan no deben cancelar el fetch principal).
    const [resultadosRes, rubricasRes, comentariosRes] = await Promise.allSettled([
      this.getVistaResultadosPorBandaYEvento(idBanda, idEvento),
      idCategoria
        ? this.getRubricasPorCategoria(idCategoria)
        : Promise.resolve([] as rubricaInterface[]),
      this.getComentariosPorBandaYEvento(idBanda, idEvento),
    ]);

    if (resultadosRes.status === "rejected") {
      const r = resultadosRes.reason;
      console.error("[ResultadosService] getVistaResultadosPorBandaYEvento:", r);
      throw r instanceof Error
        ? r
        : new Error(mensajeSupabase(r), { cause: r });
    }

    const resultados = resultadosRes.value;

    // Si no recibimos idCategoria, intentamos inferirla desde los propios resultados
    let rubricasList: rubricaInterface[] = [];
    if (rubricasRes.status === "fulfilled") {
      rubricasList = rubricasRes.value;
    } else {
      console.warn("[ResultadosService] getRubricasPorCategoria falló:", rubricasRes.reason);
      // Intentar de nuevo con la categoría que traen los resultados
      const idCatInferido = resultados[0]?.idForaneaCategoria;
      if (idCatInferido) {
        try {
          rubricasList = await this.getRubricasPorCategoria(idCatInferido);
        } catch (e) {
          console.warn("[ResultadosService] getRubricasPorCategoria (inferido) falló:", e);
          rubricasList = [];
        }
      }
    }

    const comentariosList =
      comentariosRes.status === "fulfilled"
        ? comentariosRes.value
        : (console.warn("[ResultadosService] getComentariosPorBandaYEvento falló:", comentariosRes.reason), []);

    const puntosRubricas = calcularPuntosRubricas(rubricasList, resultados);
    const totalGeneral = resultados.reduce((s, r) => s + r.puntosObtenidos, 0);

    return { resultados, rubricasList, comentariosList, puntosRubricas, totalGeneral };
  }
}

export async function fetchResultadosPreliminaresEvento(
  idEvento: string,
  idCategoria: string,
  idFederacion: string
): Promise<vistaResultadosPreliminaresInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from("vista_resultados_preliminares")
    .select("*")
    .eq("id_evento", idEvento)
    .eq("id_foranea_categoria", idCategoria)
    .eq("id_foranea_federacion", idFederacion)
    .order("rankin", { ascending: true });

  if (error) throw new Error(mensajeSupabase(error));
  return fromDbMany<vistaResultadosPreliminaresInterface>(data ?? []);
}


export async function getVistaCondensado(
): Promise<vistaCondensado[]> {
  const { data, error } = await dataBaseSupabase
    .from("vista_condensado")
    .select("*")
   
 

  if (error) throw new Error(mensajeSupabase(error));
  return fromDbMany<vistaCondensado>(data ?? []);
}