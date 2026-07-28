import { describe, expect, it } from "vitest";
import { useSupabaseMock } from "../mocks/setupClientMocks";
import FederacionesService from "@/services/federacionesServices";

const federacionRow = {
  id_federacion: "fed-1",
  created_at: "2024-01-01T00:00:00Z",
  nombre_federacion: "Fed Test",
};

describe("FederacionesService", () => {
  const mock = useSupabaseMock();

  it("get returns all federaciones mapped", async () => {
    mock.setResult({ data: [federacionRow], error: null });
    const service = new FederacionesService();
    const result = await service.get();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      idFederacion: "fed-1",
      nombreFederacion: "Fed Test",
    });
  });

  it("create returns mapped row", async () => {
    mock.setResult({ data: federacionRow, error: null });
    const service = new FederacionesService();
    const result = await service.create({
      nombreFederacion: "Fed Test",
    } as Parameters<FederacionesService["create"]>[0]);
    expect(result.idFederacion).toBe("fed-1");
  });

  it("get propagates supabase error", async () => {
    const dbError = { message: "db fail" };
    mock.setResult({ data: null, error: dbError });
    const service = new FederacionesService();
    await expect(service.get()).rejects.toEqual(dbError);
  });
});
