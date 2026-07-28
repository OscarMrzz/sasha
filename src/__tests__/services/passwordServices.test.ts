import { useSupabaseMock } from "../mocks/setupClientMocks";
import { describe, expect, it } from "vitest";
import { listarCorreosUsuarios } from "@/services/passwordServices";

const supabaseMock = useSupabaseMock();

describe("passwordServices", () => {
  it("listarCorreosUsuarios rechaza sin sesión válida", async () => {
    supabaseMock.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const result = await listarCorreosUsuarios();

    expect(result.data).toBeNull();
    expect(result.error?.message).toMatch(/sesión/i);
  });

  it("listarCorreosUsuarios devuelve correos ordenados para admin", async () => {
    supabaseMock.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: "user-admin" } },
      error: null,
    });

    supabaseMock.enqueueResults({
      data: {
        permisos: true,
        roles: { nombre_rol: "admin", estado_rol: true },
      },
      error: null,
    });

    supabaseMock.auth.admin.listUsers.mockResolvedValueOnce({
      data: {
        users: [
          { id: "u-2", email: "zeta@test.com" },
          { id: "u-1", email: "alpha@test.com" },
        ],
      },
      error: null,
    });

    const result = await listarCorreosUsuarios();

    expect(result.error).toBeNull();
    expect(result.data?.map((c) => c.email)).toEqual(["alpha@test.com", "zeta@test.com"]);
    expect(supabaseMock.auth.admin.listUsers).toHaveBeenCalled();
  });
});
