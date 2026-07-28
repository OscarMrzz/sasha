import { describe, expect, it } from "vitest";
import { formatearFechaEvento } from "@/helpers/fechas/formatearFechaEvento";
import { formatearFechaHoraConfirmacion } from "@/helpers/fechas/formatearFechaHoraConfirmacion";

describe("formatearFechaEvento", () => {
  it("formats valid YYYY-MM-DD in Spanish locale", () => {
    const out = formatearFechaEvento("2024-03-15");
    expect(out).toMatch(/15/);
    expect(out).toMatch(/2024/);
  });

  it("returns original string when date parts are incomplete", () => {
    expect(formatearFechaEvento("invalid")).toBe("invalid");
  });
});

describe("formatearFechaHoraConfirmacion", () => {
  it("formats valid ISO", () => {
    const out = formatearFechaHoraConfirmacion("2024-03-15T14:30:00.000Z");
    expect(out).toMatch(/2024/);
  });

  it("returns raw iso when invalid", () => {
    expect(formatearFechaHoraConfirmacion("not-a-date")).toBe("not-a-date");
  });
});
