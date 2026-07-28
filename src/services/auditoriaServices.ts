import { fechaHoyLocalISO } from "@/hooks/dashboard/useDashboardData";
import type {
  AccesoCategoriaVista,
  AuditoriaAccion,
  AuditoriaDetalleEnriquecido,
  AuditoriaFiltros,
  AuditoriaMetadata,
  AuditoriaPaginaResultado,
  AuditoriaRow,
  BandaEnCanchaVista,
  DesbloqueoCategoriaCard,
  EventoEnCursoVista,
  HistorialParticipacionEvento,
  MetadataCampoVisible,
  ParticipacionBandaVista,
  PerfilUsuarioFiltro,
} from "@/models";
import { dataBaseSupabase } from "@/lib/supabase";

const PAGE_SIZE_DEFAULT = 25;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const LABEL_METADATO: Record<string, string> = {
  id_foranea_banda: "Banda",
  idForaneaBanda: "Banda",
  id_foranea_evento: "Evento",
  idForaneaEvento: "Evento",
  id_evento: "Evento",
  id_foranea_categoria: "Categoría",
  idForaneaCategoria: "Categoría",
  id_categoria: "Categoría",
  id_foranea_rubrica: "Rúbrica",
  idForaneaRubrica: "Rúbrica",
  id_foranea_criterio: "Criterio",
  idForaneaCriterio: "Criterio",
  id_foranea_cumplimiento: "Cumplimiento",
  idForaneaCumplimiento: "Cumplimiento",
  id_foranea_perfil: "Perfil / evaluador",
  idForaneaPerfil: "Perfil / evaluador",
  id_foranea_user: "Usuario",
  idForaneaUser: "Usuario",
  id_foranea_region: "Región",
  idForaneaRegion: "Región",
  id_foranea_federacion: "Federación",
  idForaneaFederacion: "Federación",
  puntos_obtenidos: "Puntos obtenidos",
  puntosObtenidos: "Puntos obtenidos",
  nombreBanda: "Banda",
  nombreCategoria: "Categoría",
  nombreRubrica: "Rúbrica",
  nombreCriterio: "Criterio",
  LugarEvento: "Lugar",
  estado_anterior: "Estado anterior",
  estado_nuevo: "Estado nuevo",
  estado_asistencia: "Asistencia",
  estado_cancha: "Estado cancha",
  numero_finalizacion: "N.º finalización",
  ya_habia_participado: "Ya había participado",
  ya_habia_finalizado: "Ya había finalizado",
  primera_vez: "Primera vez",
  hora: "Hora (metadata)",
  cantidad_perfiles: "Perfiles afectados",
  ids_perfil: "Perfiles",
  activar: "Activar acceso",
  comentario: "Comentario",
  antes: "Antes",
  despues: "Después",
};

function asRecord(value: unknown): AuditoriaMetadata {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as AuditoriaMetadata;
  }
  return {};
}

/** Extrae mensaje legible de errores PostgREST / genéricos (evita `{}` en consola). */
export function mensajeErrorSupabase(error: unknown): string {
  if (error == null) return "Error desconocido";
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object") {
    const e = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };
    const parts = [e.message, e.details, e.hint, e.code ? `código ${e.code}` : null].filter(
      Boolean,
    );
    if (parts.length) return parts.join(" — ");
  }
  try {
    return JSON.stringify(error);
  } catch {
    return "Error desconocido";
  }
}

function esTablaAuditoriaAusente(error: unknown): boolean {
  const msg = mensajeErrorSupabase(error).toLowerCase();
  return (
    msg.includes("auditoria") &&
    (msg.includes("does not exist") ||
      msg.includes("no existe") ||
      msg.includes("could not find") ||
      msg.includes("schema cache") ||
      msg.includes("42p01"))
  );
}

function pickUuid(meta: AuditoriaMetadata, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = meta[key];
    if (typeof v === "string" && UUID_RE.test(v)) return v;
  }
  return null;
}

export function formatearDuracionMs(ms: number | null | undefined): string | null {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatearHoraLocal(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-HN", {
    timeZone: "America/Tegucigalpa",
    dateStyle: "short",
    timeStyle: "medium",
  });
}

function acortarId(id: string): string {
  return `${id.slice(0, 8)}…`;
}

