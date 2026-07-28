/** @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from "vitest";

const { signOut } = vi.hoisted(() => ({
  signOut: vi.fn(async () => ({ error: null })),
}));

vi.mock("@/lib/supabase", () => ({
  dataBaseSupabase: { auth: { signOut } },
}));
vi.mock("@/lib/copasWizardPersistence", () => ({
  deleteCopasWizardCookie: vi.fn(),
}));
vi.mock("@/lib/evaluarPersistence", () => ({
  deleteEvaluarDraftCookie: vi.fn(),
  deleteEvaluarSession: vi.fn(),
}));
vi.mock("@/lib/fiscalPersistence", () => ({
  deleteFiscalWizardCookie: vi.fn(),
}));

import { cerrarSesionYLimpiar, limpiarSesionLocal } from "@/helpers/utils/sesion";

describe("sesion", () => {
  beforeEach(() => {
    localStorage.clear();
    document.cookie = "perfilActivo=x; path=/";
    localStorage.setItem("sasha_foo", "1");
    localStorage.setItem("sb-token", "1");
    signOut.mockClear();
  });

  it("limpia storage y cierra sesión", async () => {
    await limpiarSesionLocal();
    expect(signOut).toHaveBeenCalled();
    expect(localStorage.getItem("sasha_foo")).toBeNull();
    expect(localStorage.getItem("sb-token")).toBeNull();
  });

  it("redirige al cerrar sesión", async () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      writable: true,
      value: { href: "" },
    });
    await cerrarSesionYLimpiar();
    expect(window.location.href).toContain("SignInPage");
  });
});
