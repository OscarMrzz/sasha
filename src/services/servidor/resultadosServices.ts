import type {
  bandaInterface,
  categoriaInterface,
  federacionInterface,
  registroComentariosDatosAmpleosInterface,
  resultadosEventoInterface,
  rubricaInterface,
  vistaCondensado,
  vistaRendimientoPorRubricaGlobalInterface,
  vistaResultadosModel,
  vistaResultadosPorEventoInterface,
  vistaResultadosTenporadaInterface,
} from "@/models";
import { serializarCausaErrorMiBanda } from "@/helpers/mi-banda/servidorMiBandaHealth";
import { getSupabaseAdmin } from "@/services/servidor/supabaseAdmin";
import { unstable_cache } from "next/cache";

/** Errores de Supabase a veces no imprimen bien en consola; siempre exponemos mensaje legible. */
function errorConsultaEstadisticas(etiqueta: string, err: unknown): Error {
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    const partes: string[] = [etiqueta];
    for (const key of ["message", "details", "hint", "code"] as const) {
      const v = o[key];
      if (typeof v === "string" && v.trim() !== "") partes.push(v.trim());
    }
    if (partes.length > 1) return new Error(partes.join(" · "));
  }
  if (err instanceof Error && err.message.trim() !== "") {
    return new Error(`${etiqueta}: ${err.message}`);
  }
  return new Error(`${etiqueta}: ${serializarCausaErrorMiBanda(err)}`);
}

function lanzarSiErrorEstadisticas(
  etiqueta: string,
  error: unknown | null | undefined
): asserts error is null | undefined {
  if (error != null) throw errorConsultaEstadisticas(etiqueta, error);
}

function esProbableErrorNombreColumna(err: unknown): boolean {
  const m = String(
    err && typeof err === "object" && "message" in err
      ? (err as { message?: unknown }).message
      : ""
  ).toLowerCase();
  return (
    m.includes("column") ||
    m.includes("does not exist") ||
    m.includes("schema cache") ||
    m.includes("could not find")
  );
}

/** Vista / tabla no expuesta en PostgREST (p. ej. vista eliminada). */
function esRelacionAusentePostgrest(err: unknown): boolean {
  const o = err as { code?: string; message?: string } | undefined;
  if (!o) return false;
  if (o.code === "PGRST205") return true;
  const m = String(o.message ?? "").toLowerCase();
  return m.includes("could not find") && m.includes("schema cache");
}

function normUuid(s: string): string {
  return String(s ?? "").trim().toLowerCase();
}

function anioDesdeFecha(fecha: string | null | undefined): number {
  if (!fecha) return 0;
  const y = Number.parseInt(String(fecha).slice(0, 4), 10);
  return Number.isFinite(y) ? y : 0;
}

type FilaGeneralRaw = Record<string, unknown>;
type FilaGeneralAgg = vistaResultadosModel & { idBanda?: string };

/** Unifica columnas del esquema antiguo (idForanea*) y el nuevo (idBanda, idEvento, total). */
function normalizarFilaGeneral(row: FilaGeneralRaw): FilaGeneralAgg {
  const fechaEvento = String(row.fechaEvento ?? "");
  return {
    ...(row as unknown as FilaGeneralAgg),
    idForaneaEvento: String(row.idForaneaEvento ?? row.idEvento ?? ""),
    idForaneaBanda: String(row.idForaneaBanda ?? row.idBanda ?? ""),
    idBanda: String(row.idBanda ?? row.idForaneaBanda ?? ""),
    fechaEvento,
    anioEvento: Number(row.anioEvento ?? anioDesdeFecha(fechaEvento)),
    puntosObtenidos: Number(row.puntosObtenidos ?? row.total ?? 0),
    idForaneaRegion: String(row.idForaneaRegion ?? row.idRegion ?? ""),
    idForaneaCategoria: String(row.idForaneaCategoria ?? row.idCategoria ?? ""),
    nombreRegion: String(row.nombreRegion ?? ""),
    nombreCategoria: String(row.nombreCategoria ?? ""),
    nombreBanda: String(row.nombreBanda ?? ""),
    LugarEvento: String(row.LugarEvento ?? ""),
    idForaneaFederacion: String(row.idForaneaFederacion ?? ""),
  };
}

