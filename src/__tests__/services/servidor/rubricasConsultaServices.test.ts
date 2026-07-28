import { useSupabaseMock } from "../../mocks/setupClientMocks";
import { describe, expect, it } from "vitest";
import { getRubricasCompletas } from "@/services/servidor/rubricasConsultaServices";

const supabaseMock = useSupabaseMock();

describe("rubricasConsultaServices", () => {
  it("getRubricasCompletas lanza sin id de federación", async () => {
    await expect(getRubricasCompletas("")).rejects.toThrow(
      "No hay federación para consultar rúbricas.",
    );
  });

  it("getRubricasCompletas devuelve rúbricas con criteriosEvalucion ordenados", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_rubrica: "rub-1",
          nombre_rubrica: "Marcha",
          id_foranea_federacion: "fed-1",
          categorias: { nombre_categoria: "Juvenil" },
          federaciones: { nombre_federacion: "Fed Test" },
          criterios_evaluacion: [
            {
              id_criterio: "crit-1",
              nombre_criterio: "Precisión",
              cumplimientos: [
                { id_cumplimiento: "c2", puntos_cumplimiento: 10 },
                { id_cumplimiento: "c1", puntos_cumplimiento: 5 },
              ],
            },
          ],
        },
      ],
      error: null,
    });

    const rubricas = await getRubricasCompletas("fed-1");

    expect(supabaseMock.client.from).toHaveBeenCalledWith("rubricas");
    expect(rubricas).toHaveLength(1);
    expect(rubricas[0].criteriosEvalucion?.[0].cumplimientos?.[0].puntosCumplimiento).toBe(5);
    expect(rubricas[0].criteriosEvalucion?.[0].cumplimientos?.[1].puntosCumplimiento).toBe(10);
  });

  it("getRubricasCompletas filtra por categoría cuando se indica", async () => {
    supabaseMock.setResult({ data: [], error: null });

    await getRubricasCompletas("fed-1", "cat-1");

    const handle = supabaseMock.fromCalls.at(-1)?.handle;
    expect(
      handle?.calls.some(
        (c) => c.method === "eq" && c.args[0] === "id_foranea_categoria" && c.args[1] === "cat-1",
      ),
    ).toBe(true);
  });
});
