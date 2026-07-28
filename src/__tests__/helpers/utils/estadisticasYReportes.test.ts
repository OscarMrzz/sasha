import { describe, expect, it } from "vitest";
import {
  agruparPorRubrica,
  calcularEstrellasDesdePromedio,
  calcularMediana,
  calcularModa,
  calcularTasaExito,
  contarPorRank,
} from "@/helpers/utils/estadisticasHelpers";
import { calcularPuntosRubricasYTotal } from "@/helpers/utils/resultadosReporteHelpers";
import { rubricasDisponiblesParaJurado } from "@/helpers/utils/rubricasDisponibles";

describe("estadisticasHelpers", () => {
  it("calculates success rate and ranks", () => {
    expect(calcularTasaExito([])).toBe(0);
    expect(
      calcularTasaExito([{ rankin: 1 }, { rankin: 2 }, { rankin: 1 }] as never[])
    ).toBe(66.7);
    expect(contarPorRank([{ rankin: 1 }, { rankin: 1 }] as never[], 1)).toBe(2);
  });

  it("calculates mediana and moda", () => {
    expect(calcularMediana([])).toBe(0);
    expect(calcularMediana([1, 3, 2])).toBe(2);
    expect(calcularMediana([1, 2, 3, 4])).toBe(2.5);
    expect(calcularModa([1, 2, 2, 3])).toBe(2);
    expect(calcularModa([1, 1, 2, 2])).toBe(2);
  });

  it("maps promedio to stars", () => {
    expect(calcularEstrellasDesdePromedio(50).cantidad).toBe(0);
    expect(calcularEstrellasDesdePromedio(96).cantidad).toBe(5);
    expect(calcularEstrellasDesdePromedio(Number.NaN).cantidad).toBe(0);
  });

  it("groups by rubrica", () => {
    const stats = agruparPorRubrica(
      [
        {
          idForaneaRubrica: "r1",
          nombreRubrica: "Musica",
          puntosObtenidos: 10,
          idForaneaEvento: "e1",
        },
        {
          idForaneaRubrica: "r1",
          nombreRubrica: "Musica",
          puntosObtenidos: 20,
          idForaneaEvento: "e2",
        },
      ] as never[],
      { r1: 50 }
    );
    expect(stats[0].totalPuntos).toBe(30);
    expect(stats[0].eventosEvaluados).toBe(2);
    expect(stats[0].porcentaje).toBe(30);
  });
});

describe("resultadosReporteHelpers", () => {
  it("sums points per rubrica and total", () => {
    const { puntosRubricas, totalGeneral } = calcularPuntosRubricasYTotal(
      [{ idRubrica: "r1" }, { idRubrica: "r2" }] as never[],
      [
        { idForaneaRubrica: "r1", puntosObtenidos: 5 },
        { idForaneaRubrica: "r1", puntosObtenidos: 3 },
        { idForaneaRubrica: "x", puntosObtenidos: 2 },
      ] as never[]
    );
    expect(puntosRubricas.r1).toBe(8);
    expect(puntosRubricas.r2).toBe(0);
    expect(totalGeneral).toBe(10);
  });
});

describe("rubricasDisponiblesParaJurado", () => {
  it("excludes occupied rubricas except current registro", () => {
    const rubricas = [{ idRubrica: "a" }, { idRubrica: "b" }, { idRubrica: "c" }] as never[];
    const equipo = [
      {
        idRegistroEvaluador: "1",
        id_foranea_rubrica: "a",
        perfiles: { roles: { nombreRol: "jurado" } },
      },
      {
        idRegistroEvaluador: "2",
        id_foranea_rubrica: "b",
        perfiles: { roles: { nombreRol: "jurado" } },
      },
      {
        idRegistroEvaluador: "3",
        id_foranea_rubrica: "c",
        perfiles: { roles: { nombreRol: "fiscal" } },
      },
    ] as never[];
    expect(rubricasDisponiblesParaJurado(rubricas, equipo).map((r) => r.idRubrica)).toEqual([
      "c",
    ]);
    expect(
      rubricasDisponiblesParaJurado(rubricas, equipo, "1").map((r) => r.idRubrica)
    ).toEqual(["a", "c"]);
  });
});
