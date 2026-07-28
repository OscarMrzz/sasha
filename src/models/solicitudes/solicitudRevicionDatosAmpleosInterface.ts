import type { federacionInterface } from "../federaciones/federacionInterface";
import type { perfilInterface } from "../perfiles/perfilInterface";
import type { registroCumplimientoEvaluacionInterface } from "../cumplimientos/registroCumplimientoEvaluacionInterface";
import type { solicitudRevicionInterface } from "./solicitudRevicionInterface";

export interface solicitudRevicionDatosAmpleosInterface extends solicitudRevicionInterface {
  registroCumplimientos: registroCumplimientoEvaluacionInterface;
  federaciones: federacionInterface;
  perfiles: perfilInterface;
  
}
