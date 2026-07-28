import type { bandaInterface } from "../bandas/bandaInterface";
import type { federacionInterface } from "../federaciones/federacionInterface";
import type { perfilInterface } from "./perfilInterface";
import type { rolInterface } from "../roles/rolInterface";

export interface perfilDatosAmpleosInterface extends perfilInterface {
    federaciones: federacionInterface;
    bandas: bandaInterface | null;
    roles: rolInterface | null;
  
}
