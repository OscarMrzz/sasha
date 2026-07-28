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
import { fromDb, fromDbMany } from "@/services/mappers/caseMapper";
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

/**
 * `vista_resultados_temporada` devuelve id_banda/nombre_banda/id_categoria/
 * nombre_categoria en snake_case, pero `vistaResultadosTenporadaInterface`
 * conserva esos campos en camelCase (el resto ya son snake_case en la
 * interfaz, p. ej. total_antes_sanciones).
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

type FilaGeneralRaw = Record<string, unknown>;
type FilaGeneralAgg = vistaResultadosModel & { id_banda?: string };

/** Unifica columnas del esquema antiguo (idForanea*) y el nuevo (id_banda, id_evento, total); la vista es snake_case. */
function normalizarFilaGeneral(row: FilaGeneralRaw): FilaGeneralAgg {
  const camel = fromDb<Record<string, unknown>>(row);
  const fechaEvento = String(camel.fechaEvento ?? "");
  return {
    ...(camel as unknown as FilaGeneralAgg),
    idForaneaEvento: String(camel.idForaneaEvento ?? camel.idEvento ?? ""),
    idForaneaBanda: String(camel.idForaneaBanda ?? camel.idBanda ?? ""),
    id_banda: String(camel.idBanda ?? camel.idForaneaBanda ?? ""),
    fechaEvento,
    anioEvento: Number(camel.anioEvento ?? anioDesdeFecha(fechaEvento)),
    puntosObtenidos: Number(camel.puntosObtenidos ?? camel.total ?? 0),
    idForaneaRegion: String(camel.idForaneaRegion ?? camel.idRegion ?? ""),
    idForaneaCategoria: String(camel.idForaneaCategoria ?? camel.idCategoria ?? ""),
    nombreRegion: String(camel.nombreRegion ?? ""),
    nombreCategoria: String(camel.nombreCategoria ?? ""),
    nombreBanda: String(camel.nombreBanda ?? ""),
    LugarEvento: String(camel.LugarEvento ?? ""),
    idForaneaFederacion: String(camel.idForaneaFederacion ?? ""),
  } as FilaGeneralAgg;
}

function mapFilasGenerales(data: unknown[] | null): FilaGeneralAgg[] {
  return (data ?? []).map((row) =>
    normalizarFilaGeneral(row as FilaGeneralRaw)
  );
}

