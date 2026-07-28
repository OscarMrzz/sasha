import type { RegistroEventoInterface } from "../eventos/RegistroEventoInterface";
import type { bandaInterface } from "../bandas/bandaInterface";
import type { categoriaInterface } from "../categorias/categoriaInterface";
import type { federacionInterface } from "../federaciones/federacionInterface";
import type { regionesInterface } from "../regiones/regionesInterface";
import type { resultadosEventoInterface } from "./resultadosEventoInterface";

export interface resultadosEventoDatosAmpleosInterface extends resultadosEventoInterface {
  registroEventos: RegistroEventoInterface;
  regiones: regionesInterface;
  bandas: bandaInterface;
  federaciones: federacionInterface;
  categorias: categoriaInterface;
}
