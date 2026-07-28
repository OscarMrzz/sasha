import { describe, expect, it } from "vitest";
import { useSupabaseMock } from "../mocks/setupClientMocks";
import { assignPerfil, perfilFixture } from "../mocks/perfilFixture";
import BandasServices from "@/services/bandasServices";

const bandaRow = {
  id_banda: "banda-1",
  created_at: "2024-01-01T00:00:00Z",
  nombre_banda: "Banda Test",
  alias_banda: "BT",
  id_foranea_categoria: "cat-1",
  id_foranea_region: "reg-1",
  id_foranea_federacion: "fed-1",
  ciudad_banda: "Ciudad",
  url_logo_banda: "",
  fecha_fundacion_banda: null,
  fecha_inscripcion_a_federacion: null,
  ubicacion_sede_banda: "Sede",
};

const bandaPayload = {
  nombreBanda: "Banda Test",
  AliasBanda: "BT",
  idForaneaCategoria: "cat-1",
  idForaneaRegion: "reg-1",
  idForaneaFederacion: perfilFixture.idForaneaFederacion!,
  ciudadBanda: "Ciudad",
  urlLogoBanda: "",
  fechaFundacionBanda: null,
  fechaInscripcionAFederacion: null,
  ubicacionSedeBanda: "Sede",
};

describe("BandasServices", () => {
  const mock = useSupabaseMock();

  it("get throws without perfil federación", async () => {
    const service = new BandasServices();
    await expect(service.get()).rejects.toThrow("No hay federación en el perfil del usuario.");
  });

  it("get returns mapped bandas with perfil", async () => {
    mock.setResult({ data: [bandaRow], error: null });
    const service = assignPerfil(new BandasServices());
    const result = await service.get();
    expect(result[0]).toMatchObject({
      idBanda: "banda-1",
      nombreBanda: "Banda Test",
      AliasBanda: "BT",
    });
  });

  it("create returns mapped row", async () => {
    mock.setResult({ data: bandaRow, error: null });
    const service = assignPerfil(new BandasServices());
    const result = await service.create(bandaPayload as Parameters<BandasServices["create"]>[0]);
    expect(result.idBanda).toBe("banda-1");
  });

  it("update returns mapped row", async () => {
    mock.setResult({ data: { ...bandaRow, nombre_banda: "Actualizada" }, error: null });
    const service = assignPerfil(new BandasServices());
    const result = await service.update("banda-1", {
      ...bandaPayload,
      idBanda: "banda-1",
      created_at: "2024-01-01T00:00:00Z",
      nombreBanda: "Actualizada",
    } as Parameters<BandasServices["update"]>[1]);
    expect(result.nombreBanda).toBe("Actualizada");
  });

  it("delete returns true on success", async () => {
    mock.setResult({ data: null, error: null });
    const service = assignPerfil(new BandasServices());
    await expect(service.delete("banda-1")).resolves.toBe(true);
  });

  it("get propagates supabase error", async () => {
    const dbError = { message: "db fail" };
    mock.setResult({ data: null, error: dbError });
    const service = assignPerfil(new BandasServices());
    await expect(service.get()).rejects.toEqual(dbError);
  });
});
