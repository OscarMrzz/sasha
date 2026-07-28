export interface PremioEscuadraInterface {
  id_premio_escuadra: string;    // uuid, non-nullable
  created_at: string | Date;     // timestamp with time zone
  id_foranea_banda: string ;    // uuid, nullable
  id_foranea_escuadra: string ; // uuid, 
  id_foranea_evento: string ;   // uuid, 
}
