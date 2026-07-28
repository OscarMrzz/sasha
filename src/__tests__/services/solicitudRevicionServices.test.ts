import { useSupabaseMock } from "../mocks/setupClientMocks";
import { assignPerfil } from "../mocks/perfilFixture";
import { describe, expect, it } from "vitest";
import SolicitudRevicionServices from "@/services/solicitudRevicionServices";

const supabaseMock = useSupabaseMock();

describe("SolicitudRevicionServices", () => {
  it("get filtra por federación del perfil asignado", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_solicitud: "sol-1",
          id_foranea_federacion: "fed-1",
          estado: "pendiente",
        },
      ],
      error: null,
    });

    const svc = assignPerfil(new SolicitudRevicionServices());
    const rows = await svc.get();

    expect(supabaseMock.client.from).toHaveBeenCalledWith("solicitud_revision");
    expect(rows[0].idSolicitud).toBe("sol-1");
    expect(rows[0].estado).toBe("pendiente");
  });

  it("getOne devuelve una solicitud por id", async () => {
    supabaseMock.setResult({
      data: {
        id_solicitud: "sol-2",
        id_foranea_federacion: "fed-1",
        estado: "aprobada",
      },
      error: null,
    });

    const svc = assignPerfil(new SolicitudRevicionServices());
    const row = await svc.getOne("sol-2");

    expect(row.idSolicitud).toBe("sol-2");
    const handle = supabaseMock.fromCalls.at(-1)?.handle;
    expect(handle?.calls.some((c) => c.method === "single")).toBe(true);
  });
});