function bandaIdDesdeGeneral(row: FilaGeneralAgg): string {
  return String(row.idForaneaBanda ?? row.id_banda ?? "");
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
  id_banda: string,
  anio: number
): Promise<resultadosEventoInterface[]> {
  const miBandaNorm = normUuid(id_banda);
  const genRes = await filasVistaResultadosGeneralesPorBanda(db, id_banda);
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
      .in("id_foranea_evento", chunk);

    if (r.error && esProbableErrorNombreColumna(r.error)) {
      r = await db
        .from("vista_resultados_generales")
        .select("*")
        .in("id_evento", chunk);
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
  id_banda: string,
  anio: number
) {
  const conForanea = await db
    .from("vista_resultados_eventos")
    .select("*")
    .eq("id_foranea_banda", id_banda)
    .eq("anio_evento", anio);

  if (!conForanea.error) return conForanea;

  if (esRelacionAusentePostgrest(conForanea.error)) {
    const data = await eventosRankingsFallbackDesdeGenerales(db, id_banda, anio);
    return { data, error: null };
  }

  if (esProbableErrorNombreColumna(conForanea.error)) {
    const data = await eventosRankingsFallbackDesdeGenerales(db, id_banda, anio);
    return { data, error: null };
  }

  return conForanea;
}

async function filasVistaResultadosGeneralesPorBanda(
  db: ReturnType<typeof getSupabaseAdmin>,
  id_banda: string
) {
  const conForanea = await db
    .from("vista_resultados_generales")
    .select("*")
    .eq("id_foranea_banda", id_banda);
  if (!conForanea.error) {
    return { data: mapFilasGenerales(conForanea.data), error: null };
  }
  if (!esProbableErrorNombreColumna(conForanea.error)) return conForanea;
  const conId = await db
    .from("vista_resultados_generales")
    .select("*")
    .eq("id_banda", id_banda);
  if (conId.error) return conForanea;
  return { data: mapFilasGenerales(conId.data), error: null };
}

export type TablaPosicionFila = vistaResultadosTenporadaInterface & {
  posicionRegional: number;
};

export type EstadisticasBandaPrecarga = {
  resultadoMiBanda: vistaResultadosTenporadaInterface | null;
  nombre_banda: string;
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
        .eq("id_banda", id)
        .limit(1)
        .maybeSingle();

      if (error) throw errorConsultaEstadisticas("getResultadosByIdBanda · vista_resultados_temporada", error);
      return data ? mapVistaResultadosTemporadaRow(data) : null;
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
  id_banda: string
): Promise<EstadisticasBandaPrecarga | null> {
  const fetcher = unstable_cache(
    async (id: string) => {
      try {
        const anio = new Date().getFullYear();

        const { data: band, error: bandErr } = await getSupabaseAdmin()
          .from("bandas")
          .select("id_banda, nombre_banda, id_foranea_federacion, id_foranea_categoria")
          .eq("id_banda", id)
          .maybeSingle();

        lanzarSiErrorEstadisticas("bandas", bandErr);
        if (!band?.id_foranea_federacion || !band.id_foranea_categoria) return null;

        const idCat = band.id_foranea_categoria;

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
            .eq("id_banda", id)
            .eq("id_categoria", idCat)
            .limit(1)
            .maybeSingle(),
          filasVistaResultadosEventosPorBandaAnio(db, id, anio),
          filasVistaResultadosGeneralesPorBanda(db, id),
          db
            .from("registro_penalizaciones")
            .select("*", { count: "exact", head: true })
            .eq("id_foranea_banda", id),
          db
            .from("rubricas")
            .select("*")
            .eq("id_foranea_categoria", idCat),
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
          "registro_penalizaciones",
          penalRes.error
        );
        lanzarSiErrorEstadisticas("rubricas", rubricasRes.error);

        const resultadoMiBanda = temporadaRes.data
          ? mapVistaResultadosTemporadaRow(temporadaRes.data)
          : null;

        return {
          resultadoMiBanda,
          nombre_banda: band.nombre_banda,
          eventosRankings: (eventosRes.data ?? []) as resultadosEventoInterface[],
          evaluacionesGenerales: (evalsRes.data ?? []) as vistaResultadosModel[],
          penalizacionesCount: penalRes.count ?? 0,
          rubricasCatalogo: (rubricasRes.data ?? []) as rubricaInterface[],
        } satisfies EstadisticasBandaPrecarga;
      } catch (e) {
        if (e instanceof Error && e.message.trim() !== "") {
          console.error("[getEstadisticasByIdBanda]", "id_banda=", id, e.message);
          throw e;
        }
        console.error("[getEstadisticasByIdBanda]", "id_banda=", id, e);
        throw errorConsultaEstadisticas(
          `getEstadisticasByIdBanda[banda=${id}]`,
          e
        );
      }
    },
    [`estadisticas-${id_banda}`],
    {
      tags: ["estadisticas-global", `estadisticas-${id_banda}`],
      revalidate: false,
    }
  );

  return fetcher(id_banda);
}

/**
 * Tabla regional: misma lógica que la pantalla cliente, con admin y caché.
 */
