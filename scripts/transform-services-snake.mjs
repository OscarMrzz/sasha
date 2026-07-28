/**
 * Transform string literals in src/services to snake_case DB identifiers.
 * Leaves TS property access (camelCase) untouched.
 */
import fs from "fs";
import path from "path";

const RENAME_MIG = "supabase/migrations/20260728000000_snake_case_rename.sql";
/** Only DB-facing layers. Do NOT include helpers/UI (app stays camelCase). */
const TARGET_DIRS = ["src/services", "src/actions", "src/lib"];

const tableFixes = {
  criteriosEvalucion: "criterios_evaluacion",
  solicitudRevicion: "solicitud_revision",
  respuestaSolicitudRevicion: "respuesta_solicitud_revision",
  registroCumplimientoEvaluaciones: "registro_cumplimiento_evaluaciones",
  registroEquipoEvaluador: "registro_equipo_evaluador",
  registroEventos: "registro_eventos",
  registroComentarios: "registro_comentarios",
  registroPenalizaciones: "registro_penalizaciones",
  rolesEquipoEvaluador: "roles_equipo_evaluador",
};

const viewFixes = {
  vistaAplicacionSanciones: "vista_aplicacion_sanciones",
  vistaAsistenciaBandas: "vista_asistencia_bandas",
  vistaAsistenciaEventos: "vista_asistencia_eventos",
  vistaAsistenciaEventosGlobal: "vista_asistencia_eventos_global",
  vistaBandasConfirmadas: "vista_bandas_confirmadas",
  vistaBandasEvento: "vista_bandas_evento",
  vistaCondensado: "vista_condensado",
  vistaCopasEvento: "vista_copas_evento",
  vistaCopasGlobal: "vista_copas_global",
  vistaCopasTemporada: "vista_copas_temporada",
  vistaDetalleCheckout: "vista_detalle_checkout",
  vistaRendimientoPorRubricaEventoActual: "vista_rendimiento_por_rubrica_evento_actual",
  vistaRendimientoPorRubricaGlobalActual: "vista_rendimiento_por_rubrica_global_actual",
  vistaResultadosEventos: "vista_resultados_eventos",
  vistaResultadosGenerales: "vista_resultados_generales",
  vistaResultadosPreliminares: "vista_resultados_preliminares",
  vistaResultadosTemporada: "vista_resultados_temporada",
  vistaSolicitudCopas: "vista_solicitud_copas",
  vistaSolicitudRevicion: "vista_solicitud_revision",
  vistaSolicitudSancion: "vista_solicitud_sancion",
  vistaUsuariosPorBandaEnEvento: "vista_usuarios_por_banda_en_evento",
};

const STORAGE_BUCKETS = new Set([
  "imgLogoBandas",
  "img-fotos-perfiles-aurora",
  "imgFotosPerfiles",
]);

function camelToSnake(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

const idMap = new Map(Object.entries({ ...tableFixes, ...viewFixes }));
const renameMig = fs.readFileSync(RENAME_MIG, "utf8");
for (const m of renameMig.matchAll(/RENAME COLUMN "([^"]+)" TO ([a-z0-9_]+);/g)) {
  idMap.set(m[1], m[2]);
}
for (const m of renameMig.matchAll(/ALTER TABLE public\."([^"]+)" RENAME TO ([a-z0-9_]+);/g)) {
  idMap.set(m[1], m[2]);
}

