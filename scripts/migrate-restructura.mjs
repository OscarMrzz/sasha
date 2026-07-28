/**
 * One-shot migration script for 01-restructura-carpetas.
 * Run: node scripts/migrate-restructura.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function writeFile(p, content) {
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, "utf8");
}

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function walkFiles(dir, exts = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".md"]) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(entry.name)) continue;
      out.push(...walkFiles(full, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function moveDir(from, to) {
  if (!fs.existsSync(from)) return;
  ensureDir(path.dirname(to));
  if (fs.existsSync(to)) {
    // merge: move children
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      const srcPath = path.join(from, entry.name);
      const destPath = path.join(to, entry.name);
      if (entry.isDirectory()) moveDir(srcPath, destPath);
      else {
        ensureDir(path.dirname(destPath));
        if (!fs.existsSync(destPath)) fs.renameSync(srcPath, destPath);
      }
    }
    // remove empty leftovers
    try {
      fs.rmSync(from, { recursive: true, force: true });
    } catch {}
  } else {
    fs.renameSync(from, to);
  }
}

function moveFile(from, to) {
  if (!fs.existsSync(from)) return;
  ensureDir(path.dirname(to));
  if (fs.existsSync(to)) return;
  fs.renameSync(from, to);
}

function replaceInFiles(replacements) {
  const files = [
    ...walkFiles(SRC),
    ...walkFiles(path.join(ROOT, "implementaciones")),
    path.join(ROOT, "components.json"),
    path.join(ROOT, "tsconfig.json"),
  ].filter((f) => fs.existsSync(f));

  let changed = 0;
  for (const file of files) {
    let text = read(file);
    let next = text;
    for (const [from, to] of replacements) {
      if (typeof from === "string") {
        if (next.includes(from)) next = next.split(from).join(to);
      } else {
        next = next.replace(from, to);
      }
    }
    if (next !== text) {
      fs.writeFileSync(file, next, "utf8");
      changed++;
    }
  }
  return changed;
}

// ---------- MODELS ----------
const modelsDir = path.join(SRC, "models");

// Domain grouping: exportName -> { domain, deps: import paths needed for types referenced }
// We'll keep domain files that contain related interfaces, one file per export as content slices.

const interfacesPath = path.join(SRC, "interfaces", "interfaces.ts");
const auditoriaPath = path.join(SRC, "interfaces", "interfaceAuditoria.ts");
const interfacesSrc = read(interfacesPath);
const auditoriaSrc = read(auditoriaPath);

/**
 * Split interfaces into domain modules.
 * Strategy: one file per DOMAIN containing all exports for that domain (repository folders),
 * with filenames matching primary exports via index re-exports of individual files.
 * To avoid fragile AST parsing, we create domain barrel files with the exact original blocks.
 */

const domainBlocks = {
  federaciones: `
export interface federacionInterface{
    idFederacion: string;
    created_at: string;
    nombreFederacion: string;
}
`,
  categorias: `
import type { federacionInterface } from "../federaciones/federacionInterface";

export interface categoriaInterface{
    idCategoria: string;
    created_at: string;
    nombreCategoria: string;
    detallesCategoria: string;
    idForaneaFederacion: string;
}
export interface categoriaDatosAmpleosInterface extends categoriaInterface {
    federaciones: federacionInterface;
}
`,
  regiones: `
import type { federacionInterface } from "../federaciones/federacionInterface";

export interface regionesInterface{
    idRegion: string;
    created_at: string;
    nombreRegion: string;
    idForaneaFederacion: string;
}
export interface regionesDatosAmpleosInterface extends regionesInterface {
    federaciones: federacionInterface;
}
`,
  roles: `
export interface rolInterface {
    idRol: string;
    created_at: string;
    idForaneaFederacion: string;
    nombreRol: string;
    estadoRol: boolean;
}

export interface rolEquipoEvaluadorInterface{
    idRol: string;
    created_at: string;
    idForaneaFederacion: string;
    nombreRol: string;
    DetallesRol: string;
}
export interface rolEquipoEvaluadorDatosAmpleosInterface extends rolEquipoEvaluadorInterface {
    federaciones: import("../federaciones/federacionInterface").federacionInterface;
}
`,
  bandas: `
import type { federacionInterface } from "../federaciones/federacionInterface";
import type { categoriaInterface } from "../categorias/categoriaInterface";
import type { regionesInterface } from "../regiones/regionesInterface";

export interface bandaInterface{
    idBanda: string;
    created_at: string;
    nombreBanda: string;
    AliasBanda: string;
    idForaneaCategoria: string;
    idForaneaRegion: string;
    idForaneaFederacion: string;
    ciudadBanda: string;
    urlLogoBanda: string;
    fechaFundacionBanda: string | null;
    fechaInscripcionAFederacion: string | null;
    ubicacionSedeBanda: string;
}
export interface bandaDatosAmpleosInterface extends bandaInterface{
    federaciones: federacionInterface;
    categorias: categoriaInterface;
    regiones: regionesInterface;
}
`,
};

