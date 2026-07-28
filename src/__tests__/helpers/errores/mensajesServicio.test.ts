import { describe, expect, it } from "vitest";
import {
  esErrorConexionBaseDatos,
  esErrorPermisos,
  esErrorSinInternet,
  mensajeErrorServicio,
} from "@/helpers/errores/mensajesServicio";

describe("mensajesServicio", () => {
  it("detects network errors", () => {
    const err = new TypeError("Failed to fetch");
    expect(esErrorSinInternet(err)).toBe(true);
    expect(mensajeErrorServicio(err, "ctx")).toMatch(/internet/i);
  });

  it("detects DB connection errors", () => {
    expect(esErrorConexionBaseDatos({ code: "PGRST000" })).toBe(true);
    expect(esErrorConexionBaseDatos({ status: 503 })).toBe(true);
    expect(mensajeErrorServicio({ code: "08006" }, "ctx")).toMatch(/base de datos/i);
  });

  it("detects permission errors", () => {
    expect(esErrorPermisos({ code: "42501" })).toBe(true);
    expect(mensajeErrorServicio({ message: "permission denied" }, "ctx")).toMatch(/permiso/i);
  });

  it("translates auth messages and falls back with context", () => {
    expect(mensajeErrorServicio({ message: "User already registered" }, "Crear")).toMatch(
      /Ya existe un usuario/
    );
    expect(mensajeErrorServicio({ message: "boom" }, "Guardar")).toBe("Guardar: boom");
    expect(mensajeErrorServicio({}, "X")).toMatch(/X\. Revisa/);
  });
});
