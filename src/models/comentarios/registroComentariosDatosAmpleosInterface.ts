import type { RegistroEventoInterface } from "../eventos/RegistroEventoInterface";
import type { bandaInterface } from "../bandas/bandaInterface";
import type { categoriaInterface } from "../categorias/categoriaInterface";
import type { criterioEvaluacionInterface } from "../criterios/criterioEvaluacionInterface";
import type { federacionInterface } from "../federaciones/federacionInterface";
import type { perfilInterface } from "../perfiles/perfilInterface";
import type { regionesInterface } from "../regiones/regionesInterface";
import type { registroComentariosInterface } from "./registroComentariosInterface";
import type { rubricaInterface } from "../rubricas/rubricaInterface";

export interface registroComentariosDatosAmpleosInterface extends registroComentariosInterface {
    registroEventos: RegistroEventoInterface; // Corregido: nombre de tabla
    bandas: bandaInterface;
    criteriosEvalucion: criterioEvaluacionInterface; // Corregido: nombre de tabla
    categorias: categoriaInterface;
    regiones: regionesInterface;
    perfiles: perfilInterface;
    rubricas: rubricaInterface;
    federaciones: federacionInterface;
}
