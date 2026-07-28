import { useSupabaseMock } from "../mocks/setupClientMocks";
import { describe, expect, it } from "vitest";
import {
  activarAccesoPorEventoCategoria,
  getUsuariosPorEventoCategoria,
} from "@/services/controladoresServices";

const supabaseMock = useSupabaseMock();

describe("controladoresServices", () => {
  it("getUsuariosPorEventoCategoria exige id_evento", async () => {
    await expect(getUsuariosPorEventoCategoria("", "cat-1")).rejects.toThrow(
      "id_evento es obligatorio.",
    );
  });

  it("getUsuariosPorEventoCategoria mapea primer_apellido a primerApellido", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_fonranea_perfil: "perfil-1",
          id_foranea_evento: "evt-1",
          id_foranea_categoria: "cat-1",
          nombre: "Ana",
          primer_apellido: "López",
        },
      ],
      error: null,
    });

    const rows = await getUsuariosPorEventoCategoria("evt-1", "cat-1");

    expect(supabaseMock.client.from).toHaveBeenCalledWith("vista_usuarios_por_banda_en_evento");
    expect(rows[0].primerApellido).toBe("López");
  });

  it("activarAccesoPorEventoCategoria invoca RPC con p_activar true", async () => {
    supabaseMock.setResult({ data: null, error: null });

    const ok = await activarAccesoPorEventoCategoria("evt-1", "cat-1");

    expect(ok).toBe(true);
    expect(supabaseMock.rpcCalls).toEqual([
      {
        fn: "fn_cambiar_acceso_evento_categoria",
        args: {
          p_id_evento: "evt-1",
          p_id_categoria: "cat-1",
          p_activar: true,
        },
      },
    ]);
  });
});
