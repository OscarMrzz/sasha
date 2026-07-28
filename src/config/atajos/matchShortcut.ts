import type { AtajoBinding } from "./config";

const CAMPOS_EDITABLES = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function esCampoEditable(event: KeyboardEvent): boolean {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return false;

  // Buscador de filas del CRUD: no bloquear atajos globales (Ctrl+B, Ctrl+P)
  if (target instanceof HTMLInputElement && target.id === "buscador") return false;

  if (CAMPOS_EDITABLES.has(target.tagName)) return true;
  return target.isContentEditable;
}

function hayDialogoAbierto(): boolean {
  return document.querySelector("dialog[open]") !== null;
}

export function debeIgnorarAtajo(event: KeyboardEvent): boolean {
  if (esCampoEditable(event)) return true;
  if (hayDialogoAbierto()) return true;
  return false;
}

function coincideModificadores(event: KeyboardEvent, binding: AtajoBinding): boolean {
  if (Boolean(binding.ctrl) !== event.ctrlKey) return false;
  if (Boolean(binding.shift) !== event.shiftKey) return false;
  if (Boolean(binding.alt) !== event.altKey) return false;
  return true;
}

function coincideTecla(event: KeyboardEvent, binding: AtajoBinding): boolean {
  const bindingKey = binding.key.toLowerCase();
  const key = event.key.toLowerCase();

  if (key === bindingKey) return true;

  // Fallback por tecla física (KeyP, KeyB) por si el layout cambia event.key
  if (/^[a-z]$/i.test(binding.key)) {
    return event.code === `Key${binding.key.toUpperCase()}`;
  }

  return false;
}

export function matchShortcut(event: KeyboardEvent, binding: AtajoBinding): boolean {
  if (!binding.activado) return false;
  if (!coincideModificadores(event, binding)) return false;
  return coincideTecla(event, binding);
}
