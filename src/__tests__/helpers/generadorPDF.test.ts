/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

const save = vi.fn(async () => undefined);
const from = vi.fn(() => ({ save }));
const set = vi.fn(() => ({ from }));
const html2pdf = vi.fn(() => ({ set }));

vi.mock("html2pdf-pro", () => ({
  default: html2pdf,
}));

import { generarPdfDesdeElemento } from "@/helpers/generadorPDF";

describe("generadorPDF", () => {
  it("appends .pdf and calls html2pdf chain", async () => {
    const el = document.createElement("div");
    await generarPdfDesdeElemento(el, "reporte");
    expect(html2pdf).toHaveBeenCalled();
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({ filename: "reporte.pdf" })
    );
    expect(from).toHaveBeenCalledWith(el);
    expect(save).toHaveBeenCalled();
  });
});
