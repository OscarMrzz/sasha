import type { RegistroEventoInterface } from "@/interfaces/interfaces";

export function eventoPermiteEdicionCopas(
  estado: RegistroEventoInterface["estado_evento"] | string | null | undefined,
): boolean {
  return estado !== "finalizado" && estado !== "cancelado";
}

export const MENSAJE_COPAS_EVENTO_BLOQUEADO =
  "No se pueden modificar las copas: el evento está finalizado o cancelado.";
