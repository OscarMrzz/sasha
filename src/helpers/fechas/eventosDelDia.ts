import { fechaHoyLocalISO } from "@/hooks/dashboard/useDashboardData";
import { RegistroEventoInterface } from "@/models";

export function esEventoDelDia(fechaEvento: string): boolean {
  return fechaEvento.slice(0, 10) === fechaHoyLocalISO();
}

export function filtrarEventosDelDia<T extends RegistroEventoInterface>(
  eventos: T[],
): T[] {
  return eventos.filter((evento) => esEventoDelDia(evento.fechaEvento));
}
