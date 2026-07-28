import type { confirmacionAsistenciaInterface } from "./confirmacionAsistenciaInterface";

/** Fila de lista de asistencia: confirmación + datos de banda para UI de solo lectura */
export interface confirmacionConBandaInterface extends confirmacionAsistenciaInterface {
  nombreBanda: string;
  AliasBanda: string | null;
  urlLogoBanda: string | null;
  idForaneaCategoria: string;
  nombreCategoria: string;
}
