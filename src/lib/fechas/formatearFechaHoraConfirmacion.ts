/** Fecha y hora de confirmación de asistencia (ISO desde Supabase) */
export function formatearFechaHoraConfirmacion(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
