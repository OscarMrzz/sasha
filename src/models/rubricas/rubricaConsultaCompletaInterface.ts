import type { criterioEvaluacionConCumplimientosInterface } from "../criterios/criterioEvaluacionConCumplimientosInterface";
import type { rubricaDatosAmpleosInterface } from "./rubricaDatosAmpleosInterface";

export interface rubricaConsultaCompletaInterface
  extends rubricaDatosAmpleosInterface {
  criteriosEvalucion: criterioEvaluacionConCumplimientosInterface[] | null;
}
