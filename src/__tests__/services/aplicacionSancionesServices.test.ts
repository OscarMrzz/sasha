import { describe, expect, it } from "vitest";
import { useSupabaseMock } from "../mocks/setupClientMocks";
import {
  createAplicacionSancion,
  deleteAplicacionSancion,
  getAllAplicacionSanciones,
  updateAplicacionSancion,
} from "@/services/aplicacionSancionesServices";

const vistaRow = {
  id_registro_sanciones: "reg-1",
  created_at: "2024-01-01T00:00:00Z",
  id_foranea_sancion: "sanc-1",
  id_banda: "banda-1",
  nombre_banda: "Banda Test",
  id_categoria: "cat-1",
  nombre_categoria: "Junior",
  id_region: "reg-1",
  nombre_region: "Norte",
  fecha_aplico_sancion: "2024-06-01",
};

const registroRow = {
  id_registro_sanciones: "reg-1",
  created_at: "2024-01-01T00:00:00Z",
  id_foranea_sancion: "sanc-1",
  id_foranea_banda: "banda-1",
  id_foranea_perfil: "perfil-1",
  fecha: "2024-06-01",
  justificacion: "Aplicada",
};

describe("aplicacionSancionesServices", () => {
  const mock = useSupabaseMock();

  it("getAllAplicacionSanciones maps vista rows", async () => {
    mock.setResult({ data: [vistaRow], error: null });
    const result = await getAllAplicacionSanciones();
    expect(result[0]).toMatchObject({
      idBanda: "banda-1",
      nombreBanda: "Banda Test",
      idCategoria: "cat-1",
      nombreRegion: "Norte",
    });
  });

  it("createAplicacionSancion inserts and returns row", async () => {
    mock.setResult({ data: registroRow, error: null });
    const result = await createAplicacionSancion({
      id_foranea_sancion: "sanc-1",
      id_foranea_banda: "banda-1",
      id_foranea_perfil: "perfil-1",
      fecha: "2024-06-01",
      justificacion: "Aplicada",
    });
    expect(result.id_registro_sanciones).toBe("reg-1");
  });

  it("updateAplicacionSancion updates and returns row", async () => {
    mock.setResult({ data: { ...registroRow, justificacion: "Actualizada" }, error: null });
    const result = await updateAplicacionSancion("reg-1", { justificacion: "Actualizada" });
    expect(result.justificacion).toBe("Actualizada");
  });

  it("deleteAplicacionSancion returns true on success", async () => {
    mock.setResult({ data: null, error: null });
    await expect(deleteAplicacionSancion("reg-1")).resolves.toBe(true);
  });

  it("getAllAplicacionSanciones propagates supabase error", async () => {
    const dbError = { message: "db fail" };
    mock.setResult({ data: null, error: dbError });
    await expect(getAllAplicacionSanciones()).rejects.toEqual(dbError);
  });
});
