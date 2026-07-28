import type { confirmacionAsistenciaInterface } from "./confirmacionAsistenciaInterface";

/** Payload para insertar; el resto del registro lo genera la base de datos. */
export type confirmacionAsistenciaInsert = Pick<
  confirmacionAsistenciaInterface,
  "id_foranea_banda" | "id_foranea_evento" | "estado_asistencia"
>;