// Common camelCase DB ids that appear in services
const extras = [
  "idBanda", "nombreBanda", "AliasBanda", "idForaneaCategoria", "idForaneaRegion",
  "idForaneaFederacion", "ciudadBanda", "urlLogoBanda", "fechaFundacionBanda",
  "fechaInscripcionAFederacion", "ubicacionSedeBanda",
  "idCategoria", "nombreCategoria", "detallesCategoria",
  "idCriterio", "nombreCriterio", "detallesCriterio", "puntosCriterio", "idForaneaRubrica",
  "idCumplimiento", "detalleCumplimiento", "puntosCumplimiento", "idForaneaCriterio",
  "idFederacion", "nombreFederacion",
  "idPenalizacion", "nombrePenalizacion", "detallesPenalizacion", "puntosPenalizacion",
  "idPerfil", "fechaNacimiento", "numeroTelefono", "idForaneaUser", "segundoNombre",
  "primerApellido", "segundoApellido", "idForaneaBanda", "idForaneaRol", "urlFotoPerfil",
  "idPermiso", "idRegion", "nombreRegion",
  "idComentario", "idForaneaEvento", "idForaneaEvaluador", "textoComentario",
  "idRegistroCumplimiento", "idForaneaCumplimiento", "puntosObtenidos",
  "idRegistroEquipo", "idForaneaRolEquipo",
  "idEvento", "LugarEvento", "fechaEvento",
  "idRegistroPenalizacion", "idForaneaPenalizacion",
  "idRespuesta", "idForaneaSolicitudRevicion", "idForaneaSolicitudRevision",
  "idRol", "nombreRol", "estadoRol", "DetallesRol",
  "idRolEquipo", "nombreRolEquipo",
  "idRubrica", "nombreRubrica", "datalleRubrica", "puntosRubrica", "versionRubrica",
  "idSancion", "nombreSancion", "detallesSancion",
  "idSolicitud", "idForaneaSolicitante", "motivoSolicitud",
  "idSolicitudCopa", "idSolicitudSancion",
  "idForaneaSolicitanteRevicion",
];
for (const e of extras) {
  if (!idMap.has(e)) idMap.set(e, camelToSnake(e));
}

const sorted = [...idMap.entries()].sort((a, b) => b[0].length - a[0].length);

function transformLiteral(content) {
  if (STORAGE_BUCKETS.has(content.trim())) return content;
  let out = content;
  for (const [old, neu] of sorted) {
    if (old === neu) continue;
    out = out.replace(new RegExp(`\\b${old}\\b`, "g"), neu);
  }
  return out;
}

/** Replace contents of '...' and "..." and `...` string literals (no template ${}). */
function transformFile(source) {
  let result = "";
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    if (c === "'" || c === '"' || c === "`") {
      const quote = c;
      let j = i + 1;
      let lit = "";
      let escaped = false;
      let hasInterp = false;
      while (j < source.length) {
        const ch = source[j];
        if (escaped) {
          lit += ch;
          escaped = false;
          j++;
          continue;
        }
        if (ch === "\\") {
          lit += ch;
          escaped = true;
          j++;
          continue;
        }
        if (quote === "`" && ch === "$" && source[j + 1] === "{") {
          hasInterp = true;
          break;
        }
        if (ch === quote) break;
        lit += ch;
        j++;
      }
      if (hasInterp || j >= source.length) {
        // leave template with interpolation as-is for that segment start; copy one char
        result += c;
        i++;
        continue;
      }
      const transformed = transformLiteral(lit);
      result += quote + transformed + quote;
      i = j + 1;
      continue;
    }
    // skip comments
    if (c === "/" && source[i + 1] === "/") {
      const end = source.indexOf("\n", i);
      const slice = end === -1 ? source.slice(i) : source.slice(i, end + 1);
      result += slice;
      i += slice.length;
      continue;
    }
    if (c === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      const slice = end === -1 ? source.slice(i) : source.slice(i, end + 2);
      result += slice;
      i += slice.length;
      continue;
    }
    result += c;
    i++;
  }
  return result;
}

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "mappers") continue;
      out.push(...walk(p));
    } else if (ent.name.endsWith(".ts")) out.push(p);
  }
  return out;
}

let changed = 0;
for (const dir of TARGET_DIRS) {
  if (!fs.existsSync(dir)) continue;
  for (const file of walk(dir)) {
    // Skip already-transformed services mappers and avoid double-processing noise
    if (file.includes(`${path.sep}mappers${path.sep}`)) continue;
    const before = fs.readFileSync(file, "utf8");
    const after = transformFile(before);
    if (after !== before) {
      fs.writeFileSync(file, after, "utf8");
      changed++;
      console.log("updated", file);
    }
  }
}
console.log("files changed:", changed, "map size:", idMap.size);
