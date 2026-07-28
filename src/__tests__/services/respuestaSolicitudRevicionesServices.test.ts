import { useSupabaseMock } from "../mocks/setupClientMocks";
import { assignPerfil } from "../mocks/perfilFixture";
import { describe, expect, it } from "vitest";
import RespuestaSolicitudRevicionesServices from "@/services/respuestaSolicitudRevicionesServices";

const supabaseMock = useSupabaseMock();

describe("RespuestaSolicitudRevicionesServices", () => {
  it("get consulta respuestas de la federación del perfil", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_respuesta: "resp-1",
          id_foranea_federacion: "fed-1",
          respuesta: "Aceptada",
        },
      ],
      error: null,
    });

    const svc = assignPerfil(new RespuestaSolicitudRevicionesServices());
    const rows = await svc.get();

    expect(supabaseMock.client.from).toHaveBeenCalledWith("respuesta_solicitud_revision");
    expect(rows[0].idRespuesta).toBe("resp-1");
  });

  it("propaga error de Supabase en get", async () => {
    supabaseMock.setResult({ data: null, error: { message: "read failed" } });
    const svc = assignPerfil(new RespuestaSolicitudRevicionesServices());
    await expect(svc.get()).rejects.toEqual({ message: "read failed" });
  });
});
