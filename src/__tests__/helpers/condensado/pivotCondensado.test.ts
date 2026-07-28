import { describe, expect, it } from "vitest";
import {
  extraerCategoriasConDatos,
  filtrarFilasPorBanda,
  pivotCondensado,
} from "@/helpers/condensado/pivotCondensado";
import { coincideBusqueda } from "@/helpers/busqueda/normalizarTextoBusqueda";

describe("pivotCondensado", () => {
  const rows = [
    {
      idCategoria: "c1",
      idRegion: "r1",
      idEvento: "e1",
      idBanda: "b1",
      nombreBanda: "Beta",
      idRubrica: "rub1",
      total: 10,
      nombreCategoria: "Cat",
    },
    {
      idCategoria: "c1",
      idRegion: "r1",
      idEvento: "e1",
      idBanda: "b2",
      nombreBanda: "Alfa",
      idRubrica: "rub1",
      total: 5,
      nombreCategoria: "Cat",
    },
    {
      idCategoria: "c2",
      idBanda: "b3",
      nombreBanda: "X",
      idRubrica: "rub1",
      total: 1,
      nombreCategoria: "Otra",
    },
  ] as never[];

  const rubricas = [{ idRubrica: "rub1" }, { idRubrica: "rub2" }] as never[];

  it("returns empty when categoria missing", () => {
    expect(pivotCondensado(rows, { idCategoria: "  " }, rubricas)).toEqual([]);
  });

  it("pivots and sorts by banda name", () => {
    const filas = pivotCondensado(rows, { idCategoria: "c1" }, rubricas);
    expect(filas.map((f) => f.nombreBanda)).toEqual(["Alfa", "Beta"]);
    expect(filas[0].totalesPorRubrica.rub1).toBe(5);
    expect(filas[0].totalesPorRubrica.rub2).toBe(0);
  });

  it("extracts categorias", () => {
    expect(extraerCategoriasConDatos(rows).map((c) => c.idCategoria).sort()).toEqual([
      "c1",
      "c2",
    ]);
  });

  it("filters filas by banda search", () => {
    const filas = pivotCondensado(rows, { idCategoria: "c1" }, rubricas);
    expect(filtrarFilasPorBanda(filas, "alf")).toHaveLength(1);
    expect(filtrarFilasPorBanda(filas, "")).toHaveLength(2);
    expect(coincideBusqueda("Alfa", "alf")).toBe(true);
  });
});
