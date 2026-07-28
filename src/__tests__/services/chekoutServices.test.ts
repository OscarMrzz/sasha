import { useSupabaseMock } from "../mocks/setupClientMocks";
import { describe, expect, it } from "vitest";
import {
  getAllCheckout,
  getCheckoutBandaByIdByEvento,
} from "@/services/chekoutServices";

const supabaseMock = useSupabaseMock();

describe("chekoutServices", () => {
  it("getAllCheckout lee vista_detalle_checkout", async () => {
    supabaseMock.setResult({
      data: [
        {
          id_checkout: "chk-1",
          id_foranea_banda: "banda-1",
          nombre_banda: "Banda Norte",
          lugar_evento: "Plaza",
        },
      ],
      error: null,
    });

    const rows = await getAllCheckout();

    expect(supabaseMock.client.from).toHaveBeenCalledWith("vista_detalle_checkout");
    expect(rows[0].nombreBanda).toBe("Banda Norte");
    expect(rows[0].LugarEvento).toBe("Plaza");
  });

  it("getCheckoutBandaByIdByEvento filtra banda y evento", async () => {
    supabaseMock.setResult({
      data: {
        id_checkout: "chk-2",
        id_foranea_banda: "banda-1",
        id_foranea_evento: "evt-1",
        nombre_banda: "Banda Sur",
        lugar_evento: "Estadio",
      },
      error: null,
    });

    const row = await getCheckoutBandaByIdByEvento("banda-1", "evt-1");

    expect(row.id_checkout).toBe("chk-2");
    const handle = supabaseMock.fromCalls.at(-1)?.handle;
    expect(handle?.calls.some((c) => c.method === "single")).toBe(true);
  });
});
