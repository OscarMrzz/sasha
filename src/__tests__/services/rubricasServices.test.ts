import { describe, expect, it } from "vitest";
import { useSupabaseMock } from "../mocks/setupClientMocks";
import { assignPerfil, perfilFixture } from "../mocks/perfilFixture";
import RubricasServices from "@/services/rubricasServices";

const rubricaRow = {
  id_rubrica: "rub-1",
  created_at: "2024-01-01T00:00:00Z",
  nombre_rubrica: "Rúbrica A",
  datalle_rubrica: "Detalle",
  puntos_rubrica: 100,
  id_foranea_categoria: "cat-1",
  id_foranea_federacion: "fed-1",
  version_rubrica: "1.0",
};

const rubricaPayload = {
  nombreRubrica: "Rúbrica A",
  datalleRubrica: "Detalle",
  puntosRubrica: 100,
  idForaneaCategoria: "cat-1",
  idForaneaFederacion: perfilFixture.idForaneaFederacion!,
  versionRubrica: "1.0",
};

describe("RubricasServices", () => {
  const mock = useSupabaseMock();

  it("get returns mapped rubricas with perfil", async () => {
    mock.setResult({ data: [rubricaRow], error: null });
    const service = assignPerfil(new RubricasServices());
    const result = await service.get();
    expect(result[0]).toMatchObject({
      idRubrica: "rub-1",
      nombreRubrica: "Rúbrica A",
      versionRubrica: "1.0",
    });
  });

  it("create validates duplicates then inserts", async () => {
    mock.enqueueResults(
      { data: [], error: null },
      { data: rubricaRow, error: null }
    );
    const service = assignPerfil(new RubricasServices());
    const result = await service.create(rubricaPayload as Parameters<RubricasServices["create"]>[0]);
    expect(result.idRubrica).toBe("rub-1");
  });

  it("get propagates supabase error", async () => {
    const dbError = { message: "db fail" };
    mock.setResult({ data: null, error: dbError });
    const service = assignPerfil(new RubricasServices());
    await expect(service.get()).rejects.toEqual(dbError);
  });
});
