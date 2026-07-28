import { useSupabaseMock } from "../mocks/setupClientMocks";
import { describe, expect, it } from "vitest";
import PerfilesServices from "@/services/perfilesServices";

const supabaseMock = useSupabaseMock();

describe("PerfilesServices", () => {
  it("get devuelve perfiles en camelCase", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_perfil: "perfil-1",
          nombre: "Test",
          id_foranea_federacion: "fed-1",
          estado: "activo",
        },
      ],
      error: null,
    });

    const svc = new PerfilesServices();
    const rows = await svc.get();

    expect(supabaseMock.client.from).toHaveBeenCalledWith("perfiles");
    expect(rows[0].idPerfil).toBe("perfil-1");
    expect(rows[0].nombre).toBe("Test");
  });

  it("getOne devuelve un perfil por id", async () => {
    supabaseMock.setResult({
      data: {
        id_perfil: "perfil-2",
        nombre: "Otro",
        primer_apellido: "Pérez",
      },
      error: null,
    });

    const svc = new PerfilesServices();
    const row = await svc.getOne("perfil-2");

    expect(row.idPerfil).toBe("perfil-2");
    expect(row.primerApellido).toBe("Pérez");
  });
});
