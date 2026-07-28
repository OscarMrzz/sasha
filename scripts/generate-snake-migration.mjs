/**
 * Generates SQL migration to rename camelCase tables/columns to snake_case.
 * Does NOT recreate view bodies (drops them); a second script recreates views.
 */
import fs from "fs";
import path from "path";

const DUMP = "C:/tmp/schema_dump.sql";
const OUT = path.join("supabase", "migrations", "20260728000000_snake_case_rename.sql");

function camelToSnake(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

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

const colFixes = {
  // keep intentional typo datalle → datalle_rubrica via camelToSnake
  idForaneaSolicitudRevicion: "id_foranea_solicitud_revision",
  idForaneaSolicitanteRevicion: "id_foranea_solicitante_revision",
};

const src = fs.readFileSync(DUMP, "utf8");

const views = [...new Set([...src.matchAll(/CREATE(?: OR REPLACE)? VIEW (?:IF NOT EXISTS )?(?:public\.|"public"\.)"?([A-Za-z0-9_]+)"?/gi)].map((m) => m[1]))];

const colMap = {};
const blockRe =
  /CREATE TABLE (?:IF NOT EXISTS )?(?:public\.|"public"\.)"?([A-Za-z0-9_]+)"?\s*\(([\s\S]*?)\n\);/g;
let m;
while ((m = blockRe.exec(src))) {
  const t = m[1];
  const cols = [];
  for (const line of m[2].split("\n")) {
    const cm = line.match(/^\s*"?([A-Za-z_][A-Za-z0-9_]*)"?\s+/);
    if (!cm) continue;
    const c = cm[1];
    if (["CONSTRAINT", "PRIMARY", "UNIQUE", "CHECK", "FOREIGN", "REFERENCES"].includes(c.toUpperCase())) continue;
    cols.push(c);
  }
  colMap[t] = cols;
}

const lines = [];
lines.push("-- Migración: camelCase → snake_case (tablas y columnas)");
lines.push("-- Generada automáticamente. Vistas se dropean y se recrean en migración siguiente.");
lines.push("BEGIN;");
lines.push("");
lines.push("-- 1) Drop views");
for (const v of views.sort()) {
  lines.push(`DROP VIEW IF EXISTS public."${v}" CASCADE;`);
}
lines.push("");

lines.push("-- 2) Rename columns (antes de renombrar tablas)");
for (const [table, cols] of Object.entries(colMap).sort()) {
  const renames = cols.filter((c) => /[A-Z]/.test(c) || colFixes[c]);
  if (!renames.length) continue;
  lines.push(`-- ${table}`);
  for (const c of renames) {
    const neu = colFixes[c] || camelToSnake(c);
    if (c === neu) continue;
    lines.push(`ALTER TABLE public."${table}" RENAME COLUMN "${c}" TO ${neu};`);
  }
  lines.push("");
}

lines.push("-- 3) Rename tables camelCase → snake_case");
for (const table of Object.keys(colMap).sort()) {
  const neu = tableFixes[table] || (/[A-Z]/.test(table) ? camelToSnake(table) : null);
  if (!neu || neu === table) continue;
  lines.push(`ALTER TABLE public."${table}" RENAME TO ${neu};`);
}
lines.push("");

lines.push("COMMIT;");

fs.writeFileSync(OUT, lines.join("\n") + "\n", "utf8");
console.log("Wrote", OUT);
console.log("Views dropped:", views.length);
console.log("Tables with col renames:", Object.values(colMap).filter((c) => c.some((x) => /[A-Z]/.test(x))).length);
