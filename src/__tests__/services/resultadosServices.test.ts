import { useSupabaseMock } from "../mocks/setupClientMocks";
import { assignPerfil } from "../mocks/perfilFixture";
import { describe, expect, it } from "vitest";
import {
  fetchResultadosPreliminaresEvento,
  getVistaCondensado,
  ResultadosService,
} from "@/services/resultadosServices";

const supabaseMock = useSupabaseMock();

describe("resultadosServices", () => {
  it("fetchResultadosPreliminaresEvento filtra evento, categoría y federación", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_evento: "evt-1",
          id_foranea_categoria: "cat-1",
          id_foranea_federacion: "fed-1",
          rankin: 1,
          total: 95,
        },
      ],
      error: null,
    });

    const rows = await fetchResultadosPreliminaresEvento("evt-1", "cat-1", "fed-1");

    expect(supabaseMock.client.from).toHaveBeenCalledWith("vista_resultados_preliminares");
    expect(rows).toHaveLength(1);
    expect(rows[0].total).toBe(95);
  });

  it("getVistaCondensado devuelve filas mapeadas", async () => {
    supabaseMock.setResult({
      data: [{ id_banda: "banda-1", nombre_banda: "Alpha", total_despues_sanciones: 80 }],
      error: null,
    });

    const rows = await getVistaCondensado();

    expect(supabaseMock.client.from).toHaveBeenCalledWith("vista_condensado");
    expect(rows[0].nombreBanda).toBe("Alpha");
  });

  it("ResultadosService.getRubricasPorCategoria exige federación", async () => {
    const svc = new ResultadosService();
    svc.perfil = null;
    await expect(svc.getRubricasPorCategoria("cat-1")).rejects.toThrow(
      "No hay federación en el perfil del usuario.",
    );
  });
});