function valorEscalareLegible(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    if (UUID_RE.test(value)) return acortarId(value);
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

type CatalogosResolucion = {
  bandas: Map<string, string>;
  categorias: Map<string, string>;
  eventos: Map<string, string>;
  rubricas: Map<string, string>;
  criterios: Map<string, string>;
  perfiles: Map<string, string>;
  usuarios: Map<string, string>;
  regiones: Map<string, string>;
  federaciones: Map<string, string>;
  cumplimientos: Map<string, string>;
};

function emptyCatalogos(): CatalogosResolucion {
  return {
    bandas: new Map(),
    categorias: new Map(),
    eventos: new Map(),
    rubricas: new Map(),
    criterios: new Map(),
    perfiles: new Map(),
    usuarios: new Map(),
    regiones: new Map(),
    federaciones: new Map(),
    cumplimientos: new Map(),
  };
}

function collectUuidsFromValue(value: unknown, into: Set<string>): void {
  if (typeof value === "string" && UUID_RE.test(value)) {
    into.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectUuidsFromValue(item, into);
    return;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value as Record<string, unknown>)) {
      collectUuidsFromValue(v, into);
    }
  }
}

async function cargarCatalogos(ids: Set<string>): Promise<CatalogosResolucion> {
  const cat = emptyCatalogos();
  const list = [...ids];
  if (list.length === 0) return cat;

  const chunk = <T,>(arr: T[], size: number) => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  for (const part of chunk(list, 100)) {
    const [
      bandas,
      categorias,
      eventos,
      rubricas,
      criterios,
      perfiles,
      perfilesByUser,
      regiones,
      federaciones,
      cumplimientos,
    ] = await Promise.all([
      dataBaseSupabase.from("bandas").select("id_banda, nombre_banda").in("id_banda", part),
      dataBaseSupabase.from("categorias").select("id_categoria, nombre_categoria").in("id_categoria", part),
      dataBaseSupabase.from("registro_eventos").select("id_evento, lugar_evento").in("id_evento", part),
      dataBaseSupabase.from("rubricas").select("id_rubrica, nombre_rubrica").in("id_rubrica", part),
      dataBaseSupabase
        .from("criterios_evaluacion")
        .select("id_criterio, nombre_criterio")
        .in("id_criterio", part),
      dataBaseSupabase
        .from("perfiles")
        .select("id_perfil, nombre, primer_apellido, segundo_nombre")
        .in("id_perfil", part),
      dataBaseSupabase
        .from("perfiles")
        .select("id_foranea_user, id_perfil, nombre, primer_apellido, segundo_nombre")
        .in("id_foranea_user", part),
      dataBaseSupabase.from("regiones").select("id_region, nombre_region").in("id_region", part),
      dataBaseSupabase
        .from("federaciones")
        .select("id_federacion, nombre_federacion")
        .in("id_federacion", part),
      dataBaseSupabase
        .from("cumplimientos")
        .select("id_cumplimiento, detalle_cumplimiento")
        .in("id_cumplimiento", part),
    ]);

    for (const r of bandas.data ?? []) cat.bandas.set(r.id_banda, r.nombre_banda);
    for (const r of categorias.data ?? []) cat.categorias.set(r.id_categoria, r.nombre_categoria);
    for (const r of eventos.data ?? []) cat.eventos.set(r.id_evento, r.lugar_evento);
    for (const r of rubricas.data ?? []) cat.rubricas.set(r.id_rubrica, r.nombre_rubrica);
    for (const r of criterios.data ?? []) cat.criterios.set(r.id_criterio, r.nombre_criterio);
    for (const r of regiones.data ?? []) cat.regiones.set(r.id_region, r.nombre_region);
    for (const r of federaciones.data ?? []) cat.federaciones.set(r.id_federacion, r.nombre_federacion);
    for (const r of cumplimientos.data ?? []) {
      cat.cumplimientos.set(r.id_cumplimiento, r.detalle_cumplimiento ?? acortarId(r.id_cumplimiento));
    }
    for (const r of perfiles.data ?? []) {
      const nombre = [r.nombre, r.segundo_nombre, r.primer_apellido].filter(Boolean).join(" ").trim();
      cat.perfiles.set(r.id_perfil, nombre || acortarId(r.id_perfil));
    }
    for (const r of perfilesByUser.data ?? []) {
      if (!r.id_foranea_user) continue;
      const nombre = [r.nombre, r.segundo_nombre, r.primer_apellido].filter(Boolean).join(" ").trim();
      cat.usuarios.set(r.id_foranea_user, nombre || acortarId(r.id_foranea_user));
      cat.perfiles.set(r.id_perfil, nombre || acortarId(r.id_perfil));
    }
  }

  return cat;
}

