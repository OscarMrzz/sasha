import type {
  resultadosEventoInterface,
  vistaResultadosModel,
} from "@/models";

/** Agregado por rúbrica: % = puntos obtenidos / tope posible en los eventos evaluados */
export interface RubricaStats {
  idForaneaRubrica: string;
  nombreRubrica: string;
  /** Suma de puntos obtenidos en todas las evaluaciones de esa rúbrica (todos los eventos) */
  totalPuntos: number;
  /** Tope teórico: puntos máximos de la rúbrica por evento × nº de eventos con evaluación */
  maxPosible: number;
  /** Eventos distintos donde hay al menos una evaluación de esta rúbrica */
  eventosEvaluados: number;
  /** Valor `puntosRubrica` de la rúbrica (máximo por evento) */
  puntosMaxPorEvento: number;
  /** Promedio de puntos por evento en esta rúbrica (totalPuntos / eventosEvaluados) */
  promedioPorEvento: number;
  /** 0–100: totalPuntos / maxPosible (tope 100) */
  porcentaje: number;
}

/** Tasa de primeros lugares respecto a eventos con ranking (0–100). */
export function calcularTasaExito(
  eventos: resultadosEventoInterface[]
): number {
  if (!eventos?.length) return 0;
  const ganados = eventos.filter((e) => Number(e.rankin) === 1).length;
  return Math.round((ganados / eventos.length) * 1000) / 10;
}

export function contarPorRank(
  eventos: resultadosEventoInterface[],
  rank: number
): number {
  return eventos.filter((e) => Number(e.rankin) === rank).length;
}

export function calcularMediana(valores: number[]): number {
  if (!valores.length) return 0;
  const sorted = [...valores].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/** Moda de totales por evento (si hay empate, el valor más alto). */
export function calcularModa(valores: number[]): number {
  if (!valores.length) return 0;
  const rounded = valores.map((v) => Math.round(v * 100) / 100);
  const freq = new Map<number, number>();
  for (const v of rounded) {
    freq.set(v, (freq.get(v) ?? 0) + 1);
  }
  let bestVal = rounded[0];
  let bestCount = 0;
  freq.forEach((count, val) => {
    if (count > bestCount || (count === bestCount && val > bestVal)) {
      bestCount = count;
      bestVal = val;
    }
  });
  return bestVal;
}

export function totalesPorEventos(
  eventos: resultadosEventoInterface[]
): number[] {
  return eventos.map((e) => Number(e.total ?? 0));
}

export function calcularMedianaEventos(
  eventos: resultadosEventoInterface[]
): number {
  return calcularMediana(totalesPorEventos(eventos));
}

export function calcularModaEventos(
  eventos: resultadosEventoInterface[]
): number {
  const vals = totalesPorEventos(eventos);
  return vals.length ? calcularModa(vals) : 0;
}

/**
 * Estrellas según promedio de temporada (misma escala que StartRakingComponet).
 * Devuelve cantidad en pasos de 0.5 entre 0 y 5.
 */
export function calcularEstrellasDesdePromedio(promedio: number): {
  cantidad: number;
  texto: string;
} {
  const p = Number(promedio);
  if (Number.isNaN(p) || p < 60) {
    return { cantidad: 0, texto: "" };
  }
  let cantidad = 0;
  if (p >= 60 && p < 64) cantidad = 0.5;
  else if (p < 68) cantidad = 1;
  else if (p < 72) cantidad = 1.5;
  else if (p < 76) cantidad = 2;
  else if (p < 80) cantidad = 2.5;
  else if (p < 84) cantidad = 3;
  else if (p < 88) cantidad = 3.5;
  else if (p < 92) cantidad = 4;
  else if (p < 96) cantidad = 4.5;
  else cantidad = 5;

  const texto = `${cantidad} / 5 estrellas`;

  return { cantidad, texto };
}

export function filtrarEvaluacionesPorAnio(
  filas: vistaResultadosModel[],
  anio: number
): vistaResultadosModel[] {
  return filas.filter((r) => Number(r.anioEvento) === anio);
}

/**
 * Agrupa por rúbrica. El porcentaje es puntos obtenidos respecto al máximo posible
 * (puntos por evento según la rúbrica × número de eventos donde hubo evaluación).
 */
export function agruparPorRubrica(
  evaluaciones: vistaResultadosModel[],
  puntosMaxPorEventoPorRubrica: Record<string, number>
): RubricaStats[] {
  if (!evaluaciones?.length) return [];

  const porId = new Map<
    string,
    {
      nombreRubrica: string;
      totalPuntos: number;
      lineas: number;
      eventos: Set<string>;
    }
  >();

  for (const row of evaluaciones) {
    const nombre = row.nombreRubrica?.trim() || "Sin rúbrica";
    const id =
      row.idForaneaRubrica?.trim() || `__sin_id__${nombre}`;
    const pts = Number(row.puntosObtenidos ?? 0);
    const ev = row.idForaneaEvento || "";
    const cur =
      porId.get(id) ?? {
        nombreRubrica: nombre,
        totalPuntos: 0,
        lineas: 0,
        eventos: new Set<string>(),
      };
    cur.nombreRubrica = nombre;
    cur.totalPuntos += pts;
    cur.lineas += 1;
    if (ev) cur.eventos.add(ev);
    porId.set(id, cur);
  }

  const rows: RubricaStats[] = [];
  porId.forEach((v, idForaneaRubrica) => {
    const eventosEvaluados = v.eventos.size;
    const puntosMaxPorEvento = Number(
      puntosMaxPorEventoPorRubrica[idForaneaRubrica] ?? 0
    );
    const maxPosible =
      puntosMaxPorEvento > 0
        ? puntosMaxPorEvento * eventosEvaluados
        : 0;
    const totalPuntos = Math.round(v.totalPuntos * 100) / 100;
    let porcentaje =
      maxPosible > 0
        ? Math.min(100, Math.round((totalPuntos / maxPosible) * 1000) / 10)
        : 0;
    if (maxPosible <= 0 && totalPuntos > 0) {
      porcentaje = 0;
    }
    const promedioPorEvento =
      eventosEvaluados > 0
        ? Math.round((totalPuntos / eventosEvaluados) * 100) / 100
        : 0;

    rows.push({
      idForaneaRubrica,
      nombreRubrica: v.nombreRubrica,
      totalPuntos,
      maxPosible: Math.round(maxPosible * 100) / 100,
      eventosEvaluados,
      puntosMaxPorEvento,
      promedioPorEvento,
      porcentaje,
    });
  });

  return rows.sort((a, b) => b.porcentaje - a.porcentaje);
}
