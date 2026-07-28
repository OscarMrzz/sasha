import type { federacionInterface } from "../federaciones/federacionInterface";
import type { regionesInterface } from "./regionesInterface";

export interface regionesDatosAmpleosInterface extends regionesInterface {
    federaciones: federacionInterface;
}