function resolverUuid(
  id: string,
  keyHint: string,
  cat: CatalogosResolucion,
): string {
  const k = keyHint.toLowerCase();
  if (k.includes("banda") && cat.bandas.has(id)) return cat.bandas.get(id)!;
  if (k.includes("categoria") && cat.categorias.has(id)) return cat.categorias.get(id)!;
  if ((k.includes("evento") || k === "id_evento") && cat.eventos.has(id)) return cat.eventos.get(id)!;
  if (k.includes("rubrica") && cat.rubricas.has(id)) return cat.rubricas.get(id)!;
  if (k.includes("criterio") && cat.criterios.has(id)) return cat.criterios.get(id)!;
  if (k.includes("cumplimiento") && cat.cumplimientos.has(id)) return cat.cumplimientos.get(id)!;
  if (k.includes("perfil") && cat.perfiles.has(id)) return cat.perfiles.get(id)!;
  if (k.includes("user") && cat.usuarios.has(id)) return cat.usuarios.get(id)!;
  if (k.includes("region") && cat.regiones.has(id)) return cat.regiones.get(id)!;
  if (k.includes("federacion") && cat.federaciones.has(id)) return cat.federaciones.get(id)!;

  return (
    cat.bandas.get(id) ??
    cat.categorias.get(id) ??
    cat.eventos.get(id) ??
    cat.rubricas.get(id) ??
    cat.criterios.get(id) ??
    cat.perfiles.get(id) ??
    cat.usuarios.get(id) ??
    cat.regiones.get(id) ??
    cat.federaciones.get(id) ??
    cat.cumplimientos.get(id) ??
    acortarId(id)
  );
}

function aplanarMetadata(
  meta: AuditoriaMetadata,
  cat: CatalogosResolucion,
  prefix = "",
): MetadataCampoVisible[] {
  const campos: MetadataCampoVisible[] = [];

  for (const [key, raw] of Object.entries(meta)) {
    if (key === "ids_perfil" && Array.isArray(raw)) {
      const nombres = raw.map((id) =>
        typeof id === "string" ? resolverUuid(id, "perfil", cat) : String(id),
      );
      campos.push({
        label: LABEL_METADATO[key] ?? key,
        valor: nombres.length ? nombres.join(", ") : "—",
      });
      continue;
    }

    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      campos.push(
        ...aplanarMetadata(raw as AuditoriaMetadata, cat, prefix ? `${prefix}.${key}` : key),
      );
      continue;
    }

    const labelKey = key;
    const label =
      LABEL_METADATO[labelKey] ??
      (prefix ? `${LABEL_METADATO[prefix] ?? prefix} · ${labelKey}` : labelKey);

    if (typeof raw === "string" && UUID_RE.test(raw)) {
      campos.push({ label, valor: resolverUuid(raw, key, cat) });
    } else {
      campos.push({ label, valor: valorEscalareLegible(raw) });
    }
  }

  return campos;
}

function previewDesde(row: AuditoriaRow, cat: CatalogosResolucion): string {
  const meta = asRecord(row.metadata);
  const accion = row.accion;

  if (accion.startsWith("cancha_")) {
    const bandaId = pickUuid(meta, "id_foranea_banda");
    const banda = bandaId ? resolverUuid(bandaId, "banda", cat) : null;
    return [accion.replace("cancha_", "Cancha "), banda].filter(Boolean).join(" · ");
  }

  if (accion.startsWith("acceso_")) {
    const catId = pickUuid(meta, "id_categoria", "id_foranea_categoria");
    const evId = pickUuid(meta, "id_evento", "id_foranea_evento");
    const parts = [
      accion === "acceso_bloquear" ? "Bloqueo" : "Desbloqueo",
      catId ? resolverUuid(catId, "categoria", cat) : null,
      evId ? resolverUuid(evId, "evento", cat) : null,
    ].filter(Boolean);
    return parts.join(" · ");
  }

  const bandaId = pickUuid(meta, "id_foranea_banda", "id_foranea_banda");
  const rubricaId = pickUuid(meta, "id_foranea_rubrica", "id_foranea_rubrica");
  const nombre = typeof meta.nombre_banda === "string" ? meta.nombre_banda : null;
  const parts = [
    row.tabla,
    nombre ?? (bandaId ? resolverUuid(bandaId, "banda", cat) : null),
    rubricaId ? resolverUuid(rubricaId, "rubrica", cat) : null,
  ].filter(Boolean);
  return parts.slice(0, 3).join(" · ") || row.accion;
}

