import type { AccionPaginaId } from "./config";

const acciones = new Map<AccionPaginaId, () => void>();

export function registrarAccionPagina(accion: AccionPaginaId, handler: () => void): void {
  acciones.set(accion, handler);
}

export function desregistrarAccionPagina(accion: AccionPaginaId): void {
  acciones.delete(accion);
}

export function tieneAccionPagina(accion: AccionPaginaId): boolean {
  return acciones.has(accion);
}

export function ejecutarAccionPagina(accion: AccionPaginaId): void {
  acciones.get(accion)?.();
}
