import { describe, expect, it } from "vitest";
import { useSupabaseMock } from "../mocks/setupClientMocks";
import { assignPerfil, perfilFixture } from "../mocks/perfilFixture";
import CategoriasServices from "@/services/categoriaServices";

const categoriaRow = {
  id_categoria: "cat-1",
  created_at: "2024-01-01T00:00:00Z",
  nombre_categoria: "Junior",
  detalles_categoria: "Categoría junior",
  id_foranea_federacion: "fed-1",
};

describe("CategoriasServices", () => {
  const mock = useSupabaseMock();

  it("get throws without perfil federación", async () => {
    const service = new CategoriasServices();
    await expect(service.get()).rejects.toThrow("No hay federación en el perfil del usuario.");
  });

  it("get returns mapped data with perfil", async () => {
    mock.setResult({ data: [categoriaRow], error: null });
    const service = assignPerfil(new CategoriasServices());
    const result = await service.get();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      idCategoria: "cat-1",
      nombreCategoria: "Junior",
      idForaneaFederacion: "fed-1",
    });
  });

  it("create returns mapped row", async () => {
    mock.setResult({ data: categoriaRow, error: null });
    const service = assignPerfil(new CategoriasServices());
    const result = await service.create({
      nombreCategoria: "Junior",
      detallesCategoria: "Categoría junior",
      idForaneaFederacion: perfilFixture.idForaneaFederacion!,
    } as Parameters<CategoriasServices["create"]>[0]);
    expect(result.idCategoria).toBe("cat-1");
  });

  it("update returns mapped row", async () => {
    mock.setResult({ data: { ...categoriaRow, nombre_categoria: "Senior" }, error: null });
    const service = assignPerfil(new CategoriasServices());
    const result = await service.update("cat-1", {
      idCategoria: "cat-1",
      nombreCategoria: "Senior",
      detallesCategoria: "Actualizado",
      idForaneaFederacion: perfilFixture.idForaneaFederacion!,
      created_at: "2024-01-01T00:00:00Z",
    });
    expect(result.nombreCategoria).toBe("Senior");
  });

  it("delete returns true on success", async () => {
    mock.setResult({ data: null, error: null });
    const service = assignPerfil(new CategoriasServices());
    await expect(service.delete("cat-1")).resolves.toBe(true);
  });

  it("get propagates supabase error", async () => {
    const dbError = { message: "db fail", code: "500" };
    mock.setResult({ data: null, error: dbError });
    const service = assignPerfil(new CategoriasServices());
    await expect(service.get()).rejects.toEqual(dbError);
  });
});
