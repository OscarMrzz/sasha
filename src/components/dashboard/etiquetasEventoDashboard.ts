import { registroEventoDatosAmpleosInterface } from "@/models";

/** Etiquetas “Hoy”, “En curso”, “Finalizado” para bandas confirmadas del dashboard */
export function etiquetasEventoDashboard(
  ev: registroEventoDatosAmpleosInterface,
  fechaHoyISO: string,
): string[] {
  const t: string[] = [];
  if (ev.fechaEvento === fechaHoyISO) t.push("Hoy");
  if (ev.estado_evento === "iniciado") t.push("En curso");
  if (ev.estado_evento === "finalizado") t.push("Finalizado");
  return t;
}
