export interface vistaResultadosPorEventoInterface {
  // Identificadores base y Evento
  idRegistroCumplimientoEvaluacion?: string | null;
  idEvento?: string | null;
  LugarEvento?: string | null;
  fechaEvento?: string | Date | null; // Mapeado de 'date'
  tipo_evento?: string | null;
  tipo_lugar?: string | null;

  // Banda y Clasificación
  idBanda?: string | null;
  nombreBanda?: string | null;
  idForaneaCategoria?: string | null;
  idForaneaRegion?: string | null;
  nombreCategoria?: string | null;
  nombreRegion?: string | null;

  // Rúbrica
  idRubrica?: string | null;
  nombreRubrica?: string | null;
  datalleRubrica?: string | null; // Ojo: mantiene el typo 'datalle' del JSON
  puntosRubrica?: number | null;

  // Criterio
  idCriterio?: string | null;
  nombreCriterio?: string | null;
  detallesCriterio?: string | null;
  puntosCriterio?: number | null;

  // Cumplimiento y Resultados
  idCumplimiento?: string | null;
  detalleCumplimiento?: string | null;
  puntosCumplimiento?: number | null;
  puntosObtenidos?: number | null;

  // Perfil / Evaluador
  idPerfil?: string | null;
  nombre?: string | null;
  primerApellido?: string | null;
}
