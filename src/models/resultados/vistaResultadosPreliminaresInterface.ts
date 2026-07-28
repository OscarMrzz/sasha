/** Filas de `vista_resultados_preliminares`.
 *  Una fila por banda por evento+categoría, con total acumulado y ranking calculado en la vista. */
export interface vistaResultadosPreliminaresInterface {
  /** UUID de la federación — usar para filtrar en queries. */
  idForaneaFederacion: string;
  /** UUID del evento. */
  idEvento: string;
  LugarEvento: string;
  /** Formato 'YYYY-MM-DD'. */
  fechaEvento: string;
  anioEvento: number;
  /** UUID de la región del evento. */
  idForaneaRegion: string;
  nombreRegion: string;
  /** UUID de la banda. */
  idForaneaBanda: string;
  nombreBanda: string;
  /** UUID de la categoría (proviene de registroCumplimientoEvaluaciones). */
  idForaneaCategoria: string;
  nombreCategoria: string;
  /** Suma de puntosObtenidos de todos los registros de la banda en el evento+categoría. */
  total: number;
  /** Posición dentro del evento+categoría+federación (DENSE_RANK, 1 = mejor). */
  rankin: number;
}
