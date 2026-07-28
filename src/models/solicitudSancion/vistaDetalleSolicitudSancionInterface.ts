export interface vistaDetalleSolicitudSancionInterface {
  id_solicitud_sancion?: string | null; // uuid
  created_at_solicitud_sancion?: Date | string | null; // timestamp with time zone
  justificacion?: string | null; // text
  estado?: boolean | null; // boolean
  id_sancion?: string | null; // uuid
  detalles_sancion?: string | null; // text
  puntos_sancion?: number | null; // numeric
  version?: string | null; // text
  fecha_creacion_sancion?: Date | string | null; // date
  idBanda?: string | null; // uuid
  nombreBanda?: string | null; // text
  idCategoria?: string | null; // uuid
  nombreCategoria?: string | null; // text
  idRegion?: string | null; // uuid
  nombreRegion?: string | null; // text
}
