/**
 * Split interfaces into real per-file models with brace-aware parsing.
 * Sources: git HEAD interfaces (authoritative content).
 * Run: node scripts/split-models-real.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MODELS = path.join(ROOT, "src", "models");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content.replace(/\r\n/g, "\n").trimEnd() + "\n", "utf8");
}

function gitShow(relPath) {
  return execSync(`git show HEAD:${relPath}`, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
}

/** Brace-aware extraction of export interface|type blocks (JSDoc attached by lookbehind). */
function parseExports(src) {
  const startRe = /export\s+(interface|type)\s+(\w+)/g;
  const starts = [];
  let m;
  while ((m = startRe.exec(src))) {
    let index = m.index;
    const before = src.slice(0, m.index);
    const ws = before.match(/\s*$/)?.[0] ?? "";
    const end = before.length - ws.length;
    if (before.slice(Math.max(0, end - 2), end) === "*/") {
      const start = before.lastIndexOf("/**", end);
      if (start !== -1) index = start;
    }
    starts.push({ index, kind: m[1], name: m[2] });
  }

  const exports = [];
  for (let i = 0; i < starts.length; i++) {
    const cur = starts[i];
    const nextStart = i + 1 < starts.length ? starts[i + 1].index : src.length;
    let slice = src.slice(cur.index, nextStart).trimEnd();
    slice = slice.replace(/\n\s*\/\/[-].*$/s, "").trimEnd();

    if (cur.kind === "interface") {
      const braceStart = slice.indexOf("{");
      if (braceStart !== -1) {
        let depth = 0;
        let end = -1;
        for (let j = braceStart; j < slice.length; j++) {
          if (slice[j] === "{") depth++;
          else if (slice[j] === "}") {
            depth--;
            if (depth === 0) {
              end = j;
              break;
            }
          }
        }
        if (end !== -1) slice = slice.slice(0, end + 1);
      }
    } else {
      const eq = slice.indexOf("=");
      if (eq !== -1) {
        let depthAngle = 0;
        let end = -1;
        for (let j = eq; j < slice.length; j++) {
          const ch = slice[j];
          if (ch === "<") depthAngle++;
          else if (ch === ">") depthAngle--;
          else if (ch === ";" && depthAngle === 0) {
            end = j;
            break;
          }
        }
        if (end !== -1) slice = slice.slice(0, end + 1);
      }
    }

    exports.push({ kind: cur.kind, name: cur.name, body: slice.trim() + "\n" });
  }
  return exports;
}

function collectRefs(body, selfName, knownNames) {
  const refs = [];
  for (const name of knownNames) {
    if (name === selfName) continue;
    if (new RegExp(`\\b${name}\\b`).test(body)) refs.push(name);
  }
  return refs.sort();
}

function importPath(fromRel, toRel) {
  const fromDir = path.posix.dirname(fromRel);
  let rel = path.posix.relative(fromDir, toRel);
  if (!rel.startsWith(".")) rel = "./" + rel;
  return rel;
}

