export type EstadoSolicitudKey = "true" | "false" | "null";

export function getEstadoSolicitudKey(
  estado: boolean | null | undefined
): EstadoSolicitudKey {
  if (estado === true) return "true";
  if (estado === false) return "false";
  return "null";
}

export const ESTADO_SOLICITUD_PILL: Record<
  EstadoSolicitudKey,
  { txt: string; cls: string }
> = {
  true: {
    txt: "Aprobada",
    cls: "bg-emerald-600/20 text-emerald-300 border-emerald-500/40",
  },
  false: {
    txt: "Denegada",
    cls: "bg-red-600/20 text-red-300 border-red-500/40",
  },
  null: {
    txt: "Pendiente",
    cls: "bg-slate-500/20 text-slate-300 border-slate-400/40",
  },
};

export function getEstadoSolicitudPill(estado: boolean | null | undefined) {
  return ESTADO_SOLICITUD_PILL[getEstadoSolicitudKey(estado)];
}