function mapFilasGenerales(data: unknown[] | null): FilaGeneralAgg[] {
  return (data ?? []).map((row) =>
    normalizarFilaGeneral(row as FilaGeneralRaw)
  );
}

function bandaIdDesdeGeneral(row: FilaGeneralAgg): string {
  return String(row.idForaneaBanda ?? row.idBanda ?? "");
}

type BucketEventoBanda = {
  idForaneaEvento: string;
  idForaneaBanda: string;
  fechaEvento: string;
  anioEvento: number;
  nombreRegion: string;
  idForaneaRegion: string;
  idForaneaCategoria: string;
  nombreCategoria: string;
  LugarEvento: string;
  nombreBanda: string;
  idForaneaFederacion: string;
  total: number;
  lineas: number;
};

function chunkIds<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function agregarGeneralesPorEventoYBanda(
  rows: FilaGeneralAgg[]
): BucketEventoBanda[] {
  const map = new Map<string, BucketEventoBanda>();
  for (const row of rows) {
    const bid = bandaIdDesdeGeneral(row);
    const eid = String(row.idForaneaEvento ?? "").trim();
    if (!bid || !eid) continue;
    const k = `${eid}\0${bid}`;
    const pts = Number(row.puntosObtenidos ?? 0);
    const cur = map.get(k);
    if (!cur) {
      map.set(k, {
        idForaneaEvento: eid,
        idForaneaBanda: bid,
        fechaEvento: row.fechaEvento ?? "",
        anioEvento: Number(row.anioEvento ?? 0),
        nombreRegion: row.nombreRegion ?? "",
        idForaneaRegion: row.idForaneaRegion ?? "",
        idForaneaCategoria: row.idForaneaCategoria ?? "",
        nombreCategoria: row.nombreCategoria ?? "",
        LugarEvento: row.LugarEvento ?? "",
        nombreBanda: row.nombreBanda ?? "",
        idForaneaFederacion: row.idForaneaFederacion ?? "",
        total: pts,
        lineas: 1,
      });
    } else {
      cur.total += pts;
      cur.lineas += 1;
      const fe = row.fechaEvento ?? "";
      if (fe && fe > cur.fechaEvento) cur.fechaEvento = fe;
    }
  }
  return [...map.values()];
}

function rankingsEventosParaMiBanda(
  buckets: BucketEventoBanda[],
  miBandaNorm: string,
  sinRankingVsCompetencia: boolean
): resultadosEventoInterface[] {
  const porEvento = new Map<string, BucketEventoBanda[]>();
  for (const b of buckets) {
    const list = porEvento.get(b.idForaneaEvento) ?? [];
    list.push(b);
    porEvento.set(b.idForaneaEvento, list);
  }

  const out: resultadosEventoInterface[] = [];

  for (const [, list] of porEvento) {
    const sorted = [...list].sort((a, b) => b.total - a.total);
    sorted.forEach((bucket, idx) => {
      if (normUuid(bucket.idForaneaBanda) !== miBandaNorm) return;
      const rankin = sinRankingVsCompetencia ? 0 : idx + 1;
      const promedio =
        bucket.lineas > 0
          ? Math.round((bucket.total / bucket.lineas) * 100) / 100
          : bucket.total;
      out.push({
        rankin,
        idForaneaEvento: bucket.idForaneaEvento,
        idForaneaRegion: bucket.idForaneaRegion,
        idForaneaBanda: bucket.idForaneaBanda,
        fechaEvento: bucket.fechaEvento,
        anioEvento: bucket.anioEvento,
        total: Math.round(bucket.total * 100) / 100,
        promedio,
        eventosParticipados: 1,
        idForaneaFederacion: bucket.idForaneaFederacion,
        idForaneaCategoria: bucket.idForaneaCategoria,
        nombreRegion: bucket.nombreRegion,
        nombreBanda: bucket.nombreBanda,
        nombreCategoria: bucket.nombreCategoria,
        LugarEvento: bucket.LugarEvento,
      });
    });
  }

  out.sort((a, b) =>
    String(b.fechaEvento).localeCompare(String(a.fechaEvento))
  );
  return out;
}