function mapRowToDetalle(
  row: AuditoriaRow,
  cat: CatalogosResolucion,
): AuditoriaDetalleEnriquecido {
  const nombreUsuario = row.id_foranea_user
    ? cat.usuarios.get(row.id_foranea_user) ?? acortarId(row.id_foranea_user)
    : "Sistema / sin sesión";

  return {
    row,
    nombreUsuario,
    preview: previewDesde(row, cat),
    campos: aplanarMetadata(asRecord(row.metadata), cat),
  };
}

async function enriquecerFilas(rows: AuditoriaRow[]): Promise<AuditoriaDetalleEnriquecido[]> {
  const ids = new Set<string>();
  for (const row of rows) {
    if (row.id_foranea_user) ids.add(row.id_foranea_user);
    collectUuidsFromValue(row.metadata, ids);
  }
  const cat = await cargarCatalogos(ids);
  return rows.map((r) => mapRowToDetalle(r, cat));
}

function parseAuditoriaRow(raw: Record<string, unknown>): AuditoriaRow {
  return {
    id_auditoria: String(raw.id_auditoria),
    fecha: String(raw.fecha),
    id_foranea_user: (raw.id_foranea_user as string | null) ?? null,
    accion: raw.accion as AuditoriaAccion,
    tabla: String(raw.tabla),
    id_registro: (raw.id_registro as string | null) ?? null,
    metadata: asRecord(raw.metadata),
  };
}

export async function getEventosEnCurso(): Promise<EventoEnCursoVista[]> {
  const { data, error } = await dataBaseSupabase
    .from("registro_eventos")
    .select(
      `
      id_evento,
      lugar_evento,
      fecha_evento,
      estado_evento,
      tipo_evento,
      regiones ( nombre_region )
    `,
    )
    .eq("estado_evento", "iniciado")
    .order("fecha_evento", { ascending: true });

  if (error) throw new Error(mensajeErrorSupabase(error));

  return (data ?? []).map((e) => {
    const region = e.regiones as { nombre_region?: string } | null;
    return {
      idEvento: e.id_evento,
      lugarEvento: e.lugar_evento,
      fechaEvento: e.fecha_evento,
      estadoEvento: e.estado_evento ?? "iniciado",
      tipoEvento: e.tipo_evento ?? null,
      nombreRegion: region?.nombre_region ?? null,
    };
  });
}

export async function getBandasEnCancha(): Promise<BandaEnCanchaVista[]> {
  const eventos = await getEventosEnCurso();
  if (eventos.length === 0) return [];

  const idsEvento = eventos.map((e) => e.idEvento);
  const lugarById = new Map(eventos.map((e) => [e.idEvento, e.lugarEvento]));

  const { data: confs, error } = await dataBaseSupabase
    .from("confirmacion_asistencia")
    .select(
      `
      id_confirmacion_asistencia,
      id_foranea_banda,
      id_foranea_evento,
      estado_cancha,
      bandas ( nombre_banda )
    `,
    )
    .in("id_foranea_evento", idsEvento)
    .eq("estado_cancha", "ya_en_cancha");

  if (error) throw new Error(mensajeErrorSupabase(error));
  if (!confs?.length) return [];

  const { data: audits, error: errAud } = await dataBaseSupabase
    .from("auditoria")
    .select("*")
    .eq("tabla", "confirmacion_asistencia")
    .in("accion", ["cancha_entrar", "cancha_reponer"])
    .order("fecha", { ascending: false })
    .limit(500);

  if (errAud) {
    if (esTablaAuditoriaAusente(errAud)) {
      return confs.map((c) => {
        const id_banda = c.id_foranea_banda as string;
        const id_evento = c.id_foranea_evento as string;
        const bandaJoin = c.bandas as { nombre_banda?: string } | null;
        return {
          idEvento: id_evento,
          lugarEvento: lugarById.get(id_evento) ?? "—",
          idBanda: id_banda,
          nombreBanda: bandaJoin?.nombre_banda ?? acortarId(id_banda),
          idConfirmacion: c.id_confirmacion_asistencia as string,
          quienPusoNombre: "—",
          horaPuesta: null,
          accionOrigen: null,
        };
      });
    }
    throw new Error(mensajeErrorSupabase(errAud));
  }

  const userIds = new Set<string>();
  for (const a of audits ?? []) {
    if (a.id_foranea_user) userIds.add(a.id_foranea_user);
  }
  const cat = await cargarCatalogos(userIds);

  const resultado: BandaEnCanchaVista[] = [];

  for (const c of confs) {
    const id_banda = c.id_foranea_banda as string;
    const id_evento = c.id_foranea_evento as string;
    const bandaJoin = c.bandas as { nombre_banda?: string } | null;

    const audit = (audits ?? []).find((a) => {
      const meta = asRecord(a.metadata);
      return (
        meta.id_foranea_banda === id_banda &&
        meta.id_foranea_evento === id_evento
      );
    });

    resultado.push({
      idEvento: id_evento,
      lugarEvento: lugarById.get(id_evento) ?? "—",
      idBanda: id_banda,
      nombreBanda: bandaJoin?.nombre_banda ?? acortarId(id_banda),
      idConfirmacion: c.id_confirmacion_asistencia,
      quienPusoNombre: audit?.id_foranea_user
        ? cat.usuarios.get(audit.id_foranea_user) ?? acortarId(audit.id_foranea_user)
        : "—",
      horaPuesta: audit?.fecha ?? null,
      accionOrigen: (audit?.accion as "cancha_entrar" | "cancha_reponer" | undefined) ?? null,
    });
  }

  return resultado;
}

