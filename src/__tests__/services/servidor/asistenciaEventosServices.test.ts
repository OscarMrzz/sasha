import { useSupabaseMock } from "../../mocks/setupClientMocks";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}));

import { getVistaAsistenciaEventos } from "@/services/servidor/asistenciaEventosServices";

const supabaseMock = useSupabaseMock();

describe("asistenciaEventosServices", () => {
  it("getVistaAsistenciaEventos lee vista_asistencia_eventos", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_banda: "banda-1",
          nombre_banda: "Banda Alpha",
          id_evento: "evt-1",
          lugar_evento: "Plaza",
        },
      ],
      error: null,
    });

    const rows = await getVistaAsistenciaEventos();

    expect(supabaseMock.client.from).toHaveBeenCalledWith("vista_asistencia_eventos");
    expect(rows).toHaveLength(1);
    expect(rows[0].nombreBanda).toBe("Banda Alpha");
  });

  it("getVistaAsistenciaEventos propaga error de Supabase", async () => {
    supabaseMock.setResult({ data: null, error: { message: "view missing" } });
    await expect(getVistaAsistenciaEventos()).rejects.toEqual({ message: "view missing" });
  });
});