/**
 * Replica lo que hacía `vista_resultados_eventos` usando solo `vista_resultados_generales`.
 */
async function eventosRankingsFallbackDesdeGenerales(
  db: ReturnType<typeof getSupabaseAdmin>,
  idBanda: string,
  anio: number
): Promise<resultadosEventoInterface[]> {
  const miBandaNorm = normUuid(idBanda);
  const genRes = await filasVistaResultadosGeneralesPorBanda(db, idBanda);
  if (genRes.error) {
    console.error(
      "[eventosRankingsFallbackDesdeGenerales] vista_resultados_generales:",
      genRes.error
    );
    return [];
  }

  const mine = (genRes.data ?? []).filter((r) => Number(r.anioEvento) === anio);
  if (!mine.length) return [];

  const eventIds = [
    ...new Set(
      mine
        .map((r) => String(r.idForaneaEvento ?? "").trim())
        .filter(Boolean)
    ),
  ];

  let competitionRows: FilaGeneralAgg[] | null = null;

  for (const chunk of chunkIds(eventIds, 80)) {
    let r = await db
      .from("vista_resultados_generales")
      .select("*")
      .in("idForaneaEvento", chunk);

    if (r.error && esProbableErrorNombreColumna(r.error)) {
      r = await db
        .from("vista_resultados_generales")
        .select("*")
        .in("idEvento", chunk);
    }

    if (r.error) {
      console.warn(
        "[eventosRankingsFallbackDesdeGenerales] sin ranking vs otras bandas (consulta por evento falló):",
        r.error
      );
      competitionRows = null;
      break;
    }
    const chunkRows = mapFilasGenerales(r.data).filter(
      (row) => Number(row.anioEvento) === anio
    );
    competitionRows = [...(competitionRows ?? []), ...chunkRows];
  }

  const rowsParaAgregar =
    competitionRows ?? (mine as FilaGeneralAgg[]);
  const sinRankingVsCompetencia = competitionRows === null;

  const buckets = agregarGeneralesPorEventoYBanda(rowsParaAgregar);
  return rankingsEventosParaMiBanda(
    buckets,
    miBandaNorm,
    sinRankingVsCompetencia
  );
}

/**
 * Preferimos la vista agregada; si no existe en PostgREST, armamos el mismo shape desde generales.
 */
async function filasVistaResultadosEventosPorBandaAnio(
  db: ReturnType<typeof getSupabaseAdmin>,
  idBanda: string,
  anio: number
) {
  const conForanea = await db
    .from("vista_resultados_eventos")
    .select("*")
    .eq("idForaneaBanda", idBanda)
    .eq("anioEvento", anio);

  if (!conForanea.error) return conForanea;

  if (esRelacionAusentePostgrest(conForanea.error)) {
    const data = await eventosRankingsFallbackDesdeGenerales(db, idBanda, anio);
    return { data, error: null };
  }

  if (esProbableErrorNombreColumna(conForanea.error)) {
    const data = await eventosRankingsFallbackDesdeGenerales(db, idBanda, anio);
    return { data, error: null };
  }

  return conForanea;
}

async function filasVistaResultadosGeneralesPorBanda(
  db: ReturnType<typeof getSupabaseAdmin>,
  idBanda: string
) {
  const conForanea = await db
    .from("vista_resultados_generales")
    .select("*")
    .eq("idForaneaBanda", idBanda);
  if (!conForanea.error) {
    return { data: mapFilasGenerales(conForanea.data), error: null };
  }
  if (!esProbableErrorNombreColumna(conForanea.error)) return conForanea;
  const conId = await db
    .from("vista_resultados_generales")
    .select("*")
    .eq("idBanda", idBanda);
  if (conId.error) return conForanea;
  return { data: mapFilasGenerales(conId.data), error: null };
}

export type TablaPosicionFila = vistaResultadosTenporadaInterface & {
  posicionRegional: number;
};

