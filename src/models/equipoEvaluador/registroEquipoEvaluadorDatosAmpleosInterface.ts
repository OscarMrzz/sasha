import type { RegistroEventoInterface } from "../eventos/RegistroEventoInterface";
import type { perfilDatosAmpleosInterface } from "../perfiles/perfilDatosAmpleosInterface";
import type { registroEquipoEvaluadorInterface } from "./registroEquipoEvaluadorInterface";

export interface registroEquipoEvaluadorDatosAmpleosInterface extends registroEquipoEvaluadorInterface {

    registroEventos: RegistroEventoInterface;
    perfiles: perfilDatosAmpleosInterface;

}
