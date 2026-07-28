import { useSupabaseMock } from "../../mocks/setupClientMocks";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}));

import { getVistaCopasEventos } from "@/services/servidor/copasServices";

const supabaseMock = useSupabaseMock();

describe("servidor/copasServices", () => {
  it("getVistaCopasEventos consulta vista_copas_eventos", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_copas: "copa-1",
          id_foranea_evento: "evt-1",
          nombre_banda: "Banda Test",
          tipo_copa: "oro",
        },
      ],
      error: null,
    });

    const rows = await getVistaCopasEventos();

    expect(supabaseMock.client.from).toHaveBeenCalledWith("vista_copas_eventos");
    expect(rows).toHaveLength(1);
    expect(rows[0].id_copas).toBe("copa-1");
  });
});