export type EstadisticasBandaPrecarga = {
  resultadoMiBanda: vistaResultadosTenporadaInterface | null;
  nombreBanda: string;
  eventosRankings: resultadosEventoInterface[];
  evaluacionesGenerales: vistaResultadosModel[];
  penalizacionesCount: number;
  rubricasCatalogo: rubricaInterface[];
};

export type ResultadosPorEventoPrecarga = {
  banda: bandaInterface;
  categoria: categoriaInterface | null;
  federacion: federacionInterface | null;
};

export async function getResultadosByIdBanda(
  idbanda: string
): Promise<vistaResultadosTenporadaInterface | null> {
  const fetcher = unstable_cache(
    async (id: string) => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_resultados_temporada")
        .select("*")
        .eq("idBanda", id)
        .limit(1)
        .maybeSingle();

      if (error) throw errorConsultaEstadisticas("getResultadosByIdBanda · vista_resultados_temporada", error);
      return data as vistaResultadosTenporadaInterface | null;
    },
    [`resultados-${idbanda}`],
    {
      tags: ["resultados-global", `resultados-${idbanda}`],
      revalidate: false,
    }
  );

  return fetcher(idbanda);
}

/**
 * Datos agregados para la pantalla de estadísticas (caché por banda).
 */
export async function getEstadisticasByIdBanda(
  idBanda: string
): Promise<EstadisticasBandaPrecarga | null> {
  const fetcher = unstable_cache(
    async (id: string) => {
      try {
        const anio = new Date().getFullYear();

        const { data: band, error: bandErr } = await getSupabaseAdmin()
          .from("bandas")
          .select("idBanda, nombreBanda, idForaneaFederacion, idForaneaCategoria")
          .eq("idBanda", id)
          .maybeSingle();

        lanzarSiErrorEstadisticas("bandas", bandErr);
        if (!band?.idForaneaFederacion || !band.idForaneaCategoria) return null;

        const idCat = band.idForaneaCategoria;

        const db = getSupabaseAdmin();
        const [
          temporadaRes,
          eventosRes,
          evalsRes,
          penalRes,
          rubricasRes,
        ] = await Promise.all([
          db
            .from("vista_resultados_temporada")
            .select("*")
            .eq("idBanda", id)
            .eq("idCategoria", idCat)
            .limit(1)
            .maybeSingle(),
          filasVistaResultadosEventosPorBandaAnio(db, id, anio),
          filasVistaResultadosGeneralesPorBanda(db, id),
          db
            .from("registroPenalizaciones")
            .select("*", { count: "exact", head: true })
            .eq("idForaneaBanda", id),
          db
            .from("rubricas")
            .select("*")
            .eq("idForaneaCategoria", idCat),
        ]);

        lanzarSiErrorEstadisticas(
          "vista_resultados_temporada",
          temporadaRes.error
        );
        lanzarSiErrorEstadisticas(
          "vista_resultados_eventos",
          eventosRes.error
        );
        lanzarSiErrorEstadisticas(
          "vista_resultados_generales",
          evalsRes.error
        );
        lanzarSiErrorEstadisticas(
          "registroPenalizaciones",
          penalRes.error
        );
        lanzarSiErrorEstadisticas("rubricas", rubricasRes.error);

        const resultadoMiBanda =
          (temporadaRes.data as vistaResultadosTenporadaInterface | null) ??
          null;

        return {
          resultadoMiBanda,
          nombreBanda: band.nombreBanda,
          eventosRankings: (eventosRes.data ?? []) as resultadosEventoInterface[],
          evaluacionesGenerales: (evalsRes.data ?? []) as vistaResultadosModel[],
          penalizacionesCount: penalRes.count ?? 0,
          rubricasCatalogo: (rubricasRes.data ?? []) as rubricaInterface[],
        } satisfies EstadisticasBandaPrecarga;
      } catch (e) {
        if (e instanceof Error && e.message.trim() !== "") {
          console.error("[getEstadisticasByIdBanda]", "idBanda=", id, e.message);
          throw e;
        }
        console.error("[getEstadisticasByIdBanda]", "idBanda=", id, e);
        throw errorConsultaEstadisticas(
          `getEstadisticasByIdBanda[banda=${id}]`,
          e
        );
      }
    },
    [`estadisticas-${idBanda}`],
    {
      tags: ["estadisticas-global", `estadisticas-${idBanda}`],
      revalidate: false,
    }
  );

  return fetcher(idBanda);
}

