/**
 * Extract views from dump, transform identifiers to snake_case, write migration 000001.
 */
import fs from "fs";

const DUMP = "C:/tmp/schema_dump.sql";
const OUT = "supabase/migrations/20260728000001_recreate_views_snake.sql";
const RENAME_MIG = "supabase/migrations/20260728000000_snake_case_rename.sql";

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
  vista_solicitud_revicion: "vista_solicitud_revision",
};

const colFixes = {
  idForaneaSolicitudRevicion: "id_foranea_solicitud_revision",
  idForaneaSolicitanteRevicion: "id_foranea_solicitante_revision",
};

const idMap = new Map(Object.entries({ ...tableFixes, ...colFixes }));
const renameMig = fs.readFileSync(RENAME_MIG, "utf8");
for (const m of renameMig.matchAll(/RENAME COLUMN "([^"]+)" TO ([a-z0-9_]+);/g)) {
  idMap.set(m[1], m[2]);
}
for (const m of renameMig.matchAll(/ALTER TABLE public\."([^"]+)" RENAME TO ([a-z0-9_]+);/g)) {
  idMap.set(m[1], m[2]);
}

const src = fs.readFileSync(DUMP, "utf8");
for (const m of src.matchAll(/"([A-Za-z][A-Za-z0-9]*[A-Z][A-Za-z0-9]*)"/g)) {
  if (!idMap.has(m[1])) idMap.set(m[1], camelToSnake(m[1]));
}

const sorted = [...idMap.entries()].sort((a, b) => b[0].length - a[0].length);

function transformSql(sql) {
  let out = sql;
  for (const [old, neu] of sorted) {
    out = out.split(`"${old}"`).join(neu);
    out = out.replace(new RegExp(`\\b${old}\\b`, "g"), neu);
  }
  return out;
}

/** Extract only the CREATE VIEW ... AS <select>; stopping before ALTER/GRANT/CREATE */
function extractViews(sql) {
  const results = [];
  const re = /CREATE OR REPLACE VIEW "public"\."([^"]+)"(.*?) AS\n/g;
  let m;
  while ((m = re.exec(sql))) {
    const name = m[1];
    const withClause = m[2] || "";
    const startBody = m.index + m[0].length;
    const rest = sql.slice(startBody);
    const endMatch = rest.match(/;(\s*\n)(?=ALTER |CREATE |GRANT |COMMENT |REVOKE |$)/);
    if (!endMatch || endMatch.index === undefined) {
      console.warn("no end for", name);
      continue;
    }
    const selectBody = rest.slice(0, endMatch.index + 1);
    results.push({ name, withClause, selectBody });
  }
  return results;
}

const views = extractViews(src);
const byName = new Map();
for (const v of views) byName.set(v.name, v);

const lines = [];
lines.push("-- Recreate views after snake_case rename");
lines.push("BEGIN;");
lines.push("");

for (const [name, v] of [...byName.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const newName = tableFixes[name] || name;
  let header = `CREATE OR REPLACE VIEW public.${newName}`;
  const withT = transformSql(v.withClause).trim();
  if (withT) header += ` ${withT}`;
  header += " AS\n";
  const body = transformSql(v.selectBody);
  lines.push(header + body);
  lines.push("");
}

lines.push("COMMIT;");
fs.writeFileSync(OUT, lines.join("\n") + "\n", "utf8");
console.log("Wrote", OUT, "views:", byName.size);
