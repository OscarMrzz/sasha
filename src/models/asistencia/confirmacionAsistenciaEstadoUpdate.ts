import type { confirmacionAsistenciaInterface } from "./confirmacionAsistenciaInterface";

/** Solo se actualiza el estado de asistencia. */
export type confirmacionAsistenciaEstadoUpdate = Pick<
  confirmacionAsistenciaInterface,
  "estado_asistencia"
>;
