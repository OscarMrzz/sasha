"use client";

import type {
  perfilDatosAmpleosInterface,
  resultadosEventoInterface,
  vistaResultadosModel,
  vistaResultadosTenporadaInterface,
} from "@/models";
import PerfilesServices from "@/services/perfilesServices";
import RegistroCumplimientoServices from "@/services/RegistroCumplimientosServices";
import RubricasServices from "@/services/rubricasServices";
import {
  agruparPorRubrica,
  calcularEstrellasDesdePromedio,
  calcularMedianaEventos,
  calcularModaEventos,
  calcularTasaExito,
  contarPorRank,
  filtrarEvaluacionesPorAnio,
  type RubricaStats,
} from "@/helpers/utils/estadisticasHelpers";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useEstadisticasBanda() {
  const cumplimientoRef = useRef<RegistroCumplimientoServices | null>(null);
  if (cumplimientoRef.current === null) {
    cumplimientoRef.current = new RegistroCumplimientoServices();
  }

  const [perfil, setPerfil] = useState<perfilDatosAmpleosInterface | null>(
    null
  );
  const [cargandoPerfil, setCargandoPerfil] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resultadosTemporadaTodos, setResultadosTemporadaTodos] = useState<
    vistaResultadosTenporadaInterface[]
  >([]);
  const [eventosRankings, setEventosRankings] = useState<
    resultadosEventoInterface[]
  >([]);
  const [evaluacionesGenerales, setEvaluacionesGenerales] = useState<
    vistaResultadosModel[]
  >([]);
  const [penalizacionesCount, setPenalizacionesCount] = useState(0);
  const [rubricasPuntosMaxPorEvento, setRubricasPuntosMaxPorEvento] = useState<
    Record<string, number>
  >({});

  const traerPerfil = useCallback(async () => {
    setCargandoPerfil(true);
    setError(null);
    try {
      const perfilesServices = new PerfilesServices();
      const activo = await perfilesServices.getUsuarioLogiadoBanda();
      setPerfil(activo);
    } catch (e) {
      console.error("useEstadisticasBanda: error cargando perfil", e);
      setError("No se pudo cargar el perfil.");
      setPerfil(null);
    } finally {
      setCargandoPerfil(false);
    }
  }, []);

  useEffect(() => {
    traerPerfil();
  }, [traerPerfil]);

  const idBanda = perfil?.idForaneaBanda ?? "";
  const anActual = new Date().getFullYear();

  const cargarEstadisticas = useCallback(async () => {
    if (!idBanda || !cumplimientoRef.current) return;
    setCargandoDatos(true);
    setError(null);
    const svc = cumplimientoRef.current;
    const idCategoriaPerfil = perfil?.bandas?.idForaneaCategoria;
    try {
      const [temporada, eventos, evals, penal] = await Promise.all([
        svc.getVistaResultadosTemporadaActual(),
        svc.getResultadosEventosPorBanda(idBanda),
        svc.getVistaResultadosByIdBanda(idBanda),
        svc.getPenalizacionesPorBanda(idBanda),
      ]);
      setResultadosTemporadaTodos(temporada ?? []);
      setEventosRankings(eventos ?? []);
      setEvaluacionesGenerales(evals ?? []);
      setPenalizacionesCount(penal);

      const record: Record<string, number> = {};
      if (idCategoriaPerfil) {
        try {
          const rubSvc = new RubricasServices();
          const rubs = await rubSvc.getPorCategoria(idCategoriaPerfil);
          rubs.forEach((r) => {
            record[r.idRubrica] = Number(r.puntosRubrica ?? 0);
          });
        } catch (err) {
          console.error("useEstadisticasBanda: error cargando rúbricas", err);
        }
      }
      setRubricasPuntosMaxPorEvento(record);
    } catch (e) {
      console.error("useEstadisticasBanda: error cargando datos", e);
      setError("No se pudieron cargar las estadísticas.");
    } finally {
      setCargandoDatos(false);
    }
  }, [idBanda, perfil?.bandas?.idForaneaCategoria]);

  useEffect(() => {
    if (!idBanda) {
      setCargandoDatos(false);
      setResultadosTemporadaTodos([]);
      setEventosRankings([]);
      setEvaluacionesGenerales([]);
      setPenalizacionesCount(0);
      setRubricasPuntosMaxPorEvento({});
      return;
    }
    void cargarEstadisticas();
  }, [idBanda, cargarEstadisticas]);

  const resultadoMiBanda = useMemo(() => {
    if (!perfil?.idForaneaBanda || !resultadosTemporadaTodos.length) {
      return undefined;
    }
    const idCat = perfil.bandas?.idForaneaCategoria;
    return resultadosTemporadaTodos.find(
      (r) =>
        r.idBanda === perfil.idForaneaBanda &&
        (idCat ? r.idCategoria === idCat : true)
    );
  }, [perfil, resultadosTemporadaTodos]);

  const resultadosTemporadaCategoria = useMemo(() => {
    if (!perfil?.bandas?.idBanda || !perfil.bandas.idForaneaCategoria) {
      return resultadosTemporadaTodos;
    }
    return resultadosTemporadaTodos.filter(
      (r) =>
        r.idBanda === perfil.bandas!.idBanda &&
        r.idCategoria === perfil.bandas!.idForaneaCategoria
    );
  }, [perfil, resultadosTemporadaTodos]);

  const evaluacionesAnio = useMemo(
    () => filtrarEvaluacionesPorAnio(evaluacionesGenerales, anActual),
    [evaluacionesGenerales, anActual]
  );

  const rubricasData: RubricaStats[] = useMemo(
    () => agruparPorRubrica(evaluacionesAnio, rubricasPuntosMaxPorEvento),
    [evaluacionesAnio, rubricasPuntosMaxPorEvento]
  );

  const tasaExito = useMemo(
    () => calcularTasaExito(eventosRankings),
    [eventosRankings]
  );
  const primeros = useMemo(
    () => contarPorRank(eventosRankings, 1),
    [eventosRankings]
  );
  const segundos = useMemo(
    () => contarPorRank(eventosRankings, 2),
    [eventosRankings]
  );
  const terceros = useMemo(
    () => contarPorRank(eventosRankings, 3),
    [eventosRankings]
  );
  const mediana = useMemo(
    () => calcularMedianaEventos(eventosRankings),
    [eventosRankings]
  );
  const moda = useMemo(
    () => calcularModaEventos(eventosRankings),
    [eventosRankings]
  );

  const estrellas = useMemo(() => {
    const p = resultadoMiBanda?.promedio;
    if (p === undefined || p === null) {
      return calcularEstrellasDesdePromedio(0);
    }
    return calcularEstrellasDesdePromedio(Number(p));
  }, [resultadoMiBanda]);

  const mediaTemporada = resultadoMiBanda?.promedio ?? 0;

  const cargando = cargandoPerfil || (Boolean(idBanda) && cargandoDatos);

  return {
    perfil,
    cargando,
    cargandoPerfil,
    cargandoDatos,
    error,
    recargar: () => {
      void traerPerfil();
      void cargarEstadisticas();
    },
    resultadoMiBanda,
    resultadosTemporada: resultadosTemporadaCategoria,
    resultadosTemporadaTodos,
    eventosRankings,
    evaluacionesGenerales: evaluacionesAnio,
    penalizacionesCount,
    tasaExito,
    primeros,
    segundos,
    terceros,
    mediana,
    moda,
    mediaTemporada,
    rubricasData,
    estrellas,
  };
}