// Simpler robust approach: write the entire original interfaces.ts into models/_legacyContent
// and also create domain index files that re-export from a single models/allInterfaces.ts
// Then individual named files re-export specific symbols.

writeFile(
  path.join(modelsDir, "allInterfaces.ts"),
  interfacesSrc
);

// Create named re-export files per interface for repository style
const exportNames = [
  ...interfacesSrc.matchAll(/^export (?:interface|type) (\w+)/gm),
].map((m) => m[1]);

// Domain map by name prefix / known groups
function domainFor(name) {
  const n = name.toLowerCase();
  if (n.includes("auditoria") || n.startsWith("metadata") || n.includes("participacion") || n.includes("desbloqueo") || n.includes("acceso") || n === "eventoencursovista" || n === "bandaencanchavista" || n === "perfilusuariofiltro") return "auditoria";
  if (n.includes("banda")) return "bandas";
  if (n.includes("categoria")) return "categorias";
  if (n.includes("region")) return "regiones";
  if (n.includes("federacion")) return "federaciones";
  if (n.includes("rol") && !n.includes("rubrica")) return "roles";
  if (n.includes("criterio") || n.includes("jennie")) return "criterios";
  if (n.includes("cumplimiento")) return "cumplimientos";
  if (n.includes("penalizacion")) return "penalizaciones";
  if (n.includes("perfil") || n === "userinterface") return "perfiles";
  if (n.includes("evento") || n.includes("registroevento")) return "eventos";
  if (n.includes("equipoevaluador") || n.includes("registroevaluador")) return "equipoEvaluador";
  if (n.includes("comentario")) return "comentarios";
  if (n.includes("rubrica")) return "rubricas";
  if (n.includes("resultado") || n.includes("rankin") || n.includes("ranking") || n.includes("condensado") || n.includes("rendimiento") || n.includes("premio") || n.includes("escuadra")) return "resultados";
  if (n.includes("solicitud") && n.includes("copa")) return "solicitudCopa";
  if (n.includes("solicitud") && n.includes("sancion")) return "solicitudSancion";
  if (n.includes("revicion") || n.includes("respuesta")) return "solicitudes";
  if (n.includes("copa")) return "copas";
  if (n.includes("sancion")) return "sanciones";
  if (n.includes("asistencia") || n.includes("confirmacion") || n.includes("vistaasisten")) return "asistencia";
  if (n.includes("checkout")) return "checkout";
  return "misc";
}

const byDomain = {};
for (const name of exportNames) {
  const d = domainFor(name);
  (byDomain[d] ||= []).push(name);
}

for (const [domain, names] of Object.entries(byDomain)) {
  for (const name of names) {
    const filePath = path.join(modelsDir, domain, `${name}.ts`);
    writeFile(
      filePath,
      `export type { ${name} } from "../allInterfaces";\nexport { type ${name} as default } from "../allInterfaces";\n`.replace(
        `export { type ${name} as default } from "../allInterfaces";\n`,
        ""
      )
    );
    // cleaner: only named re-export
    writeFile(filePath, `export type { ${name} } from "../allInterfaces";\n`);
  }
  writeFile(
    path.join(modelsDir, domain, "index.ts"),
    names.map((n) => `export type { ${n} } from "./${n}";`).join("\n") + "\n"
  );
}

// Auditoria domain from separate file — copy content and re-export
writeFile(path.join(modelsDir, "auditoria", "interfaceAuditoria.ts"), auditoriaSrc);
const auditoriaExports = [
  ...auditoriaSrc.matchAll(/^export (?:interface|type) (\w+)/gm),
].map((m) => m[1]);
for (const name of auditoriaExports) {
  writeFile(
    path.join(modelsDir, "auditoria", `${name}.ts`),
    `export type { ${name} } from "./interfaceAuditoria";\n`
  );
}
writeFile(
  path.join(modelsDir, "auditoria", "index.ts"),
  [
    `export * from "./interfaceAuditoria";`,
    ...auditoriaExports.map((n) => `export type { ${n} } from "./${n}";`),
  ].join("\n") + "\n"
);

