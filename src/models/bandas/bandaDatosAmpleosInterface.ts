import type { bandaInterface } from "./bandaInterface";
import type { categoriaInterface } from "../categorias/categoriaInterface";
import type { federacionInterface } from "../federaciones/federacionInterface";
import type { regionesInterface } from "../regiones/regionesInterface";

export interface bandaDatosAmpleosInterface extends bandaInterface{
    federaciones: federacionInterface;
    categorias: categoriaInterface;
    regiones: regionesInterface;
}
