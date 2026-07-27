const ORDINALES = [
  "Primer",
  "Segundo",
  "Tercer",
  "Cuarto",
  "Quinto",
  "Sexto",
  "Séptimo",
  "Octavo",
  "Noveno",
  "Décimo",
] as const;

export function etiquetaLugarSolicitudCopa(lugar?: number | null): string {
  if (lugar == null || lugar < 1 || lugar > 10) return "—";
  return `${ORDINALES[lugar - 1]} lugar`;
}

export const OPCIONES_LUGAR_SOLICITUD_COPA = Array.from({ length: 10 }, (_, i) => {
  const valor = i + 1;
  return { valor, etiqueta: etiquetaLugarSolicitudCopa(valor) };
});

export function etiquetaTipoSolicitudCopa(tipo?: string | null): string {
  if (tipo === "directo") return "Directo";
  if (tipo === "desempate") return "Desempate";
  return tipo?.trim() ? tipo : "—";
}
