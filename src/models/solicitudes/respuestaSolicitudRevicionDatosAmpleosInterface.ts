import type { federacionInterface } from "../federaciones/federacionInterface";
import type { perfilInterface } from "../perfiles/perfilInterface";
import type { respuestaSolicitudRevicionInterface } from "./respuestaSolicitudRevicionInterface";
import type { solicitudRevicionInterface } from "./solicitudRevicionInterface";

export interface respuestaSolicitudRevicionDatosAmpleosInterface extends respuestaSolicitudRevicionInterface {
  federaciones: federacionInterface;
  solicitudReviciones: solicitudRevicionInterface;
  perfiles: perfilInterface;
}
