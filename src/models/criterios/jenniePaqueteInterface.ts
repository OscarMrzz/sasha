import type { jennieCriterioPaqueteInterface } from "./jennieCriterioPaqueteInterface";
import type { jennieRubricaPaqueteInterface } from "./jennieRubricaPaqueteInterface";

/** Raíz de un archivo de paquete Jennie */
export interface jenniePaqueteInterface {
  schemaVersion: number;
  id: string;
  guardadoEn: string;
  rubrica: jennieRubricaPaqueteInterface;
  criterios: jennieCriterioPaqueteInterface[];
}
