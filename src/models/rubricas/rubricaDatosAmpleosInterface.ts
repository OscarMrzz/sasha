import type { categoriaInterface } from "../categorias/categoriaInterface";
import type { federacionInterface } from "../federaciones/federacionInterface";
import type { rubricaInterface } from "./rubricaInterface";

export interface rubricaDatosAmpleosInterface extends rubricaInterface {
    categorias: categoriaInterface;
    federaciones: federacionInterface;
}