type CanchaAuditLite = {
  accion: string;
  fecha: string;
  id_banda: string;
  id_evento: string;
};

function ciclosParticipacion(
  audits: CanchaAuditLite[],
): { horaInicio: string; horaFin: string | null }[] {
  const ordered = [...audits].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
  );
  const ciclos: { horaInicio: string; horaFin: string | null }[] = [];
  let open: string | null = null;

  for (const a of ordered) {
    if (a.accion === "cancha_entrar" || a.accion === "cancha_reponer") {
      if (open) {
        ciclos.push({ horaInicio: open, horaFin: null });
      }
      open = a.fecha;
    } else if (a.accion === "cancha_finalizar" && open) {
      ciclos.push({ horaInicio: open, horaFin: a.fecha });
      open = null;
    }
  }
  if (open) ciclos.push({ horaInicio: open, horaFin: null });
  return ciclos;
}

export async function getHistorialParticipacionHoy(): Promise<HistorialParticipacionEvento[]> {
  const hoy = fechaHoyLocalISO();

  const { data: eventos, error } = await dataBaseSupabase
    .from("registro_eventos")
    .select("id_evento, lugar_evento, fecha_evento")
    .eq("fecha_evento", hoy)
    .order("fecha_evento", { ascending: true });

  if (error) throw new Error(mensajeErrorSupabase(error));
  if (!eventos?.length) return [];

  const idsEvento = eventos.map((e) => e.id_evento);

  const { data: confs, error: errConf } = await dataBaseSupabase
    .from("confirmacion_asistencia")
    .select(
      `
      id_confirmacion_asistencia,
      id_foranea_banda,
      id_foranea_evento,
      estado_asistencia,
      estado_cancha,
      bandas ( nombre_banda )
    `,
    )
    .in("id_foranea_evento", idsEvento)
    .eq("estado_asistencia", true);

  if (errConf) throw new Error(mensajeErrorSupabase(errConf));

  const { data: audits, error: errAud } = await dataBaseSupabase
    .from("auditoria")
    .select("accion, fecha, metadata")
    .eq("tabla", "confirmacion_asistencia")
    .in("accion", ["cancha_entrar", "cancha_reponer", "cancha_finalizar"])
    .gte("fecha", `${hoy}T00:00:00`)
    .order("fecha", { ascending: true })
    .limit(2000);

  if (errAud && !esTablaAuditoriaAusente(errAud)) {
    throw new Error(mensajeErrorSupabase(errAud));
  }

  const auditsLite: CanchaAuditLite[] = (audits ?? [])
    .map((a) => {
      const meta = asRecord(a.metadata);
      const id_banda = pickUuid(meta, "id_foranea_banda");
      const id_evento = pickUuid(meta, "id_foranea_evento");
      if (!id_banda || !id_evento) return null;
      if (!idsEvento.includes(id_evento)) return null;
      return {
        accion: String(a.accion),
        fecha: String(a.fecha),
        id_banda,
        id_evento,
      };
    })
    .filter((x): x is CanchaAuditLite => x != null);

  const out: HistorialParticipacionEvento[] = [];

  for (const ev of eventos) {
    const confEvento = (confs ?? []).filter((c) => c.id_foranea_evento === ev.id_evento);
    const participaciones: ParticipacionBandaVista[] = [];

    for (const c of confEvento) {
      const id_banda = c.id_foranea_banda as string;
      const nombre_banda =
        (c.bandas as { nombre_banda?: string } | null)?.nombre_banda ?? acortarId(id_banda);
      const auditsBanda = auditsLite.filter(
        (a) => a.id_banda === id_banda && a.id_evento === ev.id_evento,
      );
      const ciclos = ciclosParticipacion(auditsBanda);
      const ultimo = ciclos.length ? ciclos[ciclos.length - 1] : null;
      const estadoCancha = c.estado_cancha ?? "pendiente";

      let estado: ParticipacionBandaVista["estado"] = "pendiente";
      let horaInicio: string | null = null;
      let horaFin: string | null = null;

      if (estadoCancha === "ya_en_cancha") {
        estado = "en_cancha";
        horaInicio = ultimo?.horaInicio ?? null;
        horaFin = null;
      } else if (estadoCancha === "finalizado" || (ultimo && ultimo.horaFin)) {
        estado = "finalizada";
        horaInicio = ultimo?.horaInicio ?? null;
        horaFin = ultimo?.horaFin ?? null;
      } else {
        estado = "pendiente";
      }

      const duracionMs =
        horaInicio && horaFin
          ? new Date(horaFin).getTime() - new Date(horaInicio).getTime()
          : null;

      participaciones.push({
        idEvento: ev.id_evento,
        lugarEvento: ev.lugar_evento,
        idBanda: id_banda,
        nombreBanda: nombre_banda,
        estado,
        horaInicio,
        horaFin,
        duracionMs,
        duracionTexto: formatearDuracionMs(duracionMs),
      });
    }

    const enCancha = participaciones.filter((p) => p.estado === "en_cancha");
    const finalizadas = participaciones
      .filter((p) => p.estado === "finalizada")
      .sort((a, b) => {
        const ta = a.horaFin ? new Date(a.horaFin).getTime() : 0;
        const tb = b.horaFin ? new Date(b.horaFin).getTime() : 0;
        return tb - ta;
      });
    const pendientes = participaciones.filter((p) => p.estado === "pendiente");

    out.push({
      idEvento: ev.id_evento,
      lugarEvento: ev.lugar_evento,
      fechaEvento: ev.fecha_evento,
      participaciones: [...enCancha, ...finalizadas, ...pendientes],
    });
  }

  return out;
}

