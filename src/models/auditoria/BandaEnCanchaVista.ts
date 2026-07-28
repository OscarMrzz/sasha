export interface BandaEnCanchaVista {
  idEvento: string;
  lugarEvento: string;
  idBanda: string;
  nombreBanda: string;
  idConfirmacion: string;
  quienPusoNombre: string;
  horaPuesta: string | null;
  accionOrigen: "cancha_entrar" | "cancha_reponer" | null;
}
