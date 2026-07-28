import { describe, expect, it } from "vitest";
import {
  MENSAJE_USUARIO_ELIMINADO,
  validarAccesoPerfil,
} from "@/helpers/usuarios/validarAccesoPerfil";

describe("validarAccesoPerfil", () => {
  const rolOk = { idRol: "r1", nombreRol: "admin", estadoRol: true };

  it("returns usuario_eliminado when estado is not activo", () => {
    expect(
      validarAccesoPerfil({
        estado: "eliminado" as never,
        permisos: true,
        idForaneaRol: "r1",
        roles: rolOk as never,
      })
    ).toBe("usuario_eliminado");
    expect(MENSAJE_USUARIO_ELIMINADO).toMatch(/eliminada/);
  });

  it("returns sin_permisos", () => {
    expect(
      validarAccesoPerfil({
        estado: "activo" as never,
        permisos: false,
        idForaneaRol: "r1",
        roles: rolOk as never,
      })
    ).toBe("sin_permisos");
  });

  it("returns rol_inactivo when rol missing or inactive", () => {
    expect(
      validarAccesoPerfil({
        estado: "activo" as never,
        permisos: true,
        idForaneaRol: "",
        roles: null,
      })
    ).toBe("rol_inactivo");
    expect(
      validarAccesoPerfil({
        estado: "activo" as never,
        permisos: true,
        idForaneaRol: "r1",
        roles: { ...rolOk, estadoRol: false } as never,
      })
    ).toBe("rol_inactivo");
  });

  it("returns ok for valid perfil", () => {
    expect(
      validarAccesoPerfil({
        estado: "activo" as never,
        permisos: true,
        idForaneaRol: "r1",
        roles: rolOk as never,
      })
    ).toBe("ok");
  });
});
