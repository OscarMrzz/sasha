import { useSupabaseMock } from "../mocks/setupClientMocks";
import { describe, expect, it } from "vitest";
import RubricasPaquetesServices from "@/services/rubricasPaquetesServices";

useSupabaseMock();

describe("RubricasPaquetesServices", () => {
  const svc = new RubricasPaquetesServices();

  it("esArchivoJennieValido acepta .jennie y .jennie.json", () => {
    expect(svc.esArchivoJennieValido("paquete.jennie")).toBe(true);
    expect(svc.esArchivoJennieValido("paquete.jennie.json")).toBe(true);
    expect(svc.esArchivoJennieValido("paquete.json")).toBe(false);
  });

  it("validarPaquete acepta un paquete schemaVersion 1 mínimo", () => {
    const paquete = svc.validarPaquete({
      schemaVersion: 1,
      rubrica: {
        nombre_rubrica: "Rúbrica demo",
        version_rubrica: "1.0",
        id_foranea_categoria: "cat-1",
      },
      criterios: [],
    });

    expect(paquete.schemaVersion).toBe(1);
    expect(paquete.rubrica.nombre_rubrica).toBe("Rúbrica demo");
  });

  it("validarPaquete rechaza schemaVersion no soportada", () => {
    expect(() =>
      svc.validarPaquete({
        schemaVersion: 99,
        rubrica: {},
        criterios: [],
      }),
    ).toThrow(/Versión de esquema no soportada/);
  });

  it("resolverCategoriaPaquete encuentra categoría por nombre", () => {
    const result = svc.resolverCategoriaPaquete("Juvenil", [
      { idCategoria: "cat-j", nombreCategoria: "Juvenil" } as never,
    ]);

    expect(result.idCategoria).toBe("cat-j");
    expect(result.advertencia).toBeUndefined();
  });
});