/**
 * Tabla regional: misma lógica que la pantalla cliente, con admin y caché.
 */
export async function getTablaPosicionesByIdBanda(idBanda: string) {
  const fetcher = unstable_cache(
    async (id: string) => {
      const anio = new Date().getFullYear();

      const { data: band, error: bandErr } = await getSupabaseAdmin()
        .from("bandas")
        .select(
          "idBanda, idForaneaFederacion, idForaneaCategoria, idForaneaRegion"
        )
        .eq("idBanda", id)
        .maybeSingle();

      if (bandErr) throw bandErr;

      const idFed = band?.idForaneaFederacion;
      const idCat = band?.idForaneaCategoria;
      const idReg = band?.idForaneaRegion;

      if (!band || !idFed || !idCat || !idReg) {
        return {
          nombreRegion: "",
          filas: [] as TablaPosicionFila[],
          idMiBanda: id,
        };
      }

      const db = getSupabaseAdmin();
      const [regionRes, bandasZonaRes, temporadaRes] = await Promise.all([
        db
          .from("regiones")
          .select("nombreRegion")
          .eq("idRegion", idReg)
          
          .maybeSingle(),
        db
          .from("bandas")
          .select("idBanda")
          
          .eq("idForaneaCategoria", idCat)
          .eq("idForaneaRegion", idReg),
        db
          .from("vista_resultados_temporada")
          .select("*")
          .eq("idCategoria", idCat),
      ]);

      if (regionRes.error) throw regionRes.error;
      if (bandasZonaRes.error) throw bandasZonaRes.error;
      if (temporadaRes.error) throw temporadaRes.error;

      const nombreRegion = regionRes.data?.nombreRegion ?? "";
      const idsPermitidos = new Set(
        (bandasZonaRes.data ?? []).map((b: { idBanda: string }) => b.idBanda)
      );

      const mismaCatYAnio = (temporadaRes.data ?? []).filter(
        (r: vistaResultadosTenporadaInterface) =>
          r.idCategoria === idCat 
      );

      const enMiRegion = mismaCatYAnio.filter((r) =>
        idsPermitidos.has(r.idBanda)
      );

      const ordenadas = [...enMiRegion].sort(
        (a, b) =>
          Number(b.total_despues_sanciones) - Number(a.total_despues_sanciones)
      );

      const filas: TablaPosicionFila[] = ordenadas.map((r, i) => ({
        ...r,
        posicionRegional: i + 1,
      }));

      return { nombreRegion, filas, idMiBanda: id };
    },
    [`tabla-posiciones-${idBanda}`],
    {
      tags: ["tabla-posiciones-global", `tabla-posiciones-${idBanda}`],
      revalidate: false,
    }
  );

  return fetcher(idBanda);
}
export type TablaPosicionSecretariaPayload = {
  nombreRegion: string;
  filas: TablaPosicionFila[];
};

/**
 * Tabla regional por temporada (vista federación · región · categoría · año actual).
 * Usada desde secretaría cuando el usuario elige región y categoría.
 */
