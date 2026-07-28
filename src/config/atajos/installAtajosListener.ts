import { ATAJOS } from "./config";
import {
  ejecutarAccionPagina,
  tieneAccionPagina,
} from "./accionesRegistry";
import { debeIgnorarAtajo } from "./matchShortcut";

let instalado = false;

/** Ctrl+P / Cmd+P — detección explícita (el navegador reserva esta combinación). */
export function esAtajoAgregar(event: KeyboardEvent): boolean {
  if (!event.ctrlKey && !event.metaKey) return false;
  if (event.altKey) return false;
  return (
    event.code === "KeyP" ||
    event.key === "p" ||
    event.key === "P" ||
    event.keyCode === 80
  );
}

function manejarAgregar(event: KeyboardEvent): void {
  if (!ATAJOS.agregar.activado || !esAtajoAgregar(event)) return;
  if (!tieneAccionPagina("agregar")) return;
  if (debeIgnorarAtajo(event)) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  ejecutarAccionPagina("agregar");
}

/**
 * Listener en document (capture) instalado una sola vez.
 * Debe cargarse en el cliente antes de usar atajos de página.
 */
export function instalarListenerAtajoAgregar(): void {
  if (instalado || typeof document === "undefined") return;
  instalado = true;

  document.addEventListener("keydown", manejarAgregar, { capture: true });
}

// Auto-instalar al importar en el bundle del cliente
instalarListenerAtajoAgregar();
