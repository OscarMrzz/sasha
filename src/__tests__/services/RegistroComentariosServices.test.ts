import { useSupabaseMock } from "../mocks/setupClientMocks";
import { assignPerfil } from "../mocks/perfilFixture";
import { describe, expect, it } from "vitest";
import RegistroComentariosServices from "@/services/RegistroComentariosServices";

const supabaseMock = useSupabaseMock();

describe("RegistroComentariosServices", () => {
  it("get exige federación en el perfil", async () => {
    const svc = new RegistroComentariosServices();
    svc.perfil = null;
    await expect(svc.get()).rejects.toThrow("No hay federación en el perfil del usuario.");
  });

  it("get filtra por id_foranea_federacion del perfil", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_registro_comentario: "com-1",
          id_foranea_federacion: "fed-1",
          comentario: "Buen desempeño",
        },
      ],
      error: null,
    });

    const svc = assignPerfil(new RegistroComentariosServices());
    const rows = await svc.get();

    expect(supabaseMock.client.from).toHaveBeenCalledWith("registro_comentarios");
    expect(rows).toHaveLength(1);
    expect(rows[0].idRegistroComentario).toBe("com-1");
  });
});
