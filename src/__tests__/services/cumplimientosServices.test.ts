import { describe, expect, it } from "vitest";
import { useSupabaseMock } from "../mocks/setupClientMocks";
import { assignPerfil } from "../mocks/perfilFixture";
import cumplimientossServices from "@/services/cumplimientosServices";

const cumplimientoRow = {
  id_cumplimiento: "cum-1",
  created_at: "2024-01-01T00:00:00Z",
  detalle_cumplimiento: "Cumple parcialmente",
  puntos_cumplimiento: 5,
  id_foranea_criterio: "crit-1",
};

describe("cumplimientossServices", () => {
  const mock = useSupabaseMock();

  it("get throws without perfil federación", async () => {
    const service = new cumplimientossServices();
    await expect(service.get()).rejects.toThrow("No hay federación en el perfil del usuario.");
  });

  it("get returns mapped cumplimientos with perfil", async () => {
    mock.setResult({ data: [cumplimientoRow], error: null });
    const service = assignPerfil(new cumplimientossServices());
    const result = await service.get();
    expect(result[0]).toMatchObject({
      idCumplimiento: "cum-1",
      detalleCumplimiento: "Cumple parcialmente",
      puntosCumplimiento: 5,
    });
  });

  it("get propagates supabase error", async () => {
    const dbError = { message: "db fail" };
    mock.setResult({ data: null, error: dbError });
    const service = assignPerfil(new cumplimientossServices());
    await expect(service.get()).rejects.toEqual(dbError);
  });
});
