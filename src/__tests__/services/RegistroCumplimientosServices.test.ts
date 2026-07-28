import { useSupabaseMock } from "../mocks/setupClientMocks";
import { assignPerfil } from "../mocks/perfilFixture";
import { describe, expect, it } from "vitest";
import RegistroCumplimientoServices from "@/services/RegistroCumplimientosServices";

const supabaseMock = useSupabaseMock();

describe("RegistroCumplimientoServices", () => {
  it("get lanza sin perfil con federación", async () => {
    const svc = new RegistroCumplimientoServices();
    svc.perfil = null;
    await expect(svc.get()).rejects.toThrow("No hay federación en el perfil del usuario.");
  });

  it("get devuelve evaluaciones mapeadas a camelCase", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_registro_cumplimiento_evaluacion: "rc-1",
          id_foranea_federacion: "fed-1",
          puntos_obtenidos: 10,
        },
      ],
      error: null,
    });

    const svc = assignPerfil(new RegistroCumplimientoServices());
    const rows = await svc.get();

    expect(supabaseMock.client.from).toHaveBeenCalledWith("registro_cumplimiento_evaluaciones");
    expect(rows[0].idRegistroCumplimientoEvaluacion).toBe("rc-1");
    expect(rows[0].puntosObtenidos).toBe(10);
  });

  it("propaga error de Supabase", async () => {
    supabaseMock.setResult({ data: null, error: { message: "db fail" } });
    const svc = assignPerfil(new RegistroCumplimientoServices());
    await expect(svc.get()).rejects.toEqual({ message: "db fail" });
  });
});
