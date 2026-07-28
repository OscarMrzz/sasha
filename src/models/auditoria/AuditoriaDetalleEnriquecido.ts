import type { AuditoriaRow } from "./AuditoriaRow";
import type { MetadataCampoVisible } from "./MetadataCampoVisible";

export interface AuditoriaDetalleEnriquecido {
  row: AuditoriaRow;
  nombreUsuario: string;
  preview: string;
  campos: MetadataCampoVisible[];
}
