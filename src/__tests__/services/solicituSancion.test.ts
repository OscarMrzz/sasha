import { describe, expect, it } from "vitest";
import { useSupabaseMock } from "../mocks/setupClientMocks";
import {
  createSolicitudSancion,
  deleteSolicitudSancion,
  getSolicitudSancionById,
  getSolicitudesSancion,
  updateSolicitudSancion,
} from "@/services/solicituSancion";

const solicitudRow = {
  id_solicitud_sancion: "sol-sanc-1",
  created_at_solicitud_sancion: "2024-01-01T00:00:00Z",
  id_fonranea_sancion: "sanc-1",
  id_foranea_banda: "banda-1",
  id_foranea_solicitante: "perfil-1",
  justificacion: "Justificación",
  estado: true,
};

describe("solicituSancion", () => {
  const mock = useSupabaseMock();

  it("getSolicitudesSancion returns rows", async () => {
    mock.setResult({ data: [solicitudRow], error: null });
    const result = await getSolicitudesSancion();
    expect(result[0].id_solicitud_sancion).toBe("sol-sanc-1");
  });

  it("getSolicitudSancionById returns single row", async () => {
    mock.setResult({ data: solicitudRow, error: null });
    const result = await getSolicitudSancionById("sol-sanc-1");
    expect(result.justificacion).toBe("Justificación");
  });

  it("createSolicitudSancion inserts and returns row", async () => {
    mock.setResult({ data: solicitudRow, error: null });
    const result = await createSolicitudSancion({
      id_fonranea_sancion: "sanc-1",
      id_foranea_banda: "banda-1",
      id_foranea_solicitante: "perfil-1",
      justificacion: "Justificación",
      estado: true,
    });
    expect(result.id_solicitud_sancion).toBe("sol-sanc-1");
  });

  it("updateSolicitudSancion updates and returns row", async () => {
    mock.setResult({ data: { ...solicitudRow, estado: false }, error: null });
    const result = await updateSolicitudSancion("sol-sanc-1", { estado: false });
    expect(result.estado).toBe(false);
  });

  it("deleteSolicitudSancion returns true on success", async () => {
    mock.setResult({ data: null, error: null });
    await expect(deleteSolicitudSancion("sol-sanc-1")).resolves.toBe(true);
  });

  it("getSolicitudesSancion propagates supabase error", async () => {
    const dbError = { message: "db fail" };
    mock.setResult({ data: null, error: dbError });
    await expect(getSolicitudesSancion()).rejects.toEqual(dbError);
  });
});
