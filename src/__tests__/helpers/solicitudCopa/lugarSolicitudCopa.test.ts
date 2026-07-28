import { describe, expect, it } from "vitest";
import {
  OPCIONES_LUGAR_SOLICITUD_COPA,
  etiquetaLugarSolicitudCopa,
  etiquetaTipoSolicitudCopa,
} from "@/helpers/solicitudCopa/lugarSolicitudCopa";

describe("lugarSolicitudCopa", () => {
  it("labels lugares 1-10", () => {
    expect(etiquetaLugarSolicitudCopa(1)).toBe("Primer lugar");
    expect(etiquetaLugarSolicitudCopa(10)).toBe("Décimo lugar");
    expect(etiquetaLugarSolicitudCopa(0)).toBe("—");
    expect(etiquetaLugarSolicitudCopa(null)).toBe("—");
  });

  it("exposes 10 options", () => {
    expect(OPCIONES_LUGAR_SOLICITUD_COPA).toHaveLength(10);
  });

  it("labels tipo solicitud", () => {
    expect(etiquetaTipoSolicitudCopa("directo")).toBe("Directo");
    expect(etiquetaTipoSolicitudCopa("desempate")).toBe("Desempate");
    expect(etiquetaTipoSolicitudCopa("otro")).toBe("otro");
    expect(etiquetaTipoSolicitudCopa("")).toBe("—");
    expect(etiquetaTipoSolicitudCopa(null)).toBe("—");
  });
});
