import fs from "fs";

const SRC = "supabase/migrations/20260624120000_evaluacion_duplicados_alertas.sql";
const RENAME_MIG = "supabase/migrations/20260728000000_snake_case_rename.sql";
const OUT = "supabase/migrations/20260728000002_fix_alertas_functions_snake.sql";

function camelToSnake(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

const tableFixes = {
  criteriosEvalucion: "criterios_evaluacion",
  registroCumplimientoEvaluaciones: "registro_cumplimiento_evaluaciones",
  registroComentarios: "registro_comentarios",
  registroEventos: "registro_eventos",
};

const idMap = new Map(Object.entries(tableFixes));
const renameMig = fs.readFileSync(RENAME_MIG, "utf8");
for (const m of renameMig.matchAll(/RENAME COLUMN "([^"]+)" TO ([a-z0-9_]+);/g)) {
  idMap.set(m[1], m[2]);
}
for (const m of renameMig.matchAll(/ALTER TABLE public\."([^"]+)" RENAME TO ([a-z0-9_]+);/g)) {
  idMap.set(m[1], m[2]);
}

const extras = [
  "idRegistroCumplimientoEvaluacion",
  "idForaneaBanda",
  "idForaneaEvento",
  "idForaneaCriterio",
  "idForaneaRubrica",
  "nombreBanda",
  "nombreRubrica",
  "nombreCriterio",
  "puntosObtenidos",
  "idRegistroComentario",
  "LugarEvento",
  "idEvento",
  "idBanda",
  "idRubrica",
  "idCriterio",
  "idPermiso",
  "idForaneaRol",
  "idRol",
  "nombreRol",
  "anioEvento",
];
for (const e of extras) {
  if (!idMap.has(e)) idMap.set(e, camelToSnake(e));
}

const sorted = [...idMap.entries()].sort((a, b) => b[0].length - a[0].length);
let out = fs.readFileSync(SRC, "utf8");
for (const [old, neu] of sorted) {
  out = out.split(`"${old}"`).join(neu);
  out = out.replace(new RegExp(`\\b${old}\\b`, "g"), neu);
}

const header =
  "-- Fix alertas/evaluacion functions and related objects after snake_case rename\n\n";
fs.writeFileSync(OUT, header + out, "utf8");
console.log("wrote", OUT, "bytes", out.length);
