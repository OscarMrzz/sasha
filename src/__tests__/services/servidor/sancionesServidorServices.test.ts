import { useSupabaseMock } from "../../mocks/setupClientMocks";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  unstable_cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
}));

import { getAplicacionSancionesServidor } from "@/services/servidor/sancionesServidorServices";

const supabaseMock = useSupabaseMock();

describe("sancionesServidorServices", () => {
  it("getAplicacionSancionesServidor mapea columnas snake_case a camelCase", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_banda: "banda-1",
          nombre_banda: "Banda Norte",
          id_categoria: "cat-1",
          nombre_categoria: "Juvenil",
          id_region: "reg-1",
          nombre_region: "Centro",
          puntos_descontados: 5,
        },
      ],
      error: null,
    });

    const rows = await getAplicacionSancionesServidor();

    expect(supabaseMock.client.from).toHaveBeenCalledWith("vista_aplicacion_sanciones");
    expect(rows[0].idBanda).toBe("banda-1");
    expect(rows[0].nombreCategoria).toBe("Juvenil");
    expect(rows[0].nombreRegion).toBe("Centro");
  });
});
