import { describe, expect, it } from "vitest";
import { useSupabaseMock } from "../mocks/setupClientMocks";
import {
  createSolicitudCopa,
  deleteSolicitudCopa,
  getSolicitudCopaById,
  getSolicitudesCopas,
  updateSolicitudCopa,
} from "@/services/solicitudCopasServices";

const solicitudRow = {
  id_solicitud_copa: "sol-copa-1",
  created_at_solicitud_copa: "2024-01-01T00:00:00Z",
  id_foranea_evento: "evt-1",
  id_foranea_banda: "banda-1",
  id_foranea_solicitante: "perfil-1",
  tipo_solicitud_copa: "copa",
  justificacion_solicitud_copa: "Justificación",
  estado: true,
  lugar_solicitud_copas: 1,
};

describe("solicitudCopasServices", () => {
  const mock = useSupabaseMock();

  it("getSolicitudesCopas returns rows", async () => {
    mock.setResult({ data: [solicitudRow], error: null });
    const result = await getSolicitudesCopas();
    expect(result[0].id_solicitud_copa).toBe("sol-copa-1");
  });

  it("getSolicitudCopaById returns single row", async () => {
    mock.setResult({ data: solicitudRow, error: null });
    const result = await getSolicitudCopaById("sol-copa-1");
    expect(result.tipo_solicitud_copa).toBe("copa");
  });

  it("createSolicitudCopa inserts and returns row", async () => {
    mock.setResult({ data: solicitudRow, error: null });
    const result = await createSolicitudCopa({
      id_foranea_evento: "evt-1",
      id_foranea_banda: "banda-1",
      id_foranea_solicitante: "perfil-1",
      tipo_solicitud_copa: "copa",
      justificacion_solicitud_copa: "Justificación",
      lugar_solicitud_copas: 1,
    });
    expect(result.id_solicitud_copa).toBe("sol-copa-1");
  });

  it("updateSolicitudCopa updates and returns row", async () => {
    mock.setResult({ data: { ...solicitudRow, estado: false }, error: null });
    const result = await updateSolicitudCopa("sol-copa-1", { estado: false });
    expect(result.estado).toBe(false);
  });

  it("deleteSolicitudCopa returns true on success", async () => {
    mock.setResult({ data: null, error: null });
    await expect(deleteSolicitudCopa("sol-copa-1")).resolves.toBe(true);
  });

  it("getSolicitudesCopas propagates supabase error", async () => {
    const dbError = { message: "db fail" };
    mock.setResult({ data: null, error: dbError });
    await expect(getSolicitudesCopas()).rejects.toEqual(dbError);
  });
});