export async function getAccesosPorEventoCategoria(): Promise<AccesoCategoriaVista[]> {
  const hoy = fechaHoyLocalISO();
  const eventosEnCurso = await getEventosEnCurso();
  const idsEnCurso = new Set(eventosEnCurso.map((e) => e.idEvento));

  const { data, error } = await dataBaseSupabase
    .from("auditoria")
    .select("*")
    .eq("tabla", "acceso_categoria")
    .in("accion", ["acceso_bloquear", "acceso_desbloquear"])
    .gte("fecha", `${hoy}T00:00:00`)
    .order("fecha", { ascending: true })
    .limit(1000);

  if (error) {
    if (esTablaAuditoriaAusente(error)) return [];
    throw new Error(mensajeErrorSupabase(error));
  }
  const map = new Map<
    string,
    {
      id_evento: string;
      id_categoria: string;
      horaBloqueo: string | null;
      horaDesbloqueo: string | null;
    }
  >();

  const ids = new Set<string>();

  for (const raw of data ?? []) {
    const meta = asRecord(raw.metadata);
    const id_evento = pickUuid(meta, "id_evento", "id_foranea_evento");
    const id_categoria = pickUuid(meta, "id_categoria", "id_foranea_categoria");
    if (!id_evento || !id_categoria) continue;
    // Preferir eventos en curso; si no hay, incluir todos los del día
    if (idsEnCurso.size > 0 && !idsEnCurso.has(id_evento)) {
      // aún así incluir si es del día (ya filtrado por fecha)
    }
    ids.add(id_evento);
    ids.add(id_categoria);
    const key = `${id_evento}::${id_categoria}`;
    const cur = map.get(key) ?? {
      id_evento,
      id_categoria,
      horaBloqueo: null,
      horaDesbloqueo: null,
    };
    if (raw.accion === "acceso_bloquear") cur.horaBloqueo = String(raw.fecha);
    if (raw.accion === "acceso_desbloquear") cur.horaDesbloqueo = String(raw.fecha);
    map.set(key, cur);
  }

  const cat = await cargarCatalogos(ids);
  const lugarByEvento = new Map(eventosEnCurso.map((e) => [e.idEvento, e.lugarEvento]));

  // Completar lugares de eventos del día no en curso
  const missingEventos = [...ids].filter((id) => !lugarByEvento.has(id) && cat.eventos.has(id));
  for (const id of missingEventos) {
    lugarByEvento.set(id, cat.eventos.get(id)!);
  }

  return [...map.values()].map((v) => ({
    idEvento: v.id_evento,
    lugarEvento: lugarByEvento.get(v.id_evento) ?? cat.eventos.get(v.id_evento) ?? "—",
    idCategoria: v.id_categoria,
    nombreCategoria: cat.categorias.get(v.id_categoria) ?? acortarId(v.id_categoria),
    horaBloqueo: v.horaBloqueo,
    horaDesbloqueo: v.horaDesbloqueo,
  }));
}

