export interface registroSancionInterface {
  id_registro_sanciones: string;
  created_at: string | Date;
  id_foranea_sancion?: string | null;
  id_foranea_banda?: string | null;
  id_foranea_perfil?: string | null;
  fecha?: string | Date | null;
  justificacion?: string | null;
}
