import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/dashboard/useDashboardData", () => ({
  fechaHoyLocalISO: () => "2024-07-01",
}));

import { filtrarSolicitudesCopaActivas } from "@/helpers/solicitudCopa/filtrarSolicitudesCopaActivas";

describe("filtrarSolicitudesCopaActivas", () => {
  const base = {
    estado: null,
    fechaEvento: "2024-07-01",
    estado_evento: "en_curso",
    idEvento: "e1",
  };

  it("keeps pending same-day non-finalized", () => {
    const out = filtrarSolicitudesCopaActivas(
      [
        base,
        { ...base, estado: true },
        { ...base, fechaEvento: "2024-07-02" },
        { ...base, estado_evento: "finalizado" },
        { ...base, idEvento: "e2" },
      ] as never[],
      "2024-07-01",
      ["e1"]
    );
    expect(out).toHaveLength(1);
    expect(out[0].idEvento).toBe("e1");
  });

  it("without allowlist keeps all matching day", () => {
    expect(
      filtrarSolicitudesCopaActivas(
        [base, { ...base, idEvento: "e2" }] as never[],
        "2024-07-01"
      )
    ).toHaveLength(2);
  });
});
