import type { detalleSolicitudCopaInterface } from "@/interfaces/interfaces";
import { fechaHoyLocalISO } from "@/hooks/dashboard/useDashboardData";

function fechaEventoISO(fecha?: Date | string | null): string {
  if (!fecha) return "";
  return String(fecha).slice(0, 10);
}

export function filtrarSolicitudesCopaActivas(
  solicitudes: detalleSolicitudCopaInterface[],
  hoy: string = fechaHoyLocalISO(),
  idsEventosPermitidos?: Set<string> | string[]
): detalleSolicitudCopaInterface[] {
  const permitidos =
    idsEventosPermitidos instanceof Set
      ? idsEventosPermitidos
      : idsEventosPermitidos
        ? new Set(idsEventosPermitidos)
        : null;

  return solicitudes.filter((s) => {
    if (s.estado !== null && s.estado !== undefined) return false;
    if (fechaEventoISO(s.fechaEvento) !== hoy) return false;
    if (s.estado_evento === "finalizado") return false;
    if (permitidos && s.idEvento && !permitidos.has(s.idEvento)) return false;
    return true;
  });
}
