import { useSupabaseMock } from "../mocks/setupClientMocks";
import { perfilFixture } from "../mocks/perfilFixture";
import { describe, expect, it } from "vitest";
import { createUser } from "@/services/userServices";

const supabaseMock = useSupabaseMock();

const datosPerfil = {
  nombre: "Nuevo Usuario",
  idForaneaRol: "rol-jurado",
  idForaneaFederacion: perfilFixture.idForaneaFederacion,
  permisos: true,
  nombreRol: "jurado",
};

describe("userServices", () => {
  it("createUser rechaza email inválido sin llamar admin.createUser", async () => {
    const result = await createUser("no-es-email", "password123", {}, datosPerfil);

    expect(result.error?.message).toMatch(/correo/i);
    expect(supabaseMock.auth.admin.createUser).not.toHaveBeenCalled();
  });

  it("createUser invoca admin.createUser con el email indicado", async () => {
    supabaseMock.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "user-admin" } },
      error: null,
    });

    supabaseMock.enqueueResults(
      {
        data: {
          id_foranea_rol: "rol-admin",
          id_foranea_federacion: perfilFixture.idForaneaFederacion,
          permisos: true,
          roles: { nombre_rol: "admin", estado_rol: true },
        },
        error: null,
      },
      { data: { id_permiso: "perm-1" }, error: null },
      {
        data: {
          id_rol: datosPerfil.idForaneaRol,
          nombre_rol: "jurado",
          estado_rol: true,
          id_foranea_federacion: perfilFixture.idForaneaFederacion,
        },
        error: null,
      },
      {
        data: {
          id_perfil: "perfil-nuevo",
          nombre: datosPerfil.nombre,
          id_foranea_user: "new-user-1",
          id_foranea_federacion: perfilFixture.idForaneaFederacion,
        },
        error: null,
      },
    );

    supabaseMock.auth.admin.createUser.mockResolvedValueOnce({
      data: { user: { id: "new-user-1", email: "nuevo@test.com" } },
      error: null,
    });

    const result = await createUser(
      "nuevo@test.com",
      "password123",
      {
        idForaneaRol: datosPerfil.idForaneaRol,
        idForaneaFederacion: datosPerfil.idForaneaFederacion,
      },
      datosPerfil,
    );

    expect(supabaseMock.auth.admin.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "nuevo@test.com" }),
    );
    expect(result.error).toBeNull();
    expect(result.data?.user?.email).toBe("nuevo@test.com");
    expect(result.data?.perfil?.idPerfil).toBe("perfil-nuevo");
  });
});
