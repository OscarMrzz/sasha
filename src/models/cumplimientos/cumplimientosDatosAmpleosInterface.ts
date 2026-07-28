import type { cumplimientosInterface } from "./cumplimientosInterface";

export interface cumplimientosDatosAmpleosInterface extends cumplimientosInterface {
 idCumplimiento: string;
  created_at: string;
  detalleCumplimiento: string;
  puntosCumplimiento: number;
  idForaneaCriterio: string;
  idCriterio: string;
  nombreCriterio: string;
  detallesCriterio: string;
  puntosCriterio: number;
  idForaneaRubrica: string;
  idForaneaFederacion: string;
}
