import type { ParticipacionEstado } from "./ParticipacionEstado";

export interface ParticipacionBandaVista {
  idEvento: string;
  lugarEvento: string;
  idBanda: string;
  nombreBanda: string;
  estado: ParticipacionEstado;
  horaInicio: string | null;
  horaFin: string | null;
  /** Duración en milisegundos; null si aún no finalizó. */
  duracionMs: number | null;
  duracionTexto: string | null;
}
