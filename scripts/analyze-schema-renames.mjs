import fs from "fs";

const src = fs.readFileSync("C:/tmp/schema_dump.sql", "utf8");

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

const tables = [];
const reTable = /CREATE TABLE (?:IF NOT EXISTS )?(?:public\.|"public"\.)"?([A-Za-z0-9_]+)"?/g;
let m;
while ((m = reTable.exec(src))) tables.push(m[1]);

const uniqueTables = [...new Set(tables)].sort();
console.log("=== TABLES ===");
for (const t of uniqueTables) {
  const needs = /[A-Z]/.test(t);
  const neu = tableFixes[t] || (needs ? camelToSnake(t) : t);
  console.log(`${t} -> ${neu}`);
}

// columns per create table block
const colMap = {};
const blockRe =
  /CREATE TABLE (?:IF NOT EXISTS )?(?:public\.|"public"\.)"?([A-Za-z0-9_]+)"?\s*\(([\s\S]*?)\n\);/g;
while ((m = blockRe.exec(src))) {
  const t = m[1];
  const body = m[2];
  const cols = [];
  for (const line of body.split("\n")) {
    const cm = line.match(/^\s*"?([A-Za-z_][A-Za-z0-9_]*)"?\s+/);
    if (!cm) continue;
    const c = cm[1];
    if (
      [
        "CONSTRAINT",
        "PRIMARY",
        "UNIQUE",
        "CHECK",
        "FOREIGN",
        "REFERENCES",
      ].includes(c.toUpperCase())
    )
      continue;
    cols.push(c);
  }
  colMap[t] = cols;
}

console.log("\n=== COLUMNS NEEDING RENAME ===");
for (const [t, cols] of Object.entries(colMap).sort()) {
  const renames = cols.filter((c) => /[A-Z]/.test(c));
  if (!renames.length) continue;
  console.log(`\n# ${t}`);
  for (const c of renames) {
    console.log(`  ${c} -> ${camelToSnake(c)}`);
  }
}

const views = [];
const viewRe =
  /CREATE(?: OR REPLACE)?(?: TEMP)? VIEW (?:IF NOT EXISTS )?(?:public\.|"public"\.)"?([A-Za-z0-9_]+)"?/gi;
while ((m = viewRe.exec(src))) views.push(m[1]);
console.log("\n=== VIEWS ===");
[...new Set(views)].sort().forEach((v) => console.log(v));
