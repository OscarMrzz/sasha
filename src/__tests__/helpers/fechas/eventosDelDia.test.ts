import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/hooks/dashboard/useDashboardData", () => ({
  fechaHoyLocalISO: () => "2024-06-10",
}));

import {
  esEventoDelDia,
  filtrarEventosDelDia,
} from "@/helpers/fechas/eventosDelDia";

describe("eventosDelDia", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects same calendar day", () => {
    expect(esEventoDelDia("2024-06-10T18:00:00Z")).toBe(true);
    expect(esEventoDelDia("2024-06-11")).toBe(false);
  });

  it("filters list by fechaEvento", () => {
    const eventos = [
      { idEvento: "1", fechaEvento: "2024-06-10" },
      { idEvento: "2", fechaEvento: "2024-06-09" },
    ] as never[];
    expect(filtrarEventosDelDia(eventos)).toHaveLength(1);
  });
});
