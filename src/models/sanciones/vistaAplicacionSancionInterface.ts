export interface vistaAplicacionSancionInterface {
  // Datos del Registro e Historial
  id_registro_sanciones?: string | null;
  fecha_aplico_sancion?: string | Date | null;
  justificacion?: string | null;

  // Datos de la Sanción aplicada
  id_sancion?: string | null;
  detalles_sancion?: string | null;
  fecha_creacion_sancion?: string | Date | null;
  version?: string | null;
  puntos_sancion?: number | null;

  // Datos de la Banda implicada
  idBanda?: string | null;
  nombreBanda?: string | null;
  idCategoria?: string | null;
  nombreCategoria?: string | null;
  idRegion?: string | null;
  nombreRegion?: string | null;

  // Datos de la autoridad / Sancionador
  id_sancionador?: string | null;
  nombre_sancionador?: string | null;
  apellido_sancionador?: string | null;
}