export async function getTablaPosicionesByIdBanda(id_banda: string) {
  const fetcher = unstable_cache(
    async (id: string) => {
      const anio = new Date().getFullYear();

      const { data: band, error: bandErr } = await getSupabaseAdmin()
        .from("bandas")
        .select(
          "id_banda, id_foranea_federacion, id_foranea_categoria, id_foranea_region"
        )
        .eq("id_banda", id)
        .maybeSingle();

      if (bandErr) throw bandErr;

      const idFed = band?.id_foranea_federacion;
      const idCat = band?.id_foranea_categoria;
      const idReg = band?.id_foranea_region;

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
          .select("nombre_region")
          .eq("id_region", idReg)
          
          .maybeSingle(),
        db
          .from("bandas")
          .select("id_banda")
          
          .eq("id_foranea_categoria", idCat)
          .eq("id_foranea_region", idReg),
        db
          .from("vista_resultados_temporada")
          .select("*")
          .eq("id_categoria", idCat),
      ]);

      if (regionRes.error) throw regionRes.error;
      if (bandasZonaRes.error) throw bandasZonaRes.error;
      if (temporadaRes.error) throw temporadaRes.error;

      const nombreRegion = regionRes.data?.nombre_region ?? "";
      const idsPermitidos = new Set(
        (bandasZonaRes.data ?? []).map((b: { id_banda: string }) => b.id_banda)
      );

      const mismaCatYAnio = mapVistaResultadosTemporadaRows(temporadaRes.data).filter(
        (r) => r.idCategoria === idCat
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
    [`tabla-posiciones-${id_banda}`],
    {
      tags: ["tabla-posiciones-global", `tabla-posiciones-${id_banda}`],
      revalidate: false,
    }
  );

  return fetcher(id_banda);
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
  id_foranea_federacion: string,
  id_foranea_region: string,
  id_foranea_categoria: string
): Promise<TablaPosicionSecretariaPayload> {
  const idFed = id_foranea_federacion.trim();
  const idReg = id_foranea_region.trim();
  const idCat = id_foranea_categoria.trim();

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
          .select("nombre_region")
          .eq("id_region", idReg)
          
          .maybeSingle(),
        db
          .from("bandas")
          .select("id_banda")
          
          .eq("id_foranea_categoria", idCat)
          .eq("id_foranea_region", idReg),
        db
          .from("vista_resultados_temporada")
          .select("*")
          .eq("id_categoria", idCat),
      ]);

      if (regionRes.error) throw regionRes.error;
      if (bandasZonaRes.error) throw bandasZonaRes.error;
      if (temporadaRes.error) throw temporadaRes.error;

      const nombreRegion = regionRes.data?.nombre_region ?? "";
      const idsPermitidos = new Set(
        (bandasZonaRes.data ?? []).map((b: { id_banda: string }) => b.id_banda)
      );

      const mismaCatYAnio = mapVistaResultadosTemporadaRows(temporadaRes.data).filter(
        (r) => r.idCategoria === idCat
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
  id_banda: string
): Promise<ResultadosPorEventoPrecarga | null> {
  const fetcher = unstable_cache(
    async (id: string) => {
      const { data: band, error: bandErr } = await getSupabaseAdmin()
        .from("bandas")
        .select(`*, categorias(*), federaciones(*)`)
        .eq("id_banda", id)
        .maybeSingle();

      if (bandErr) throw bandErr;
      if (!band?.id_foranea_federacion) return null;

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
    [`resultados-evento-precarga-meta-${id_banda}`],
    {
      tags: [
        "eventos-banda-global",
        `eventos-banda-${id_banda}`,
        `resultados-${id_banda}`,
      ],
      revalidate: false,
    }
  );

  return fetcher(id_banda);
}

export async function getComentariosBandaEventoServidor(
  id_banda: string,
  id_evento: string,
  id_federacion: string
): Promise<registroComentariosDatosAmpleosInterface[]> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("registro_comentarios")
        .select(
          `
          *,
          registro_eventos(*),
          bandas(*),
          categorias(*),
          regiones(*),
          perfiles(*),
          federaciones(*),
          rubricas(*)
        `
        )
        .eq("id_foranea_banda", id_banda)
        .eq("id_foranea_evento", id_evento)
        .eq("id_foranea_federacion", id_federacion);
      if (error) {
        throw errorConsultaEstadisticas(
          "getComentariosBandaEventoServidor · registro_comentarios",
          error
        );
      }
      return fromDbMany<registroComentariosDatosAmpleosInterface>(data ?? []);
    },
    [`comentarios-banda-evento`, id_banda, id_evento, id_federacion],
    {
      tags: ["resultados-global", `resultados-${id_banda}`],
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
        .select("id_banda");

      if (error) return [];
      return fromDbMany<{ idBanda: string }>(data ?? []);
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
      return fromDbMany<vistaRendimientoPorRubricaGlobalInterface>(data ?? []);
    },
    ["vista-rendimiento-por-rubrica-temporada-actual"],
    { tags: ["vista-rendimiento-por-rubrica-temporada-actual"], revalidate: false }
  );
  return fetcher();
}
export async function getVistaRendimientoPorRubricaTemporadaActualByIdBanda(id_banda: string): Promise<vistaRendimientoPorRubricaGlobalInterface[]> {
  const fetcher = unstable_cache(
    async (id: string) => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_rendimiento_por_rubrica_global_actual")
        .select("*")
        .eq("id_banda", id);
      if (error) throw error;
      return fromDbMany<vistaRendimientoPorRubricaGlobalInterface>(data ?? []);
    },
    [`vista-rendimiento-por-rubrica-temporada-actual-${id_banda}`],
    {
      tags: [
        "vista-rendimiento-por-rubrica-temporada-actual",
        `resultados-${id_banda}`,
      ],
      revalidate: false,
    }
  );
  return fetcher(id_banda);
}

