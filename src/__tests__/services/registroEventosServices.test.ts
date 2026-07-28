import { useSupabaseMock } from "../mocks/setupClientMocks";
import { assignPerfil, perfilFixture } from "../mocks/perfilFixture";
import { describe, expect, it } from "vitest";
import RegistroEventossServices from "@/services/registroEventosServices";

const supabaseMock = useSupabaseMock();

describe("RegistroEventossServices", () => {
  it("get lanza si no hay federación en el perfil", async () => {
    const svc = new RegistroEventossServices();
    svc.perfil = null;
    await expect(svc.get()).rejects.toThrow("No hay federación en el perfil del usuario.");
  });

  it("get consulta registro_eventos filtrado por federación", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_evento: "evt-1",
          id_foranea_federacion: "fed-1",
          lugar_evento: "Estadio",
          estado_evento: "programado",
        },
      ],
      error: null,
    });

    const svc = assignPerfil(new RegistroEventossServices());
    const rows = await svc.get();

    expect(supabaseMock.client.from).toHaveBeenCalledWith("registro_eventos");
    expect(rows).toHaveLength(1);
    expect(rows[0].idEvento).toBe("evt-1");
    expect(rows[0].LugarEvento).toBe("Estadio");
  });

  it("iniciarEvento actualiza estado_evento a iniciado", async () => {
    supabaseMock.setResult({
      data: {
        id_evento: "evt-1",
        id_foranea_federacion: "fed-1",
        estado_evento: "iniciado",
      },
      error: null,
    });

    const svc = assignPerfil(new RegistroEventossServices());
    const updated = await svc.iniciarEvento("evt-1");

    expect((updated as unknown as { estadoEvento: string }).estadoEvento).toBe("iniciado");
    const handle = supabaseMock.fromCalls.at(-1)?.handle;
    expect(handle?.calls.some((c) => c.method === "update")).toBe(true);
  });
});
