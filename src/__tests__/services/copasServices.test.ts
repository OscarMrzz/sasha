import { useSupabaseMock } from "../mocks/setupClientMocks";
import { perfilFixture } from "../mocks/perfilFixture";
import { describe, expect, it } from "vitest";
import CopasServices from "@/services/copasServices";

const supabaseMock = useSupabaseMock();

describe("CopasServices", () => {
  it("get lanza sin federación en el perfil", async () => {
    const svc = new CopasServices();
    svc.perfil = null;
    await expect(svc.get()).rejects.toThrow(/federaci/);
  });

  it("get devuelve copas de eventos de la federación", async () => {
    supabaseMock.enqueueResults(
      { data: [{ id_evento: "evt-1" }], error: null },
      {
        data: [
          {
            id_copas: "copa-1",
            id_foranea_evento: "evt-1",
            id_foranea_banda: "banda-1",
            tipo_copa: "oro",
          },
        ],
        error: null,
      },
    );

    const svc = new CopasServices();
    svc.setPerfil(perfilFixture);
    const copas = await svc.get();

    expect(supabaseMock.fromCalls.map((c) => c.table)).toEqual(["registro_eventos", "copas"]);
    expect(copas).toHaveLength(1);
    expect(copas[0].id_copas).toBe("copa-1");
  });

  it("get devuelve arreglo vacío si no hay eventos en la federación", async () => {
    supabaseMock.setResult({ data: [], error: null });

    const svc = new CopasServices();
    svc.setPerfil(perfilFixture);
    const copas = await svc.get();

    expect(copas).toEqual([]);
  });
});
