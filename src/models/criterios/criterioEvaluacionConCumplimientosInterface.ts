import type { criterioEvaluacionInterface } from "./criterioEvaluacionInterface";
import type { cumplimientosInterface } from "../cumplimientos/cumplimientosInterface";

export interface criterioEvaluacionConCumplimientosInterface
  extends criterioEvaluacionInterface {
  cumplimientos: cumplimientosInterface[] | null;
}
