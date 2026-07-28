export interface AtajoBinding {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  key: string;
  activado: boolean;
}

export const ATAJOS = {
  buscador: { ctrl: true, key: "b", activado: true },
  agregar: { ctrl: true, key: "p", activado: true },
} as const satisfies Record<string, AtajoBinding>;

export type AtajoId = keyof typeof ATAJOS;

export type AccionPaginaId = "agregar";