export async function getTablaPosicionesPorFederacionRegionCategoria(
  idForaneaFederacion: string,
  idForaneaRegion: string,
  idForaneaCategoria: string
): Promise<TablaPosicionSecretariaPayload> {
  const idFed = idForaneaFederacion.trim();
  const idReg = idForaneaRegion.trim();
  const idCat = idForaneaCategoria.trim();

  const fetcher = unstable_cache(
    async () => {
      if (!idFed || !idReg || !idCat) {
        return {
          nombreRegion: "",
          filas: [] as TablaPosicionFila[],
        };
      }

      const db = getSupabaseAdmin();
      const [regionRes, bandasZonaRes, temporadaRes] = await Promise.all([
        db
          .from("regiones")
          .select("nombreRegion")
          .eq("idRegion", idReg)
          
          .maybeSingle(),
        db
          .from("bandas")
          .select("idBanda")
          
          .eq("idForaneaCategoria", idCat)
          .eq("idForaneaRegion", idReg),
        db
          .from("vista_resultados_temporada")
          .select("*")
          .eq("idCategoria", idCat),
      ]);

      if (regionRes.error) throw regionRes.error;
      if (bandasZonaRes.error) throw bandasZonaRes.error;
      if (temporadaRes.error) throw temporadaRes.error;

      const nombreRegion = regionRes.data?.nombreRegion ?? "";
      const idsPermitidos = new Set(
        (bandasZonaRes.data ?? []).map((b: { idBanda: string }) => b.idBanda)
      );

      const mismaCatYAnio = (temporadaRes.data ?? []).filter(
        (r: vistaResultadosTenporadaInterface) =>
          r.idCategoria === idCat 
      );

      const enMiRegion = mismaCatYAnio.filter((r) =>
        idsPermitidos.has(r.idBanda)
      );

      const ordenadas = [...enMiRegion].sort(
        (a, b) =>
          Number(b.total_despues_sanciones) - Number(a.total_despues_sanciones)
      );

      const filas: TablaPosicionFila[] = ordenadas.map((r, i) => ({
        ...r,
        posicionRegional: i + 1,
      }));

      return { nombreRegion, filas };
    },
    [`tabla-posiciones-secretaria`, idFed, idReg, idCat],
    {
      tags: [
        "tabla-posiciones-global",
        `tabla-posiciones-secretaria-${idFed}-${idReg}-${idCat}`,
      ],
      revalidate: false,
    }
  );

  return fetcher();
}

/**
 * Banda, categoría y federación para la pantalla de resultados por evento.
 */
export async function getPrecargaResultadosPorEvento(
  idBanda: string
): Promise<ResultadosPorEventoPrecarga | null> {
  const fetcher = unstable_cache(
    async (id: string) => {
      const { data: band, error: bandErr } = await getSupabaseAdmin()
        .from("bandas")
        .select(`*, categorias(*), federaciones(*)`)
        .eq("idBanda", id)
        .maybeSingle();

      if (bandErr) throw bandErr;
      if (!band?.idForaneaFederacion) return null;

      const raw = band as bandaInterface & {
        categorias?: categoriaInterface | categoriaInterface[] | null;
        federaciones?: federacionInterface | federacionInterface[] | null;
      };
      const {
        categorias: catJoined,
        federaciones: fedJoined,
        ...bandaCampos
      } = raw;

      let categoria: categoriaInterface | null = null;
      if (catJoined && !Array.isArray(catJoined)) {
        categoria = catJoined;
      } else if (Array.isArray(catJoined) && catJoined[0]) {
        categoria = catJoined[0];
      }

      let federacion: federacionInterface | null = null;
      if (fedJoined && !Array.isArray(fedJoined)) {
        federacion = fedJoined;
      } else if (Array.isArray(fedJoined) && fedJoined[0]) {
        federacion = fedJoined[0];
      }

      return {
        banda: bandaCampos as bandaInterface,
        categoria,
        federacion,
      } satisfies ResultadosPorEventoPrecarga;
    },
    [`resultados-evento-precarga-meta-${idBanda}`],
    {
      tags: [
        "eventos-banda-global",
        `eventos-banda-${idBanda}`,
        `resultados-${idBanda}`,
      ],
      revalidate: false,
    }
  );

  return fetcher(idBanda);
}

export async function getComentariosBandaEventoServidor(
  idBanda: string,
  idEvento: string,
  idFederacion: string
): Promise<registroComentariosDatosAmpleosInterface[]> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("registroComentarios")
        .select(
          `
          *,
          registroEventos(*),
          bandas(*),
          categorias(*),
          regiones(*),
          perfiles(*),
          federaciones(*),
          rubricas(*)
        `
        )
        .eq("idForaneaBanda", idBanda)
        .eq("idForaneaEvento", idEvento)
        .eq("idForaneaFederacion", idFederacion);
      if (error) {
        throw errorConsultaEstadisticas(
          "getComentariosBandaEventoServidor · registroComentarios",
          error
        );
      }
      return (data ?? []) as registroComentariosDatosAmpleosInterface[];
    },
    [`comentarios-banda-evento`, idBanda, idEvento, idFederacion],
    {
      tags: ["resultados-global", `resultados-${idBanda}`],
      revalidate: false,
    }
  );

  return fetcher();
}

