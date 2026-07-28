export interface vistaResultadosTenporadaInterface {
  idBanda: string;
  nombreBanda: string;
  idCategoria: string;
  nombreCategoria: string;
  rankin: number;
  promedio: number;
  /** Suma de puntos en eventos regional/nacional del año (sin sanciones). */
  total_antes_sanciones: number;
  /** Puntos restados por sanciones aplicadas en el año. */
  sanciones: number;
  /** Puntos netos de temporada; el ranking usa este valor. */
  total_despues_sanciones: number;
}
