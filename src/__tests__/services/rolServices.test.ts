import { describe, expect, it } from "vitest";
import { useSupabaseMock } from "../mocks/setupClientMocks";
import { assignPerfil, perfilFixture } from "../mocks/perfilFixture";
import RolesServices from "@/services/rolServices";

const rolRow = {
  id_rol: "rol-2",
  created_at: "2024-01-01T00:00:00Z",
  nombre_rol: "evaluador",
  estado_rol: true,
  id_foranea_federacion: "fed-1",
};

describe("RolesServices", () => {
  const mock = useSupabaseMock();

  it("get throws without perfil federación", async () => {
    const service = new RolesServices();
    await expect(service.get()).rejects.toThrow("No hay federación en el perfil del usuario.");
  });

  it("get returns mapped roles with perfil", async () => {
    mock.setResult({ data: [rolRow], error: null });
    const service = assignPerfil(new RolesServices());
    const result = await service.get();
    expect(result[0]).toMatchObject({
      idRol: "rol-2",
      nombreRol: "evaluador",
      estadoRol: true,
    });
  });

  it("getOne returns mapped role", async () => {
    mock.setResult({ data: rolRow, error: null });
    const service = assignPerfil(new RolesServices());
    const result = await service.getOne("rol-2");
    expect(result.nombreRol).toBe("evaluador");
  });

  it("create returns mapped row", async () => {
    mock.setResult({ data: rolRow, error: null });
    const service = assignPerfil(new RolesServices());
    const result = await service.create({
      nombreRol: "evaluador",
      estadoRol: true,
      idForaneaFederacion: perfilFixture.idForaneaFederacion!,
    } as Parameters<RolesServices["create"]>[0]);
    expect(result.idRol).toBe("rol-2");
  });

  it("get propagates supabase error", async () => {
    const dbError = { message: "db fail" };
    mock.setResult({ data: null, error: dbError });
    const service = assignPerfil(new RolesServices());
    await expect(service.get()).rejects.toEqual(dbError);
  });
});
