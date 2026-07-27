"use client";

import type {
  criterioEvaluacionInterface,
  rubricaInterface,
  vistaResultadosModel,
} from "@/interfaces/interfaces";
import { useEffect, useMemo, useState } from "react";

/**
 * Agrega puntos por rúbrica, por criterio y total a partir de filas de vista de resultados.
 * Sin llamadas de red: combina datos ya cargados (p. ej. desde TanStack Query).
 */
export function useDerivadosPuntosVistaResultados(
  rubricasList: rubricaInterface[],
  criteriosList: criterioEvaluacionInterface[],
  resultados: vistaResultadosModel[]
) {
  const [puntosRubricas, setPuntosRubricas] = useState<Record<string, number>>(
    {}
  );
  const [puntosCriterios, setPuntosCriterios] = useState<Record<string, number>>(
    {}
  );

  const totalGeneral = useMemo(
    () =>
      resultados.reduce(
        (suma, resultado) => suma + resultado.puntosObtenidos,
        0
      ),
    [resultados]
  );

  useEffect(() => {
    if (rubricasList.length > 0 && resultados.length > 0) {
      const puntosCalculados: Record<string, number> = {};

      rubricasList.forEach((rubrica) => {
        const puntosRubrica = resultados
          .filter(
            (resultado) => resultado.idForaneaRubrica === rubrica.idRubrica
          )
          .reduce((suma, resultado) => suma + resultado.puntosObtenidos, 0);

        puntosCalculados[rubrica.idRubrica] = puntosRubrica;
      });

      setPuntosRubricas(puntosCalculados);
    }
  }, [rubricasList, resultados]);

  useEffect(() => {
    if (criteriosList.length > 0 && resultados.length > 0) {
      const puntosCalculadosCriterios: Record<string, number> = {};
      criteriosList.forEach((criterio) => {
        const puntosCriterio = resultados
          .filter(
            (resultado) => resultado.idForaneaCriterio === criterio.idCriterio
          )
          .reduce((suma, resultado) => suma + resultado.puntosObtenidos, 0);
        puntosCalculadosCriterios[criterio.idCriterio] =
          puntosCriterio < 0 ? 0 : puntosCriterio;
      });

      setPuntosCriterios(puntosCalculadosCriterios);
    }
  }, [criteriosList, resultados]);

  return { puntosRubricas, puntosCriterios, totalGeneral };
}
