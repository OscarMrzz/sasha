import { describe, expect, it } from "vitest";
import {
  coincideBusqueda,
  normalizarTextoBusqueda,
} from "@/helpers/busqueda/normalizarTextoBusqueda";

describe("normalizarTextoBusqueda", () => {
  it("lowercases and strips accents", () => {
    expect(normalizarTextoBusqueda("José Pérez")).toBe("jose perez");
  });
});

describe("coincideBusqueda", () => {
  it("returns true for empty consulta", () => {
    expect(coincideBusqueda(null, "  ")).toBe(true);
    expect(coincideBusqueda("abc", "")).toBe(true);
  });

  it("returns false when texto is empty and consulta is not", () => {
    expect(coincideBusqueda(null, "a")).toBe(false);
    expect(coincideBusqueda(undefined, "a")).toBe(false);
  });

  it("matches ignoring accents and case", () => {
    expect(coincideBusqueda("José María", "jose")).toBe(true);
    expect(coincideBusqueda("Banda Norte", "sur")).toBe(false);
  });
});
