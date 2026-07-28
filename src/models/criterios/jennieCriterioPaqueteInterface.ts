import type { jennieCumplimientoPaqueteInterface } from "./jennieCumplimientoPaqueteInterface";

/** Criterio con cumplimientos anidados en un paquete Jennie */
export interface jennieCriterioPaqueteInterface {
  idCriterio: string;
  created_at: string;
  nombreCriterio: string;
  detallesCriterio: string;
  puntosCriterio: number;
  idForaneaRubrica: string;
  cumplimientos: jennieCumplimientoPaqueteInterface[];
}
