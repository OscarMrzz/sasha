export interface confirmacionAsistenciaInterface {
  id_confirmacion_asistencia: string;
  created_at: string;
  id_foranea_evento: string;
  id_foranea_banda: string;
  estado_asistencia: boolean;

  estado_cancha: "pendiente" | "ya_en_cancha" | "finalizado";
}
