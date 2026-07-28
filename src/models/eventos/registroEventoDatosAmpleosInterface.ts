import type { RegistroEventoInterface } from "./RegistroEventoInterface";
import type { federacionInterface } from "../federaciones/federacionInterface";
import type { regionesInterface } from "../regiones/regionesInterface";

export interface registroEventoDatosAmpleosInterface extends RegistroEventoInterface {
    regiones: regionesInterface;
    federaciones: federacionInterface;
}
