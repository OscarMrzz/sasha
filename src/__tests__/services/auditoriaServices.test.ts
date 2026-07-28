import { useSupabaseMock } from "../mocks/setupClientMocks";
import { describe, expect, it } from "vitest";
import { getEventosEnCurso } from "@/services/auditoriaServices";

const supabaseMock = useSupabaseMock();

describe("auditoriaServices", () => {
  it("getEventosEnCurso consulta eventos con estado iniciado", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_evento: "evt-1",
          lugar_evento: "Polideportivo",
          fecha_evento: "2026-07-28",
          estado_evento: "iniciado",
          tipo_evento: "competencia",
          regiones: { nombre_region: "Centro" },
        },
      ],
      error: null,
    });

    const eventos = await getEventosEnCurso();

    expect(supabaseMock.client.from).toHaveBeenCalledWith("registro_eventos");
    expect(eventos).toHaveLength(1);
    expect(eventos[0].idEvento).toBe("evt-1");
    expect(eventos[0].nombreRegion).toBe("Centro");
  });

  it("getEventosEnCurso devuelve arreglo vacío sin datos", async () => {
    supabaseMock.setResult({ data: [], error: null });
    const eventos = await getEventosEnCurso();
    expect(eventos).toEqual([]);
  });
});
