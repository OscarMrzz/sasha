import type { RegistroEventoInterface } from "../eventos/RegistroEventoInterface";
import type { bandaInterface } from "../bandas/bandaInterface";
import type { categoriaInterface } from "../categorias/categoriaInterface";
import type { federacionInterface } from "../federaciones/federacionInterface";
import type { penalizacionesInterface } from "./penalizacionesInterface";
import type { registroPenalizacionInterface } from "./registroPenalizacionInterface";

export interface registroPenalizacionDatosAmpleosInterface extends registroPenalizacionInterface {
    federaciones: federacionInterface;
    registroEventos: RegistroEventoInterface; // Corregido: nombre de tabla
    categorias: categoriaInterface;
    bandas: bandaInterface;
    penalizaciones: penalizacionesInterface;
}
