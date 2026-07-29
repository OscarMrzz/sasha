import { describe, expect, it } from "vitest";
import {
  camelToSnakeKey,
  fromDb,
  fromDbMany,
  snakeToCamelKey,
  toDb,
} from "@/services/mappers/caseMapper";

describe("caseMapper", () => {
  it("converts camelCase keys to snake_case", () => {
    expect(camelToSnakeKey("idForaneaFederacion")).toBe("id_foranea_federacion");
    expect(camelToSnakeKey("nombreBanda")).toBe("nombre_banda");
  });

  it("converts snake_case keys to camelCase", () => {
    expect(snakeToCamelKey("id_foranea_federacion")).toBe("idForaneaFederacion");
    expect(snakeToCamelKey("nombre_banda")).toBe("nombreBanda");
  });

  it("preserves historical exceptions", () => {
    expect(camelToSnakeKey("AliasBanda")).toBe("alias_banda");
    expect(camelToSnakeKey("LugarEvento")).toBe("lugar_evento");
    expect(camelToSnakeKey("DetallesRol")).toBe("detalles_rol");
    expect(snakeToCamelKey("alias_banda")).toBe("AliasBanda");
    expect(snakeToCamelKey("lugar_evento")).toBe("LugarEvento");
    expect(snakeToCamelKey("detalles_rol")).toBe("DetallesRol");
    expect(snakeToCamelKey("estado_evento")).toBe("estado_evento");
    expect(snakeToCamelKey("id_foranea_rubrica")).toBe("idForaneaRubrica");
    expect(fromDb({ estado_evento: "iniciado", id_foranea_rubrica: "rub-1" })).toEqual({
      estado_evento: "iniciado",
      idForaneaRubrica: "rub-1",
    });
  });

  it("toDb skips undefined and maps nested objects/arrays", () => {
    const date = new Date("2024-01-01T00:00:00Z");
    expect(
      toDb({
        idCategoria: "c1",
        nombre: "A",
        skipMe: undefined,
        nested: { idForaneaFederacion: "f1" },
        items: [{ AliasBanda: "x" }, "plain"],
        createdAt: date,
        nulo: null,
      })
    ).toEqual({
      id_categoria: "c1",
      nombre: "A",
      nested: { id_foranea_federacion: "f1" },
      items: [{ alias_banda: "x" }, "plain"],
      created_at: date,
      nulo: null,
    });
  });

  it("fromDb and fromDbMany map rows to camelCase", () => {
    const row = {
      id_categoria: "c1",
      alias_banda: "AB",
      nested: { id_foranea_federacion: "f1" },
    };
    expect(fromDb(row)).toEqual({
      idCategoria: "c1",
      AliasBanda: "AB",
      nested: { idForaneaFederacion: "f1" },
    });
    expect(fromDbMany([row])).toHaveLength(1);
  });
});
