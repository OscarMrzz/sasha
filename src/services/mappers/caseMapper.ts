/**
 * Generic camelCase <-> snake_case mappers for Supabase rows.
 * Special cases preserve historical TS casing (AliasBanda, LugarEvento, DetallesRol).
 */

const SNAKE_TO_CAMEL_EXCEPTIONS: Record<string, string> = {
  alias_banda: "AliasBanda",
  lugar_evento: "LugarEvento",
  detalles_rol: "DetallesRol",
  // Campos de registro_eventos que el modelo TS mantiene en snake_case
  estado_evento: "estado_evento",
  tipo_evento: "tipo_evento",
  dimensiones_cancha: "dimensiones_cancha",
  tipo_lugar: "tipo_lugar",
};

const CAMEL_TO_SNAKE_EXCEPTIONS: Record<string, string> = {
  AliasBanda: "alias_banda",
  LugarEvento: "lugar_evento",
  DetallesRol: "detalles_rol",
  estado_evento: "estado_evento",
  tipo_evento: "tipo_evento",
  dimensiones_cancha: "dimensiones_cancha",
  tipo_lugar: "tipo_lugar",
};

export function camelToSnakeKey(key: string): string {
  if (CAMEL_TO_SNAKE_EXCEPTIONS[key]) return CAMEL_TO_SNAKE_EXCEPTIONS[key];
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .toLowerCase();
}

export function snakeToCamelKey(key: string): string {
  if (SNAKE_TO_CAMEL_EXCEPTIONS[key]) return SNAKE_TO_CAMEL_EXCEPTIONS[key];
  return key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) && !(v instanceof Date);
}

/** App object (camelCase) → DB row (snake_case). Skips undefined. */
export function toDb<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    const nk = camelToSnakeKey(k);
    if (Array.isArray(v)) {
      out[nk] = v.map((item) => (isPlainObject(item) ? toDb(item) : item));
    } else if (isPlainObject(v)) {
      out[nk] = toDb(v);
    } else {
      out[nk] = v;
    }
  }
  return out;
}

/** DB row (snake_case) → app object (camelCase). */
export function fromDb<T = Record<string, unknown>>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    const nk = snakeToCamelKey(k);
    if (Array.isArray(v)) {
      out[nk] = v.map((item) => (isPlainObject(item) ? fromDb(item) : item));
    } else if (isPlainObject(v)) {
      out[nk] = fromDb(v);
    } else {
      out[nk] = v;
    }
  }
  return out as T;
}

export function fromDbMany<T = Record<string, unknown>>(rows: Record<string, unknown>[]): T[] {
  return rows.map((r) => fromDb<T>(r));
}
