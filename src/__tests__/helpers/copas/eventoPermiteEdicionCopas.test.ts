import { describe, expect, it } from "vitest";
import {
  MENSAJE_COPAS_EVENTO_BLOQUEADO,
  eventoPermiteEdicionCopas,
} from "@/helpers/copas/eventoPermiteEdicionCopas";

describe("eventoPermiteEdicionCopas", () => {
  it("blocks finalizado and cancelado", () => {
    expect(eventoPermiteEdicionCopas("finalizado")).toBe(false);
    expect(eventoPermiteEdicionCopas("cancelado")).toBe(false);
  });

  it("allows other states including null/undefined", () => {
    expect(eventoPermiteEdicionCopas("en_curso")).toBe(true);
    expect(eventoPermiteEdicionCopas(null)).toBe(true);
    expect(eventoPermiteEdicionCopas(undefined)).toBe(true);
  });

  it("exposes lock message", () => {
    expect(MENSAJE_COPAS_EVENTO_BLOQUEADO).toMatch(/finalizado o cancelado/);
  });
});