export async function getVistaCondensado(): Promise<vistaCondensado[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("vista_condensado")
    .select("*");
  if (error) throw errorConsultaEstadisticas("vista_condensado", error);
  return fromDbMany<vistaCondensado>(data ?? []);
}

export async function getRankingGlobalTemporadaActual(): Promise<vistaResultadosTenporadaInterface[]> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_resultados_temporada")
        .select("*");
      if (error) throw error;
      return mapVistaResultadosTemporadaRows(data);
    },
    ["vista-ranking-global-temporada-actual"],
    { tags: ["vista-ranking-global-temporada-actual"], revalidate: false }
  );
  return fetcher();                                                                                                                                 
}
export async function getRankingGlobalTemporadaActualByIdBanda(
  id_banda: string
): Promise<vistaResultadosTenporadaInterface | null> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_resultados_temporada")
        .select("*")
        .eq("id_banda", id_banda)
        .maybeSingle();
      if (error) throw error;
      return data ? mapVistaResultadosTemporadaRow(data) : null;
    },
    ["vista-ranking-global-temporada-actual", id_banda],
    { tags: ["vista-ranking-global-temporada-actual"], revalidate: false }
  );
  return fetcher();
}




/**
 * Todas las filas de evaluación por banda desde la vista detallada `vista_resultados_eventos`.
 * Caché compartida entre usuarios; invalidación con tags `resultados-global` / `resultados-{idBanda}`.
 */
/**
 * `vista_resultados_eventos` devuelve sus columnas en snake_case, pero
 * `vistaResultadosPorEventoInterface` conserva `tipo_evento` / `tipo_lugar`
 * tal cual (snake_case) y el resto en camelCase.
 */
function mapVistaResultadosPorEventoRow(
  row: Record<string, unknown>,
): vistaResultadosPorEventoInterface {
  const { tipo_evento, tipo_lugar, ...rest } = row;
  return {
    ...fromDb<Record<string, unknown>>(rest),
    tipo_evento: tipo_evento as string | null,
    tipo_lugar: tipo_lugar as string | null,
  } as vistaResultadosPorEventoInterface;
}

export async function getVistaResultadosPorBanda(
  id_banda: string
): Promise<vistaResultadosPorEventoInterface[]> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_resultados_eventos")
        .select("*")
        .eq("id_banda", id_banda);
      if (error) {
        throw errorConsultaEstadisticas(
          "getVistaResultadosPorBanda · vista_resultados_eventos",
          error
        );
      }
      return (data ?? []).map(mapVistaResultadosPorEventoRow);
    },
    ["vista-resultados-por-banda", id_banda],
    {
      tags: ["resultados-global", `resultados-${id_banda}`],
      revalidate: false,
    }
  );

  return fetcher();
}

