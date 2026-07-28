export function normalizarTextoBusqueda(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function coincideBusqueda(texto: string | undefined | null, consulta: string): boolean {
  if (!consulta.trim()) return true;
  if (!texto) return false;
  return normalizarTextoBusqueda(texto).includes(normalizarTextoBusqueda(consulta));
}
