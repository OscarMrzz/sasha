export interface solicitudCopaInterface {
  id_solicitud_copa: string; // uuid
  created_at_solicitud_copa: Date | string; // timestamp with time zone
  id_foranea_evento: string; // uuid
  id_foranea_banda: string; // uuid
  id_foranea_solicitante: string; // uuid
  tipo_solicitud_copa: string; // text
  justificacion_solicitud_copa: string; // text
  estado?: boolean | null; // boolean (permitido nulo u opcional)
  lugar_solicitud_copas: number; // numeric
}
