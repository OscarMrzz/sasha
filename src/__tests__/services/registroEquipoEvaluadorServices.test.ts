import { useSupabaseMock } from "../mocks/setupClientMocks";
import { describe, expect, it } from "vitest";
import RegistroEquipoEvaluadorServices from "@/services/registroEquipoEvaluadorServices";

const supabaseMock = useSupabaseMock();

describe("RegistroEquipoEvaluadorServices", () => {
  it("get consulta todos los registros del equipo evaluador", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_registro_evaluador: "ree-1",
          id_foranea_evento: "evt-1",
          id_foranea_perfil: "perfil-2",
        },
      ],
      error: null,
    });

    const svc = new RegistroEquipoEvaluadorServices();
    const rows = await svc.get();

    expect(supabaseMock.client.from).toHaveBeenCalledWith("registro_equipo_evaluador");
    expect(rows[0].idRegistroEvaluador).toBe("ree-1");
  });

  it("getporPerfil filtra por id_foranea_perfil", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_registro_evaluador: "ree-2",
          id_foranea_perfil: "perfil-1",
          registro_eventos: { id_evento: "evt-1" },
        },
      ],
      error: null,
    });

    const svc = new RegistroEquipoEvaluadorServices();
    const rows = await svc.getporPerfil("perfil-1");

    expect(rows).toHaveLength(1);
    expect(rows[0].idRegistroEvaluador).toBe("ree-2");
    const handle = supabaseMock.fromCalls.at(-1)?.handle;
    expect(handle?.calls.some((c) => c.method === "eq" && c.args[0] === "id_foranea_perfil")).toBe(
      true,
    );
  });
});
