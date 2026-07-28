import { describe, expect, it } from "vitest";
import {
  getEstadoSolicitudKey,
  getEstadoSolicitudPill,
} from "@/components/solicitudSancion/estadoSolicitudPill";

describe("estadoSolicitudPill", () => {
  it("maps boolean/null/undefined to keys", () => {
    expect(getEstadoSolicitudKey(true)).toBe("true");
    expect(getEstadoSolicitudKey(false)).toBe("false");
    expect(getEstadoSolicitudKey(null)).toBe("null");
    expect(getEstadoSolicitudKey(undefined)).toBe("null");
  });

  it("returns pill text for each state", () => {
    expect(getEstadoSolicitudPill(true).txt).toBe("Aprobada");
    expect(getEstadoSolicitudPill(false).txt).toBe("Denegada");
    expect(getEstadoSolicitudPill(null).txt).toBe("Pendiente");
  });
});
