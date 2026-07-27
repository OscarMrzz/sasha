import type { rubricaInterface, vistaResultadosModel } from "@/interfaces/interfaces";

/** Suma puntos por rúbrica y total general (misma lógica que en la UI de resultados). */
export function calcularPuntosRubricasYTotal(
  rubricasList: rubricaInterface[],
  resultados: vistaResultadosModel[]
): {
  puntosRubricas: Record<string, number>;
  totalGeneral: number;
} {
  const puntosRubricas: Record<string, number> = {};
  for (const rubrica of rubricasList) {
    const suma = resultados
      .filter((r) => r.idForaneaRubrica === rubrica.idRubrica)
      .reduce((acc, r) => acc + r.puntosObtenidos, 0);
    puntosRubricas[rubrica.idRubrica] = suma;
  }
  const totalGeneral = resultados.reduce((s, r) => s + r.puntosObtenidos, 0);
  return { puntosRubricas, totalGeneral };
}
