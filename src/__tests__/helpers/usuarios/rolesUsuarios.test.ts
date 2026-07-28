import { describe, expect, it } from "vitest";
import {
  esGestorUsuariosFederacion,
  esRolRestringido,
  filtrarPerfilesPermitidos,
  filtrarRolesPermitidos,
  normalizarNombreRol,
  rolRequiereVinculoBanda,
} from "@/helpers/usuarios/rolesUsuarios";

describe("rolesUsuarios", () => {
  it("normalizes role names", () => {
    expect(normalizarNombreRol("  Admin ")).toBe("admin");
    expect(normalizarNombreRol(null)).toBe("");
  });

  it("detects gestores and band roles", () => {
    expect(esGestorUsuariosFederacion("Secretaria")).toBe(true);
    expect(esGestorUsuariosFederacion("jurado")).toBe(false);
    expect(rolRequiereVinculoBanda("liderBanda")).toBe(true);
    expect(rolRequiereVinculoBanda("admin")).toBe(false);
  });

  it("filters restricted roles and inactive", () => {
    expect(esRolRestringido("developer")).toBe(true);
    const roles = [
      { idRol: "1", nombreRol: "jurado", estadoRol: true },
      { idRol: "2", nombreRol: "admin", estadoRol: true },
      { idRol: "3", nombreRol: "secretaria", estadoRol: false },
    ] as never[];
    expect(filtrarRolesPermitidos(roles)).toHaveLength(1);
    expect(filtrarRolesPermitidos(roles, ["admin"], false)).toHaveLength(2);
  });

  it("filters perfiles by privileged roles", () => {
    const perfiles = [
      { roles: { nombreRol: "jurado" } },
      { roles: { nombreRol: "admin" } },
    ] as never[];
    expect(filtrarPerfilesPermitidos(perfiles)).toHaveLength(1);
  });
});
