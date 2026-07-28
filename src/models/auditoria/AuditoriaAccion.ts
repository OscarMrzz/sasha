/** Tipos para la bitácora de auditoría (solo lectura, rol developer). */

export type AuditoriaAccion =
  | "insert"
  | "update"
  | "delete"
  | "cancha_entrar"
  | "cancha_finalizar"
  | "cancha_reponer"
  | "cancha_cambio"
  | "acceso_bloquear"
  | "acceso_desbloquear"
  | (string & {});
