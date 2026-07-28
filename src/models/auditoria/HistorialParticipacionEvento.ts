import type { ParticipacionBandaVista } from "./ParticipacionBandaVista";

export interface HistorialParticipacionEvento {
  idEvento: string;
  lugarEvento: string;
  fechaEvento: string;
  participaciones: ParticipacionBandaVista[];
}
