import type { RegistroEventoInterface } from "../eventos/RegistroEventoInterface";
import type { bandaInterface } from "../bandas/bandaInterface";
import type { categoriaInterface } from "../categorias/categoriaInterface";
import type { criterioEvaluacionInterface } from "../criterios/criterioEvaluacionInterface";
import type { cumplimientosInterface } from "./cumplimientosInterface";
import type { federacionInterface } from "../federaciones/federacionInterface";
import type { perfilInterface } from "../perfiles/perfilInterface";
import type { regionesInterface } from "../regiones/regionesInterface";
import type { registroCumplimientoEvaluacionInterface } from "./registroCumplimientoEvaluacionInterface";
import type { rubricaInterface } from "../rubricas/rubricaInterface";

export interface registroCumplimientoEvaluacionDatosAmpleosInterface extends registroCumplimientoEvaluacionInterface {
    registroEventos: RegistroEventoInterface; // Corregido: nombre de tabla
    bandas: bandaInterface;
    criteriosEvalucion: criterioEvaluacionInterface; // Corregido: nombre de tabla
    cumplimientos: cumplimientosInterface;
    categorias: categoriaInterface;
    regiones: regionesInterface;
    perfiles: perfilInterface;
    federaciones: federacionInterface;
    rubricas: rubricaInterface;
}
