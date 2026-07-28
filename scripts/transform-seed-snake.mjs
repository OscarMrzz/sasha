import fs from "fs";

const RENAME_MIG = "supabase/migrations/20260728000000_snake_case_rename.sql";
const SEED = "supabase/seed.sql";

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

// common camelCase columns from analysis
const seed = fs.readFileSync(SEED, "utf8");
for (const m of seed.matchAll(/\b([A-Za-z][A-Za-z0-9]*[A-Z][A-Za-z0-9]*)\b/g)) {
  const w = m[1];
  // skip plpgsql-looking long vars that are not DB columns - still ok to snake if they're identifiers in SQL
  if (!idMap.has(w) && /[A-Z]/.test(w) && w.length < 40) {
    idMap.set(w, camelToSnake(w));
  }
}

const sorted = [...idMap.entries()].sort((a, b) => b[0].length - a[0].length);
let out = seed;
for (const [old, neu] of sorted) {
  out = out.split(`"${old}"`).join(neu);
  out = out.replace(new RegExp(`\\b${old}\\b`, "g"), neu);
}

fs.writeFileSync(SEED, out, "utf8");
console.log("Transformed seed.sql, replacements:", sorted.length);
