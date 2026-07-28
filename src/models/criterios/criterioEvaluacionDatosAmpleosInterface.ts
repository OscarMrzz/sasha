import type { criterioEvaluacionInterface } from "./criterioEvaluacionInterface";
import type { rubricaInterface } from "../rubricas/rubricaInterface";

export interface criterioEvaluacionDatosAmpleosInterface extends criterioEvaluacionInterface {
    rubricas: rubricaInterface;
}
