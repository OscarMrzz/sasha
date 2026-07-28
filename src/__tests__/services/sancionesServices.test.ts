import { describe, expect, it } from "vitest";
import { useSupabaseMock } from "../mocks/setupClientMocks";
import {
  createSancion,
  deleteSancion,
  getSancionById,
  getSanciones,
  updateSancion,
} from "@/services/sancionesServices";

const sancionRow = {
  id_sancion: "sanc-1",
  created_at: "2024-01-01T00:00:00Z",
  detalles_sancion: "Falta grave",
  puntos_sancion: 10,
};

describe("sancionesServices", () => {
  const mock = useSupabaseMock();

  it("getSanciones returns rows", async () => {
    mock.setResult({ data: [sancionRow], error: null });
    const result = await getSanciones();
    expect(result).toHaveLength(1);
    expect(result[0].id_sancion).toBe("sanc-1");
  });

  it("getSancionById returns single row", async () => {
    mock.setResult({ data: sancionRow, error: null });
    const result = await getSancionById("sanc-1");
    expect(result.detalles_sancion).toBe("Falta grave");
  });

  it("createSancion inserts and returns row", async () => {
    mock.setResult({ data: sancionRow, error: null });
    const result = await createSancion({
      detalles_sancion: "Falta grave",
      puntos_sancion: 10,
    });
    expect(result.id_sancion).toBe("sanc-1");
  });

  it("updateSancion updates and returns row", async () => {
    mock.setResult({ data: { ...sancionRow, puntos_sancion: 15 }, error: null });
    const result = await updateSancion("sanc-1", { puntos_sancion: 15 });
    expect(result.puntos_sancion).toBe(15);
  });

  it("deleteSancion returns true on success", async () => {
    mock.setResult({ data: null, error: null });
    await expect(deleteSancion("sanc-1")).resolves.toBe(true);
  });

  it("getSanciones propagates supabase error", async () => {
    const dbError = { message: "db fail" };
    mock.setResult({ data: null, error: dbError });
    await expect(getSanciones()).rejects.toEqual(dbError);
  });
});
