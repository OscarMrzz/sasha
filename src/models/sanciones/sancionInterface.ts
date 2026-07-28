export interface sancionInterface {
  id_sancion: string;
  created_at: string | Date;
  detalles_sancion: string;
  puntos_sancion: number;
  fecha_creacion_sancion?: string | Date | null;
  version?: string | null;
}