export async function getCardsDesbloqueoCategoria(): Promise<DesbloqueoCategoriaCard[]> {
  const accesos = await getAccesosPorEventoCategoria();
  if (accesos.length === 0) return [];

  const hoy = fechaHoyLocalISO();
  const { data: auditsFin, error } = await dataBaseSupabase
    .from("auditoria")
    .select("fecha, metadata")
    .eq("tabla", "confirmacion_asistencia")
    .eq("accion", "cancha_finalizar")
    .gte("fecha", `${hoy}T00:00:00`)
    .order("fecha", { ascending: false })
    .limit(2000);

  if (error) {
    if (esTablaAuditoriaAusente(error)) return [];
    throw new Error(mensajeErrorSupabase(error));
  }

  // Necesitamos categoría de cada banda
  const bandaIds = new Set<string>();
  const finByEventoBanda: { id_evento: string; id_banda: string; fecha: string }[] = [];
  for (const a of auditsFin ?? []) {
    const meta = asRecord(a.metadata);
    const id_evento = pickUuid(meta, "id_foranea_evento");
    const id_banda = pickUuid(meta, "id_foranea_banda");
    if (!id_evento || !id_banda) continue;
    bandaIds.add(id_banda);
    finByEventoBanda.push({ id_evento, id_banda, fecha: String(a.fecha) });
  }

  if (bandaIds.size === 0) {
    return accesos.map((acc) => ({
      idEvento: acc.idEvento,
      lugarEvento: acc.lugarEvento,
      idCategoria: acc.idCategoria,
      nombreCategoria: acc.nombreCategoria,
      idUltimaBanda: null,
      nombreUltimaBanda: null,
      horaUltimaFinalizacion: null,
      horaDesbloqueo: acc.horaDesbloqueo,
      duracionMs: null,
      duracionTexto: null,
      pendienteDesbloqueo: !acc.horaDesbloqueo,
    }));
  }

  const { data: bandas, error: errB } = await dataBaseSupabase
    .from("bandas")
    .select("id_banda, nombre_banda, id_foranea_categoria")
    .in("id_banda", [...bandaIds]);

  if (errB) throw new Error(mensajeErrorSupabase(errB));

  const bandaInfo = new Map(
    (bandas ?? []).map((b) => [
      b.id_banda,
      { nombre: b.nombre_banda as string, id_categoria: b.id_foranea_categoria as string | null },
    ]),
  );

  const cards: DesbloqueoCategoriaCard[] = [];

  for (const acc of accesos) {
    const fins = finByEventoBanda.filter((f) => {
      if (f.id_evento !== acc.idEvento) return false;
      const info = bandaInfo.get(f.id_banda);
      return info?.id_categoria === acc.idCategoria;
    });
    // ya ordenados desc por query; tomar el más reciente
    const ultima = fins[0] ?? null;
    const horaUltima = ultima?.fecha ?? null;
    const horaDes = acc.horaDesbloqueo;
    let duracionMs: number | null = null;
    if (horaUltima && horaDes) {
      duracionMs = new Date(horaDes).getTime() - new Date(horaUltima).getTime();
    }

    cards.push({
      idEvento: acc.idEvento,
      lugarEvento: acc.lugarEvento,
      idCategoria: acc.idCategoria,
      nombreCategoria: acc.nombreCategoria,
      idUltimaBanda: ultima?.id_banda ?? null,
      nombreUltimaBanda: ultima ? bandaInfo.get(ultima.id_banda)?.nombre ?? null : null,
      horaUltimaFinalizacion: horaUltima,
      horaDesbloqueo: horaDes,
      duracionMs,
      duracionTexto: formatearDuracionMs(duracionMs),
      pendienteDesbloqueo: !horaDes && !!horaUltima,
    });
  }

  return cards;
}