/** Lista de IDs de banda para generateStaticParams (ISR por ruta). */
export const getAllBandasIds = unstable_cache(
  async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) {
      return [] as { idBanda: string }[];
    }

    try {
      const { data, error } = await getSupabaseAdmin()
        .from("bandas")
        .select("idBanda");

      if (error) return [];
      return (data ?? []) as { idBanda: string }[];
    } catch {
      return [];
    }
  },
  ["all-bandas-ids"],
  { tags: ["all-bandas-ids"], revalidate: false }
);


export async function getVistaRendimientoPorRubricaTemporadaActual(): Promise<vistaRendimientoPorRubricaGlobalInterface[]> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_rendimiento_por_rubrica_global_actual")
        .select("*");
      if (error) throw error;
      return data as vistaRendimientoPorRubricaGlobalInterface[];
    },
    ["vista-rendimiento-por-rubrica-temporada-actual"],
    { tags: ["vista-rendimiento-por-rubrica-temporada-actual"], revalidate: false }
  );
  return fetcher();
}
export async function getVistaRendimientoPorRubricaTemporadaActualByIdBanda(idBanda: string): Promise<vistaRendimientoPorRubricaGlobalInterface[]> {
  const fetcher = unstable_cache(
    async (id: string) => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_rendimiento_por_rubrica_global_actual")
        .select("*")
        .eq("idBanda", id);
      if (error) throw error;
      return (data ?? []) as vistaRendimientoPorRubricaGlobalInterface[];
    },
    [`vista-rendimiento-por-rubrica-temporada-actual-${idBanda}`],
    {
      tags: [
        "vista-rendimiento-por-rubrica-temporada-actual",
        `resultados-${idBanda}`,
      ],
      revalidate: false,
    }
  );
  return fetcher(idBanda);
}

export async function getVistaCondensado(): Promise<vistaCondensado[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("vista_condensado")
    .select("*");
  if (error) throw errorConsultaEstadisticas("vista_condensado", error);
  return (data ?? []) as vistaCondensado[];
}

export async function getRankingGlobalTemporadaActual(): Promise<vistaResultadosTenporadaInterface[]> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_resultados_temporada")
        .select("*");
      if (error) throw error;
      return data as vistaResultadosTenporadaInterface[];
    },
    ["vista-ranking-global-temporada-actual"],
    { tags: ["vista-ranking-global-temporada-actual"], revalidate: false }
  );
  return fetcher();                                                                                                                                 
}
export async function getRankingGlobalTemporadaActualByIdBanda(
  idBanda: string
): Promise<vistaResultadosTenporadaInterface | null> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_resultados_temporada")
        .select("*")
        .eq("idBanda", idBanda)
        .maybeSingle();
      if (error) throw error;
      return data as vistaResultadosTenporadaInterface | null;
    },
    ["vista-ranking-global-temporada-actual", idBanda],
    { tags: ["vista-ranking-global-temporada-actual"], revalidate: false }
  );
  return fetcher();
}




/**
 * Todas las filas de evaluación por banda desde la vista detallada `vista_resultados_eventos`.
 * Caché compartida entre usuarios; invalidación con tags `resultados-global` / `resultados-{idBanda}`.
 */
export async function getVistaResultadosPorBanda(
  idBanda: string
): Promise<vistaResultadosPorEventoInterface[]> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_resultados_eventos")
        .select("*")
        .eq("idBanda", idBanda);
      if (error) {
        throw errorConsultaEstadisticas(
          "getVistaResultadosPorBanda · vista_resultados_eventos",
          error
        );
      }
      return (data ?? []) as vistaResultadosPorEventoInterface[];
    },
    ["vista-resultados-por-banda", idBanda],
    {
      tags: ["resultados-global", `resultados-${idBanda}`],
      revalidate: false,
    }
  );

  return fetcher();
}

