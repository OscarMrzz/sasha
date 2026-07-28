import { beforeEach, describe, expect, it, vi } from "vitest";

const redirect = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({ redirect }));

describe("servidorMiBandaHealth", () => {
  beforeEach(() => {
    vi.resetModules();
    redirect.mockClear();
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it("serializes errors and postgrest objects", async () => {
    const { serializarCausaErrorMiBanda } = await import(
      "@/helpers/mi-banda/servidorMiBandaHealth"
    );
    expect(serializarCausaErrorMiBanda(new Error("boom"))).toMatch(/Error: boom/);
    expect(
      serializarCausaErrorMiBanda({ message: "x", code: "PGRST116" })
    ).toContain("PGRST116");
    expect(serializarCausaErrorMiBanda(undefined)).toMatch(/sin detalle/);
  });

  it("checks credentials and redirects when missing", async () => {
    const mod = await import("@/helpers/mi-banda/servidorMiBandaHealth");
    expect(mod.tieneCredencialesServidorSupabase()).toBe(false);
    expect(() => mod.redirectSiFaltanCredencialesServidorMiBanda()).toThrow(
      /servicio-no-disponible/
    );
  });

  it("redirects on server error", async () => {
    process.env.NODE_ENV = "production";
    const mod = await import("@/helpers/mi-banda/servidorMiBandaHealth");
    expect(() => mod.redirectPorErrorServidorMiBanda(new Error("fail"))).toThrow(
      /servicio-no-disponible/
    );
  });
});
