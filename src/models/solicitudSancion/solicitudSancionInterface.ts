export interface solicitudSancionInterface {
  id_solicitud_sancion: string; // uuid
  created_at_solicitud_sancion: Date | string; // timestamp with time zone
  id_fonranea_sancion: string; // uuid (ojo: notar el pequeño typo 'fonranea' del origen)
  id_foranea_banda: string; // uuid
  id_foranea_solicitante: string; // uuid
  justificacion: string; // text
  estado: boolean | null; // boolean
}
