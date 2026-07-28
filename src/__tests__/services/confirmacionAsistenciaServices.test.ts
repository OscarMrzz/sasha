import { useSupabaseMock } from "../mocks/setupClientMocks";
import { describe, expect, it } from "vitest";
import ConfirmacionAsistenciaServices from "@/services/confirmacionAsistenciaServices";

const supabaseMock = useSupabaseMock();

describe("ConfirmacionAsistenciaServices", () => {
  it("getConfirmacionesPorEvento exige id_evento", async () => {
    const svc = new ConfirmacionAsistenciaServices();
    await expect(svc.getConfirmacionesPorEvento("")).rejects.toThrow("id_evento es obligatorio.");
  });

  it("getConfirmacionesPorEvento devuelve confirmaciones con asistencia true", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_confirmacion_asistencia: "ca-1",
          id_foranea_evento: "evt-1",
          id_foranea_banda: "banda-1",
          estado_asistencia: true,
        },
      ],
      error: null,
    });

    const svc = new ConfirmacionAsistenciaServices();
    const rows = await svc.getConfirmacionesPorEvento("evt-1");

    expect(supabaseMock.client.from).toHaveBeenCalledWith("confirmacion_asistencia");
    expect(rows).toHaveLength(1);
    expect(rows[0].estado_asistencia).toBe(true);
  });

  it("getConfirmacion devuelve null cuando no hay fila", async () => {
    supabaseMock.setResult({ data: null, error: null });

    const svc = new ConfirmacionAsistenciaServices();
    const row = await svc.getConfirmacion("banda-1", "evt-1");

    expect(row).toBeNull();
  });
});
