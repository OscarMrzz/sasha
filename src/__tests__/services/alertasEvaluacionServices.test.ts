import { useSupabaseMock } from "../mocks/setupClientMocks";
import { describe, expect, it } from "vitest";
import AlertasEvaluacionServices from "@/services/alertasEvaluacionServices";

const supabaseMock = useSupabaseMock();

describe("AlertasEvaluacionServices", () => {
  it("obtenerAlertas invoca RPC obtener_alertas_evaluacion_duplicada", async () => {
    supabaseMock.setResult({
      data: [
        {
          tipo: "cumplimiento_duplicado",
          clave_alerta: "alert-1",
          id_foranea_banda: "banda-1",
          id_foranea_evento: "evt-1",
          id_foranea_criterio: "crit-1",
          id_foranea_rubrica: null,
          nombre_banda: "Banda Test",
          nombre_rubrica: null,
          nombre_criterio: "Marcha",
          lugar_evento: "Plaza",
          fecha_evento: "2026-07-28",
          cantidad_duplicados: 2,
        },
      ],
      error: null,
    });

    const svc = new AlertasEvaluacionServices();
    const alertas = await svc.obtenerAlertas();

    expect(supabaseMock.rpcCalls[0]?.fn).toBe("obtener_alertas_evaluacion_duplicada");
    expect(alertas).toHaveLength(1);
    expect(alertas[0].nombreBanda).toBe("Banda Test");
    expect((alertas[0] as unknown as { cantidadDuplicados: number }).cantidadDuplicados).toBe(2);
  });

  it("obtenerAlertas propaga error del RPC", async () => {
    supabaseMock.setResult({ data: null, error: { message: "rpc error" } });
    const svc = new AlertasEvaluacionServices();
    await expect(svc.obtenerAlertas()).rejects.toEqual({ message: "rpc error" });
  });
});