// Global index
const domainIndexes = Object.keys(byDomain)
  .concat(["auditoria"])
  .filter((v, i, a) => a.indexOf(v) === i);
writeFile(
  path.join(modelsDir, "index.ts"),
  [
    `export * from "./allInterfaces";`,
    `export * from "./auditoria/interfaceAuditoria";`,
  ].join("\n") + "\n"
);

// Temporary re-exports in interfaces/
writeFile(
  interfacesPath,
  `/** @deprecated Import from @/models */\nexport * from "@/models/allInterfaces";\n`
);
writeFile(
  auditoriaPath,
  `/** @deprecated Import from @/models/auditoria */\nexport * from "@/models/auditoria/interfaceAuditoria";\n`
);

console.log("Models created. Domains:", Object.keys(byDomain).join(", "));

// ---------- MOVE LIB LAYERS ----------
const moves = [
  ["lib/services", "services"],
  ["lib/actions", "actions"],
  ["lib/fechas", "helpers/fechas"],
  ["lib/busqueda", "helpers/busqueda"],
  ["lib/errores", "helpers/errores"],
  ["lib/helpers", "helpers"],
  ["lib/condensado", "helpers/condensado"],
  ["lib/copas", "helpers/copas"],
  ["lib/eventos", "helpers/eventos"],
  ["lib/solicitudCopa", "helpers/solicitudCopa"],
  ["lib/solicitudesRevicion", "helpers/solicitudesRevicion"],
  ["lib/usuarios", "helpers/usuarios"],
  ["lib/utils", "helpers/utils"],
  ["lib/mi-banda", "helpers/mi-banda"],
  ["lib/navegacion", "config/navegacion"],
  ["lib/atajos", "config/atajos"],
];

for (const [fromRel, toRel] of moves) {
  moveDir(path.join(SRC, fromRel), path.join(SRC, toRel));
}
moveFile(path.join(SRC, "lib/rutas.ts"), path.join(SRC, "config/rutas.ts"));

// ---------- UNIFY COMPONENTS ----------
moveDir(path.join(SRC, "component"), path.join(SRC, "components"));

// ---------- RENAME feature / store ----------
moveDir(path.join(SRC, "feacture"), path.join(SRC, "features"));
moveDir(path.join(SRC, "Store"), path.join(SRC, "store"));

console.log("Directories moved.");

// ---------- IMPORT REPLACEMENTS ----------
const replacements = [
  ["@/interfaces/interfaceAuditoria", "@/models/auditoria"],
  ["@/interfaces/interfaces", "@/models"],
  ["@/interfaces", "@/models"],
  ["@/lib/services/", "@/services/"],
  ['@/lib/services"', '@/services"'],
  ["@/lib/actions/", "@/actions/"],
  ["@/lib/fechas/", "@/helpers/fechas/"],
  ["@/lib/busqueda/", "@/helpers/busqueda/"],
  ["@/lib/errores/", "@/helpers/errores/"],
  ["@/lib/helpers/", "@/helpers/"],
  ["@/lib/condensado/", "@/helpers/condensado/"],
  ["@/lib/copas/", "@/helpers/copas/"],
  ["@/lib/eventos/", "@/helpers/eventos/"],
  ["@/lib/solicitudCopa/", "@/helpers/solicitudCopa/"],
  ["@/lib/solicitudesRevicion/", "@/helpers/solicitudesRevicion/"],
  ["@/lib/usuarios/", "@/helpers/usuarios/"],
  ["@/lib/utils/", "@/helpers/utils/"],
  ["@/lib/mi-banda/", "@/helpers/mi-banda/"],
  ["@/lib/navegacion/", "@/config/navegacion/"],
  ["@/lib/atajos/", "@/config/atajos/"],
  ["@/lib/rutas", "@/config/rutas"],
  ["@/component/", "@/components/"],
  ['@/component"', '@/components"'],
  ["@/feacture/", "@/features/"],
  ["@/Store/", "@/store/"],
  // relative leftovers that might still point wrongly are rare with @ alias
];

const n = replaceInFiles(replacements);
console.log(`Updated imports in ${n} files.`);

console.log("Done.");
