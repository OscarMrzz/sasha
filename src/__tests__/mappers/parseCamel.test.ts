import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseCamel } from "@/services/mappers/parseCamel";

describe("parseCamel", () => {
  const schema = z.object({
    nombre: z.string().min(1),
    edad: z.number().optional(),
  });

  it("returns parsed data on success", () => {
    expect(parseCamel(schema, { nombre: "Ana", edad: 20 })).toEqual({
      nombre: "Ana",
      edad: 20,
    });
  });

  it("throws with Zod issue messages on failure", () => {
    expect(() => parseCamel(schema, { nombre: "" })).toThrow(/Validación Zod fallida/);
  });
});
