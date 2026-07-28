import type { categoriaInterface } from "../categorias/categoriaInterface";
import type { federacionInterface } from "../federaciones/federacionInterface";
import type { penalizacionesInterface } from "./penalizacionesInterface";

export interface penalizacionesDatosAmpleosInterface extends penalizacionesInterface {
    federaciones: federacionInterface;
    categorias: categoriaInterface;
}
