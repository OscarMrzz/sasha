import { describe, expect, it } from "vitest";
import { useSupabaseMock } from "../mocks/setupClientMocks";
import { assignPerfil } from "../mocks/perfilFixture";
import CriteriosServices from "@/services/criteriosServices";

const criterioRow = {
  id_criterio: "crit-1",
  created_at: "2024-01-01T00:00:00Z",
  nombre_criterio: "Criterio A",
  detalles_criterio: "Detalle",
  puntos_criterio: 10,
  id_foranea_rubrica: "rub-1",
  rubricas: {
    id_rubrica: "rub-1",
    id_foranea_federacion: "fed-1",
  },
};

describe("CriteriosServices", () => {
  const mock = useSupabaseMock();

  it("get throws without perfil federación", async () => {
    const service = new CriteriosServices();
    await expect(service.get()).rejects.toThrow("No hay federación en el perfil del usuario.");
  });

  it("get returns criterios without rubricas join", async () => {
    mock.setResult({ data: [criterioRow], error: null });
    const service = assignPerfil(new CriteriosServices());
    const result = await service.get();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      idCriterio: "crit-1",
      nombreCriterio: "Criterio A",
    });
    expect(result[0]).not.toHaveProperty("rubricas");
  });

  it("getOne returns mapped criterio", async () => {
    mock.setResult({
      data: {
        id_criterio: "crit-1",
        created_at: "2024-01-01T00:00:00Z",
        nombre_criterio: "Criterio A",
        detalles_criterio: "Detalle",
        puntos_criterio: 10,
        id_foranea_rubrica: "rub-1",
      },
      error: null,
    });
    const service = assignPerfil(new CriteriosServices());
    const result = await service.getOne("crit-1");
    expect(result.nombreCriterio).toBe("Criterio A");
  });

  it("get propagates supabase error", async () => {
    const dbError = { message: "db fail" };
    mock.setResult({ data: null, error: dbError });
    const service = assignPerfil(new CriteriosServices());
    await expect(service.get()).rejects.toEqual(dbError);
  });
});
