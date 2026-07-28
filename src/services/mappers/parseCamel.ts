import type { ZodType } from "zod";

/** Validate camelCase payload before mapping to DB. */
export function parseCamel<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Validación Zod fallida: ${msg}`);
  }
  return result.data;
}
