import type { AuditoriaAccion } from "./AuditoriaAccion";
import type { AuditoriaMetadata } from "./AuditoriaMetadata";

export interface AuditoriaRow {
  id_auditoria: string;
  fecha: string;
  id_foranea_user: string | null;
  accion: AuditoriaAccion;
  tabla: string;
  id_registro: string | null;
  metadata: AuditoriaMetadata;
}