const DOMAIN = {
  // base
  federacionInterface: "federaciones",
  categoriaInterface: "categorias",
  categoriaDatosAmpleosInterface: "categorias",
  regionesInterface: "regiones",
  regionesDatosAmpleosInterface: "regiones",
  rolInterface: "roles",
  rolEquipoEvaluadorInterface: "roles",
  rolEquipoEvaluadorDatosAmpleosInterface: "roles",
  bandaInterface: "bandas",
  bandaDatosAmpleosInterface: "bandas",
  criterioEvaluacionInterface: "criterios",
  vista_criterio_idForaneaCategoriaInterface: "criterios",
  criterioEvaluacionDatosAmpleosInterface: "criterios",
  criterioEvaluacionConCumplimientosInterface: "criterios",
  jennieCumplimientoPaqueteInterface: "criterios",
  jennieCriterioPaqueteInterface: "criterios",
  jennieRubricaPaqueteInterface: "criterios",
  jenniePaqueteInterface: "criterios",
  cumplimientosInterface: "cumplimientos",
  cumplimientosDatosAmpleosInterface: "cumplimientos",
  registroCumplimientoEvaluacionInterface: "cumplimientos",
  registroCumplimientoEvaluacionDatosAmpleosInterface: "cumplimientos",
  penalizacionesInterface: "penalizaciones",
  penalizacionesDatosAmpleosInterface: "penalizaciones",
  registroPenalizacionInterface: "penalizaciones",
  registroPenalizacionDatosAmpleosInterface: "penalizaciones",
  perfilInterface: "perfiles",
  perfilDatosAmpleosInterface: "perfiles",
  userInterface: "perfiles",
  RegistroEventoInterface: "eventos",
  registroEventoDatosAmpleosInterface: "eventos",
  vistaBandasEventoInterface: "eventos",
  vistaUsuariosPorBandaEnEventoInterface: "eventos",
  registroEquipoEvaluadorInterface: "equipoEvaluador",
  registroEquipoEvaluadorDatosAmpleosInterface: "equipoEvaluador",
  registroComentariosInterface: "comentarios",
  registroComentariosDatosAmpleosInterface: "comentarios",
  rubricaInterface: "rubricas",
  rubricaDatosAmpleosInterface: "rubricas",
  rubricaConsultaCompletaInterface: "rubricas",
  resultadosGeneralesInterface: "resultados",
  resultadosEventoInterface: "resultados",
  resultadosEventoDatosAmpleosInterface: "resultados",
  vistaResultadosModel: "resultados",
  vistaResultadosTenporadaInterface: "resultados",
  resultadosTemporadaInterface: "resultados",
  vistaResultadosPreliminaresInterface: "resultados",
  escuadraInterface: "resultados",
  PremioEscuadraInterface: "resultados",
  vistaRendimientoPorRubricaEventoInterface: "resultados",
  vistaRendimientoPorRubricaGlobalInterface: "resultados",
  rankingGlobalTemporadaActualInterface: "resultados",
  vistaResultadosPorEventoInterface: "resultados",
  vistaCondensado: "resultados",
  solicitudRevicionInterface: "solicitudes",
  solicitudRevicionDatosAmpleosInterface: "solicitudes",
  respuestaSolicitudRevicionInterface: "solicitudes",
  respuestaSolicitudRevicionDatosAmpleosInterface: "solicitudes",
  vistaSolicitudRevicionInterface: "solicitudes",
  confirmacionAsistenciaInterface: "asistencia",
  confirmacionAsistenciaInsert: "asistencia",
  confirmacionAsistenciaEstadoUpdate: "asistencia",
  confirmacionConBandaInterface: "asistencia",
  vistaBandasConfirmadasParaEventoInterface: "asistencia",
  vistaAsistenBandasModel: "asistencia",
  vistaAsistenciaEventosInterface: "asistencia",
  vistaAsistenciaEventosGlobalInterface: "asistencia",
  copaInterface: "copas",
  vistaCopasEventosInterface: "copas",
  vistaCopasGlobalInterface: "copas",
  vistaCopasTemporadaInterface: "copas",
  sancionInterface: "sanciones",
  registroSancionInterface: "sanciones",
  vistaAplicacionSancionInterface: "sanciones",
  solicitudSancionInterface: "solicitudSancion",
  vistaDetalleSolicitudSancionInterface: "solicitudSancion",
  solicitudCopaInterface: "solicitudCopa",
  detalleSolicitudCopaInterface: "solicitudCopa",
  checkoutBandaInterface: "checkout",
  CheckoutDetalleInterface: "checkout",
  // auditoria
  AuditoriaAccion: "auditoria",
  AuditoriaMetadata: "auditoria",
  AuditoriaRow: "auditoria",
  MetadataCampoVisible: "auditoria",
  AuditoriaDetalleEnriquecido: "auditoria",
  AuditoriaFiltros: "auditoria",
  AuditoriaPaginaResultado: "auditoria",
  EventoEnCursoVista: "auditoria",
  BandaEnCanchaVista: "auditoria",
  ParticipacionEstado: "auditoria",
  ParticipacionBandaVista: "auditoria",
  HistorialParticipacionEvento: "auditoria",
  AccesoCategoriaVista: "auditoria",
  DesbloqueoCategoriaCard: "auditoria",
  PerfilUsuarioFiltro: "auditoria",
};

function relFor(name) {
  const domain = DOMAIN[name];
  if (!domain) throw new Error(`No domain mapping for ${name}`);
  return `${domain}/${name}`;
}

function wipeModelsKeepNothing() {
  if (!fs.existsSync(MODELS)) return;
  for (const e of fs.readdirSync(MODELS)) {
    fs.rmSync(path.join(MODELS, e), { recursive: true, force: true });
  }
}

function main() {
  const interfacesSrc = gitShow("src/interfaces/interfaces.ts");
  const auditoriaSrc = gitShow("src/interfaces/interfaceAuditoria.ts");

  const allExports = [
    ...parseExports(interfacesSrc),
    ...parseExports(auditoriaSrc),
  ];
  const known = allExports.map((e) => e.name);

  // Validate mapping
  for (const exp of allExports) {
    if (!DOMAIN[exp.name]) {
      console.error("MISSING DOMAIN for", exp.name);
    }
  }

  wipeModelsKeepNothing();

  const pathFor = new Map();
  for (const exp of allExports) {
    pathFor.set(exp.name, relFor(exp.name));
  }

  for (const exp of allExports) {
    const rel = pathFor.get(exp.name);
    const refs = collectRefs(exp.body, exp.name, known);
    const imports = refs.map((ref) => {
      const ip = importPath(rel, pathFor.get(ref));
      return `import type { ${ref} } from "${ip}";`;
    });
    const content =
      (imports.length ? imports.join("\n") + "\n\n" : "") + exp.body;
    writeFile(path.join(MODELS, rel + ".ts"), content);
    console.log("wrote", rel + ".ts");
  }

  const indexLines = [...pathFor.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, rel]) => `export type { ${name} } from "./${rel}";`);
  writeFile(path.join(MODELS, "index.ts"), indexLines.join("\n") + "\n");

  console.log("\nTotal exports:", allExports.length);
  console.log("Missing check confirmacionAsistenciaInterface:", known.includes("confirmacionAsistenciaInterface"));
  console.log("Missing check userInterface:", known.includes("userInterface"));
}

main();
