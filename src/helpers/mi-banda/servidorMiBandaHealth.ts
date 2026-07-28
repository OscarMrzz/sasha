import { redirect } from "next/navigation";

/** Ruta estática (prioridad sobre `[id]`). */
export const RUTA_SERVICIO_MI_BANDA_NO_DISPONIBLE =
  "/mi-banda-page/servicio-no-disponible" as const;

const PARAM_DEBUG_ERROR = "d" as const;

/** Copia propiedades propias (incluso no enumerables) para depurar objetos que `JSON.stringify` ignora. */
function objetoLegible(o: object): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Reflect.ownKeys(o)) {
    if (typeof key === "symbol") continue;
    try {
      const desc = Object.getOwnPropertyDescriptor(o, key);
      if (desc && "value" in desc) {
        out[key] = desc.value;
      } else if (desc?.get) {
        out[key] = desc.get.call(o);
      }
    } catch {
      out[key] = "[no legible]";
    }
  }
  return out;
}

/** Serializa PostgREST / Error / valores arbitrarios para logs y query de depuración. */
export function serializarCausaErrorMiBanda(cause: unknown): string {
  if (cause instanceof Error) {
    return `${cause.name}: ${cause.message}${cause.stack ? `\n${cause.stack}` : ""}`;
  }
  if (cause && typeof cause === "object") {
    const o = cause as Record<string, unknown>;
    if ("message" in o || "code" in o || "details" in o || "hint" in o) {
      try {
        return JSON.stringify({
          message: o.message,
          details: o.details,
          hint: o.hint,
          code: o.code,
        });
      } catch {
        /* seguir */
      }
    }
    try {
      const json = JSON.stringify(cause);
      if (json !== "{}") return json;
      const profundo = JSON.stringify(objetoLegible(cause as object));
      if (profundo !== "{}") return profundo;
      return "(objeto sin datos serializables; revise el otro log [texto] o la terminal del servidor)";
    } catch {
      try {
        return JSON.stringify(objetoLegible(cause as object));
      } catch {
        return String(cause);
      }
    }
  }
  return String(cause ?? "(sin detalle)");
}

export function tieneCredencialesServidorSupabase(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return Boolean(url && key);
}

/**
 * Variables de entorno obligatorias para leer datos de banda en el servidor.
 */
export function redirectSiFaltanCredencialesServidorMiBanda(): void {
  if (!tieneCredencialesServidorSupabase()) {
    redirect(RUTA_SERVICIO_MI_BANDA_NO_DISPONIBLE);
  }
}

/**
 * Tras un fallo real de Supabase / red en consultas de mi-banda (no incluye “sin filas”).
 * Siempre registra en la consola del **servidor** (terminal `next dev` / logs de despliegue).
 * En desarrollo, añade `?d=…` para que la página de aviso pueda volcar el detalle en la consola del navegador.
 */
export function redirectPorErrorServidorMiBanda(cause?: unknown): never {
  const texto = serializarCausaErrorMiBanda(cause);
  console.error("[MiBanda] Fallo al cargar datos del servidor (objeto):", cause);
  console.error("[MiBanda] Fallo al cargar datos del servidor (texto):", texto);

  if (process.env.NODE_ENV === "development" && cause !== undefined) {
    const truncado =
      texto.length > 1200 ? `${texto.slice(0, 1200)}…` : texto;
    redirect(
      `${RUTA_SERVICIO_MI_BANDA_NO_DISPONIBLE}?${PARAM_DEBUG_ERROR}=${encodeURIComponent(truncado)}`
    );
  }

  redirect(RUTA_SERVICIO_MI_BANDA_NO_DISPONIBLE);
}
