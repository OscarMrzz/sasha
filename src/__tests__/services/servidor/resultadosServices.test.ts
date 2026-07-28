import { useSupabaseMock } from "../../mocks/setupClientMocks";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}));

import { getResultadosByIdBanda } from "@/services/servidor/resultadosServices";

const supabaseMock = useSupabaseMock();

describe("servidor/resultadosServices", () => {
  it("getResultadosByIdBanda devuelve fila de temporada mapeada", async () => {
    supabaseMock.setResult({
      data: {
        id_banda: "banda-1",
        nombre_banda: "Banda Alpha",
        id_categoria: "cat-1",
        nombre_categoria: "Juvenil",
        total_despues_sanciones: 120,
      },
      error: null,
    });

    const row = await getResultadosByIdBanda("banda-1");

    expect(supabaseMock.client.from).toHaveBeenCalledWith("vista_resultados_temporada");
    expect(row?.idBanda).toBe("banda-1");
    expect(row?.nombreBanda).toBe("Banda Alpha");
    expect(row?.total_despues_sanciones).toBe(120);
  });

  it("getResultadosByIdBanda devuelve null sin fila", async () => {
    supabaseMock.setResult({ data: null, error: null });
    const row = await getResultadosByIdBanda("banda-inexistente");
    expect(row).toBeNull();
  });
});
