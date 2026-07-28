import type { federacionInterface } from "../federaciones/federacionInterface";
import type { rolEquipoEvaluadorInterface } from "./rolEquipoEvaluadorInterface";

export interface rolEquipoEvaluadorDatosAmpleosInterface extends rolEquipoEvaluadorInterface {
    federaciones: federacionInterface;
}
