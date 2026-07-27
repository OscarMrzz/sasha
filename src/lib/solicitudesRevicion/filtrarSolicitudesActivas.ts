import { RegistroEventoInterface, vistaSolicitudRevicionInterface } from "@/interfaces/interfaces";

export function mapaEstadoEventos(
  eventos: Pick<RegistroEventoInterface, "idEvento" | "estado_evento">[],
): Map<string, string> {
  return new Map(eventos.map((e) => [e.idEvento, e.estado_evento ?? ""]));
}

/** Solicitudes que aún requieren atención: pendientes y con evento no finalizado. */
export function filtrarSolicitudesRevisionActivas(
  solicitudes: vistaSolicitudRevicionInterface[],
  estadoEventoPorId: Map<string, string>,
): vistaSolicitudRevicionInterface[] {
  return solicitudes.filter((s) => {
    if (s.estado !== "pendiente") return false;
    const estadoEv = estadoEventoPorId.get(s.idForaneaEvento);
    if (estadoEv === "finalizado") return false;
    return true;
  });
}

/** Oculta solicitudes de eventos ya finalizados (aunque sigan en pendiente). */
export function excluirSolicitudesDeEventosFinalizados(
  solicitudes: vistaSolicitudRevicionInterface[],
  estadoEventoPorId: Map<string, string>,
): vistaSolicitudRevicionInterface[] {
  return solicitudes.filter((s) => estadoEventoPorId.get(s.idForaneaEvento) !== "finalizado");
}
