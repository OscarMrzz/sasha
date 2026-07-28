import type { categoriaInterface } from "./categoriaInterface";
import type { federacionInterface } from "../federaciones/federacionInterface";

export interface categoriaDatosAmpleosInterface extends categoriaInterface {
    federaciones: federacionInterface;
}
