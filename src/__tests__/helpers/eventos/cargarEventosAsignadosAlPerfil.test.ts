import { describe, expect, it, vi } from "vitest";

const initPerfilEventos = vi.fn(async () => undefined);
const getDatosAmpleos = vi.fn(async () => [
  { idEvento: "e1" },
  { idEvento: "e2" },
]);
const initPerfilEquipo = vi.fn(async () => undefined);
const getporPerfil = vi.fn(async () => [{ idForaneaEvento: "e1" }]);

vi.mock("@/services/registroEventosServices", () => ({
  default: class {
    perfil = { idPerfil: "p1" };
    initPerfil = initPerfilEventos;
    getDatosAmpleos = getDatosAmpleos;
  },
}));

vi.mock("@/services/registroEquipoEvaluadorServices", () => ({
  default: class {
    initPerfil = initPerfilEquipo;
    getporPerfil = getporPerfil;
  },
}));

import {
  cargarEventosAsignadosAlPerfil,
  obtenerIdPerfilActivo,
} from "@/helpers/eventos/cargarEventosAsignadosAlPerfil";

describe("cargarEventosAsignadosAlPerfil", () => {
  it("filters eventos by assignments", async () => {
    const out = await cargarEventosAsignadosAlPerfil();
    expect(out).toEqual([{ idEvento: "e1" }]);
    expect(await obtenerIdPerfilActivo()).toBe("p1");
  });
});
