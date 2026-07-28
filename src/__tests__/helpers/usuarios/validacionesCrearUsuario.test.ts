import { describe, expect, it } from "vitest";
import {
  validarBandaSegunRol,
  validarDatosAuthCrearUsuario,
  validarEmail,
  validarFormularioAgregarUsuario,
  validarPassword,
} from "@/helpers/usuarios/validacionesCrearUsuario";

describe("validacionesCrearUsuario", () => {
  it("validates email", () => {
    expect(validarEmail("").valido).toBe(false);
    expect(validarEmail("bad").valido).toBe(false);
    expect(validarEmail("a@b.com").valido).toBe(true);
  });

  it("validates password and confirmation", () => {
    expect(validarPassword("123").valido).toBe(false);
    expect(validarPassword("123456", "123457").campo).toBe("password2");
    expect(validarPassword("123456", "123456").valido).toBe(true);
  });

  it("requires banda for band roles", () => {
    expect(validarBandaSegunRol("dirigente", null).valido).toBe(false);
    expect(validarBandaSegunRol("jurado", null).valido).toBe(true);
  });

  it("validates auth bundle and full form", () => {
    expect(
      validarDatosAuthCrearUsuario({ email: "a@b.com", password: "123456" }).valido
    ).toBe(true);
    const form = validarFormularioAgregarUsuario({
      email: "a@b.com",
      password: "123456",
      password2: "123456",
      nombre: "Ana",
      idForaneaRol: "r1",
      requiereFederacion: true,
      idForaneaFederacion: "f1",
      nombreRol: "jurado",
    });
    expect(form.valido).toBe(true);
  });
});
