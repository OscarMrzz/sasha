export function formatearFechaEvento(fechaEvento: string): string {
  const [y, m, d] = fechaEvento.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return fechaEvento;
  return new Date(y, m - 1, d).toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