export async function getAuditoriaPaginada(
  filtros: AuditoriaFiltros,
  page: number,
  pageSize: number = PAGE_SIZE_DEFAULT,
): Promise<AuditoriaPaginaResultado> {
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;

  let userIdsFiltro: string[] | null = null;
  if (filtros.textoUsuario?.trim()) {
    const q = filtros.textoUsuario.trim();
    const { data: perfiles } = await dataBaseSupabase
      .from("perfiles")
      .select('"id_foranea_user", nombre, "primer_apellido"')
      .or(`nombre.ilike.%${q}%,primer_apellido.ilike.%${q}%`)
      .limit(50);
    userIdsFiltro = (perfiles ?? [])
      .map((p) => p.id_foranea_user as string | null)
      .filter((id): id is string => !!id);
    if (userIdsFiltro.length === 0) {
      return { rows: [], total: 0, page: safePage, pageSize, totalPages: 0 };
    }
  }

  let query = dataBaseSupabase
    .from("auditoria")
    .select("*", { count: "exact" })
    .order("fecha", { ascending: false })
    .range(from, to);

  if (filtros.idForaneaUser) {
    query = query.eq("id_foranea_user", filtros.idForaneaUser);
  } else if (userIdsFiltro) {
    query = query.in("id_foranea_user", userIdsFiltro);
  }
  if (filtros.accion) query = query.eq("accion", filtros.accion);
  if (filtros.tabla) query = query.eq("tabla", filtros.tabla);
  if (filtros.fechaDesde) query = query.gte("fecha", `${filtros.fechaDesde}T00:00:00`);
  if (filtros.fechaHasta) query = query.lte("fecha", `${filtros.fechaHasta}T23:59:59.999`);

  const { data, error, count } = await query;
  if (error) {
    if (esTablaAuditoriaAusente(error)) {
      return { rows: [], total: 0, page: safePage, pageSize, totalPages: 0 };
    }
    throw new Error(mensajeErrorSupabase(error));
  }

  const rowsRaw = (data ?? []).map((r) => parseAuditoriaRow(r as Record<string, unknown>));
  const rows = await enriquecerFilas(rowsRaw);
  const total = count ?? 0;

  return {
    rows,
    total,
    page: safePage,
    pageSize,
    totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
  };
}

export async function enriquecerMetadata(
  row: AuditoriaRow,
): Promise<AuditoriaDetalleEnriquecido> {
  const [detalle] = await enriquecerFilas([row]);
  return detalle;
}

export async function listarUsuariosConAuditoria(): Promise<PerfilUsuarioFiltro[]> {
  const { data, error } = await dataBaseSupabase
    .from("auditoria")
    .select("id_foranea_user")
    .not("id_foranea_user", "is", null)
    .limit(500);

  if (error) {
    if (esTablaAuditoriaAusente(error)) return [];
    throw new Error(mensajeErrorSupabase(error));
  }
  const ids = [...new Set((data ?? []).map((d) => d.id_foranea_user as string))];
  if (ids.length === 0) return [];

  const cat = await cargarCatalogos(new Set(ids));
  const { data: perfiles } = await dataBaseSupabase
    .from("perfiles")
    .select("id_perfil, id_foranea_user, nombre, primer_apellido")
    .in("id_foranea_user", ids);

  return (perfiles ?? [])
    .filter((p) => p.id_foranea_user)
    .map((p) => ({
      idForaneaUser: p.id_foranea_user as string,
      idPerfil: p.id_perfil as string,
      nombreCompleto:
        cat.usuarios.get(p.id_foranea_user as string) ??
        ([p.nombre, p.primer_apellido].filter(Boolean).join(" ") ||
          acortarId(p.id_foranea_user as string)),
    }))
    .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto, "es"));
}

export const AUDITORIA_ACCIONES_FILTRO: string[] = [
  "insert",
  "update",
  "delete",
  "cancha_entrar",
  "cancha_finalizar",
  "cancha_reponer",
  "acceso_bloquear",
  "acceso_desbloquear",
];

export const AUDITORIA_TABLAS_FILTRO: string[] = [
  "acceso_categoria",
  "confirmacion_asistencia",
  "registro_cumplimiento_evaluaciones",
  "registro_eventos",
  "bandas",
  "perfiles",
  "categorias",
  "rubricas",
  "checkout",
  "copas",
  "sanciones",
  "registro_sanciones",
];
