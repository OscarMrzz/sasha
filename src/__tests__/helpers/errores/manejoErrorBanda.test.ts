import { describe, expect, it } from "vitest";
import {
  ACCION_BANDA,
  BandaServicioError,
  clasificarErrorBanda,
  manejoErrorEdicionBanda,
  manejoErrorLogoBanda,
} from "@/helpers/errores/bandas/manejoErrorBanda";

describe("manejoErrorBanda", () => {
  it("classifies known error codes", () => {
    expect(clasificarErrorBanda(new TypeError("Failed to fetch"), ACCION_BANDA.EDICION)).toBe(
      "sin_internet"
    );
    expect(clasificarErrorBanda({ code: "PGRST000" }, ACCION_BANDA.EDICION)).toBe(
      "sin_conexion_servidor"
    );
    expect(clasificarErrorBanda({ code: "42501" }, ACCION_BANDA.EDICION)).toBe(
      "permiso_denegado"
    );
    expect(clasificarErrorBanda({ code: "PGRST116" }, ACCION_BANDA.EDICION)).toBe(
      "banda_no_encontrada"
    );
    expect(
      clasificarErrorBanda({ code: "InvalidMimeType" }, ACCION_BANDA.LOGO)
    ).toBe("archivo_invalido");
  });

  it("uses BandaServicioError codigo directly", () => {
    const err = new BandaServicioError(ACCION_BANDA.EDICION, "permiso_denegado");
    expect(clasificarErrorBanda(err, ACCION_BANDA.LOGO)).toBe("permiso_denegado");
    expect(manejoErrorEdicionBanda(err)).toBeTruthy();
    expect(manejoErrorLogoBanda({ message: "mime type" })).toBeTruthy();
  });
});
