import { describe, expect, it } from "vitest";
import { useSupabaseMock } from "../mocks/setupClientMocks";
import { assignPerfil, perfilFixture } from "../mocks/perfilFixture";
import RegionService from "@/services/regionesServices";

const regionRow = {
  id_region: "reg-1",
  created_at: "2024-01-01T00:00:00Z",
  nombre_region: "Norte",
  id_foranea_federacion: "fed-1",
};

describe("RegionService", () => {
  const mock = useSupabaseMock();

  it("getOne throws without perfil", async () => {
    const service = new RegionService();
    await expect(service.getOne("reg-1")).rejects.toThrow("Perfil no inicializado");
  });

  it("get returns mapped data with perfil", async () => {
    mock.setResult({ data: [regionRow], error: null });
    const service = assignPerfil(new RegionService());
    const result = await service.get();
    expect(result[0]).toMatchObject({
      idRegion: "reg-1",
      nombreRegion: "Norte",
    });
  });

  it("create returns mapped row", async () => {
    mock.setResult({ data: regionRow, error: null });
    const service = assignPerfil(new RegionService());
    const result = await service.create({
      nombreRegion: "Norte",
      idForaneaFederacion: perfilFixture.idForaneaFederacion!,
    } as Parameters<RegionService["create"]>[0]);
    expect(result.idRegion).toBe("reg-1");
  });

  it("update returns mapped row", async () => {
    mock.setResult({ data: { ...regionRow, nombre_region: "Sur" }, error: null });
    const service = assignPerfil(new RegionService());
    const result = await service.update("reg-1", {
      idRegion: "reg-1",
      nombreRegion: "Sur",
      idForaneaFederacion: perfilFixture.idForaneaFederacion!,
      created_at: "2024-01-01T00:00:00Z",
    });
    expect(result.nombreRegion).toBe("Sur");
  });

  it("delete returns true on success", async () => {
    mock.setResult({ data: null, error: null });
    const service = assignPerfil(new RegionService());
    await expect(service.delete("reg-1")).resolves.toBe(true);
  });

  it("create throws without federación in perfil", async () => {
    const service = assignPerfil(new RegionService(), null);
    await expect(
      service.create({
        nombreRegion: "Norte",
        idForaneaFederacion: "fed-1",
      } as Parameters<RegionService["create"]>[0])
    ).rejects.toThrow("No hay federación en el perfil del usuario.");
  });

  it("get propagates supabase error", async () => {
    const dbError = { message: "db fail" };
    mock.setResult({ data: null, error: dbError });
    const service = assignPerfil(new RegionService());
    await expect(service.get()).rejects.toEqual(dbError);
  });
});
