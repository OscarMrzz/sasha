/** Solo hora (HH:mm) para filas compactas; acepta ISO o timestamp sin zona. */
export function formatCheckoutSoloHora(
  value?: string | Date | null,
): string {
  if (value == null || value === "") return "—";
  const s = String(value).trim();
  const conT = s.includes("T") ? s.split("T")[1] : s.includes(" ") ? s.split(" ")[1] : s;
  const partes = (conT ?? s).split(":");
  if (partes.length >= 2) {
    const hh = (partes[0] ?? "00").padStart(2, "0");
    const mm = (partes[1] ?? "00").padStart(2, "0");
    return `${hh}:${mm}`;
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  return "—";
}

export function formatCheckoutFechaHora(
  value?: string | Date | null,
): string {
  if (value == null || value === "") return "—";
  const s = String(value);
  if (s.includes("T")) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString("es-MX", {
        dateStyle: "short",
        timeStyle: "short",
      });
    }
  }
  return s.length > 16 ? s.slice(0, 16) : s;
}

export function normalizarFechaEvento(fecha: string | undefined): string {
  if (!fecha) return "";
  return fecha.split("T")[0];
}

export function fechaHoyISO(): string {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function horaActualISO(): string {
  return new Date().toISOString();
}

export function horaActualSolo(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
}

/** Hora local para `<input type="time" />` (HH:mm). */
export function horaActualParaInput(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

/** Combina la fecha de hoy con una hora HH:mm o HH:mm:ss. */
export function combinarFechaHoyConHora(hora: string): string {
  const partes = hora.trim().split(":");
  const hh = (partes[0] ?? "00").padStart(2, "0");
  const mm = (partes[1] ?? "00").padStart(2, "0");
  return `${fechaHoyISO()}T${hh}:${mm}`;
}

/** El dirigente confirmó la llegada (no denegó ni quedó pendiente). */
export function esLlegadaConfirmadaPorDirigente(
  confirmacion?: boolean | null,
): boolean {
  return confirmacion === true;
}

/** Aún no se envió el registro de ingreso a confirmación del dirigente. */
export function esPendienteRegistroIngreso(
  timeEnvioIngreso?: string | Date | null,
): boolean {
  if (timeEnvioIngreso == null) return true;
  const s = String(timeEnvioIngreso).trim();
  return s === "" || s === "null" || s === "undefined";
}

/** Ya se registró ingreso y se notificó al dirigente. */
export function yaSeEnvioConfirmacionIngreso(
  timeEnvioIngreso?: string | Date | null,
): boolean {
  return !esPendienteRegistroIngreso(timeEnvioIngreso);
}

/** Clave YYYY-MM para filtros por mes. */
export function mesAnioDesdeFecha(value?: string | Date | null): string | null {
  if (value == null || value === "") return null;
  const s = String(value).trim();
  const iso = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(iso);
  if (!Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  }
  const match = s.match(/^(\d{4})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}` : null;
}

export function obtenerMesAnioCheckout(
  createdAt?: string | Date | null,
  fechaEvento?: string | null,
): string | null {
  return mesAnioDesdeFecha(fechaEvento) ?? mesAnioDesdeFecha(createdAt);
}

export function etiquetaMesAnio(mesAnio: string): string {
  const [y, m] = mesAnio.split("-");
  const mes = Number(m);
  if (!y || !mes || mes < 1 || mes > 12) return mesAnio;
  const d = new Date(Number(y), mes - 1, 1);
  const nombre = d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

/** Solo nombre del mes (sin año), p. ej. "Mayo". Acepta YYYY-MM o MM. */
export function etiquetaMesSolo(mesAnio: string): string {
  const partes = mesAnio.split("-");
  const m = partes.length === 2 ? partes[1] : partes[0];
  const mes = Number(m);
  if (!mes || mes < 1 || mes > 12) return mesAnio;
  const d = new Date(2000, mes - 1, 1);
  const nombre = d.toLocaleDateString("es-MX", { month: "long" });
  return nombre.charAt(0).toUpperCase() + nombre.slice(1);
}

/** Meses 01–12 para filtros de calendario. */
export const MESES_CALENDARIO_NUMERO = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);

export type EstadoCheckoutConsulta =
  | "sin_llegada"
  | "pend_confirmacion_llegada"
  | "pend_ingreso"
  | "pend_confirmacion_ingreso"
  | "completo";

export function estadoCheckoutConsulta(registro: {
  time_envio_confirmacion_llegada?: string | Date | null;
  confirmacion_horallegada?: boolean | null;
  time_envio_confirmacion_ingreso?: string | Date | null;
  confirmacion_hora_ingreso?: boolean | null;
}): EstadoCheckoutConsulta {
  const tieneLlegada =
    registro.time_envio_confirmacion_llegada != null &&
    String(registro.time_envio_confirmacion_llegada).trim() !== "";
  if (!tieneLlegada) return "sin_llegada";
  if (registro.confirmacion_horallegada == null) return "pend_confirmacion_llegada";
  if (!yaSeEnvioConfirmacionIngreso(registro.time_envio_confirmacion_ingreso)) {
    return "pend_ingreso";
  }
  if (registro.confirmacion_hora_ingreso == null) return "pend_confirmacion_ingreso";
  if (
    registro.confirmacion_horallegada === true &&
    registro.confirmacion_hora_ingreso === true
  ) {
    return "completo";
  }
  return "pend_confirmacion_ingreso";
}

const ETIQUETAS_ESTADO_CHECKOUT: Record<EstadoCheckoutConsulta, string> = {
  sin_llegada: "Sin llegada",
  pend_confirmacion_llegada: "Pend. confirmación llegada",
  pend_ingreso: "Pend. ingreso",
  pend_confirmacion_ingreso: "Pend. confirmación ingreso",
  completo: "Completo",
};

const CLASES_ESTADO_CHECKOUT: Record<EstadoCheckoutConsulta, string> = {
  sin_llegada: "border-slate-500/40 bg-slate-500/20 text-slate-200",
  pend_confirmacion_llegada: "border-amber-500/40 bg-amber-500/20 text-amber-200",
  pend_ingreso: "border-sky-500/40 bg-sky-500/20 text-sky-200",
  pend_confirmacion_ingreso: "border-violet-500/40 bg-violet-500/20 text-violet-200",
  completo: "border-emerald-500/40 bg-emerald-500/20 text-emerald-200",
};

export function etiquetaEstadoCheckout(estado: EstadoCheckoutConsulta): string {
  return ETIQUETAS_ESTADO_CHECKOUT[estado];
}

export function clasesEstadoCheckout(estado: EstadoCheckoutConsulta): string {
  return CLASES_ESTADO_CHECKOUT[estado];
}
