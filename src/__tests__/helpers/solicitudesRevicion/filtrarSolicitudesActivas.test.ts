import { describe, expect, it } from "vitest";
import {
  excluirSolicitudesDeEventosFinalizados,
  filtrarSolicitudesRevisionActivas,
  mapaEstadoEventos,
} from "@/helpers/solicitudesRevicion/filtrarSolicitudesActivas";

describe("filtrarSolicitudesActivas", () => {
  const mapa = mapaEstadoEventos([
    { idEvento: "e1", estado_evento: "en_curso" },
    { idEvento: "e2", estado_evento: "finalizado" },
    { idEvento: "e3", estado_evento: null },
  ] as never[]);

  it("builds estado map with empty string for null", () => {
    expect(mapa.get("e3")).toBe("");
  });

  it("keeps only pendiente and non-finalizado", () => {
    const solicitudes = [
      { estado: "pendiente", idForaneaEvento: "e1" },
      { estado: "resuelta", idForaneaEvento: "e1" },
      { estado: "pendiente", idForaneaEvento: "e2" },
      { estado: "pendiente", idForaneaEvento: "missing" },
    ] as never[];
    expect(filtrarSolicitudesRevisionActivas(solicitudes, mapa)).toHaveLength(2);
  });

  it("excludes finalizados regardless of estado", () => {
    const solicitudes = [
      { estado: "pendiente", idForaneaEvento: "e2" },
      { estado: "pendiente", idForaneaEvento: "e1" },
    ] as never[];
    expect(excluirSolicitudesDeEventosFinalizados(solicitudes, mapa)).toHaveLength(1);
  });
});
