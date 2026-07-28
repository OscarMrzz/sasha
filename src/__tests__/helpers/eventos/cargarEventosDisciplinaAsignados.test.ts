import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/diciplina/checkoutUtils", () => ({
  normalizarFechaEvento: (f: string) => String(f).slice(0, 10),
}));

vi.mock("@/services/perfilesServices", () => ({
  default: class {
    getUsuarioLogiado = vi.fn(async () => ({
      idPerfil: "p1",
      roles: { nombreRol: "comite de disciplina" },
    }));
  },
}));

vi.mock("@/services/registroEquipoEvaluadorServices", () => ({
  default: class {
    getporPerfil = vi.fn(async () => [
      {
        idForaneaEvento: "e1",
        perfiles: { roles: { nombreRol: "comite de disciplina" } },
      },
      {
        idForaneaEvento: "e2",
        perfiles: { roles: { nombreRol: "jurado" } },
      },
    ]);
  },
}));

vi.mock("@/services/registroEventosServices", () => ({
  default: class {
    perfil = { idPerfil: "p1", roles: { nombreRol: "comite de disciplina" } };
    initPerfil = vi.fn(async () => undefined);
    getDatosAmpleos = vi.fn(async () => [
      { idEvento: "e1", fechaEvento: "2024-02-01" },
      { idEvento: "e2", fechaEvento: "2024-01-01" },
    ]);
  },
}));

import { cargarEventosDisciplinaAsignados } from "@/helpers/eventos/cargarEventosDisciplinaAsignados";

describe("cargarEventosDisciplinaAsignados", () => {
  it("keeps all assignments when logged-in role is comite de disciplina", async () => {
    const out = await cargarEventosDisciplinaAsignados();
    // rol activo = comite → toda asignación del perfil cuenta
    expect(out.map((e) => e.idEvento)).toEqual(["e1", "e2"]);
  });
});
