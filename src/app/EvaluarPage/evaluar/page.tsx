"use client";

import EvaluarBaseRubricaComponet from "@/components/EvaluarComponents/EvaluarBaseRubricaComponet";
import ApprovateMessage from "@/components/Message/ApprovateMessage";
import LoadingMessage1 from "@/components/Message/LoadingMessage1";
import ErrorMessage from "@/components/Message/ErrorMessage";
import BuscadorRow from "@/components/buscadores/BuscadorRow";
import SalaEsperaEvento from "@/components/eventos/SalaEsperaEvento";
import {
  bandaInterface,
  categoriaInterface,
  perfilDatosAmpleosInterface,
  RegistroEventoInterface,
  rubricaInterface,
  vistaBandasEventoInterface,
} from "@/models";
import { coincideBusqueda } from "@/helpers/busqueda/normalizarTextoBusqueda";
import { esEventoDelDia } from "@/helpers/fechas/eventosDelDia";
import { formatearFechaEvento } from "@/helpers/fechas/formatearFechaEvento";
import {
  deleteEvaluarDraftCookie,
  deleteEvaluarSession,
  readEvaluarSession,
  setEvaluarSession,
} from "@/lib/evaluarPersistence";
import RegistroEventossServices from "@/services/registroEventosServices";
import RegistroComentariosServices from "@/services/RegistroComentariosServices";
import RubricasServices from "@/services/rubricasServices";
import { useBandasStore } from "@/store/BandasStore/listBandaStore";
import { useRubicasStore } from "@/store/RubricasStore/listRubicasStore";
import { useEventosAsignadosActualizados } from "@/hooks/eventos/useEventosAsignadosActualizados";
import { useListaCategoriaFiltro } from "@/hooks/useListaCategoriasFiltro";
import {
  ArrowPathIcon,
  ArrowRightCircleIcon,
} from "@heroicons/react/16/solid";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Etapa =
  | "elegirEvento"
  | "cargandoBanda"
  | "sinBanda"
  | "evaluando"
  | "finalizacion"
  | "esperaSiguienteBanda";

const ETIQUETA_ESTADO_EVENTO: Record<RegistroEventoInterface["estado_evento"], string> = {
  pendiente: "Pendiente",
  iniciado: "En curso",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const puedeElegirEvento = (estado: RegistroEventoInterface["estado_evento"]) =>
  estado === "pendiente" || estado === "iniciado";

const obtenerPerfilActivo = (): perfilDatosAmpleosInterface | null => {
  if (typeof window === "undefined") return null;

  const perfilCookie = document.cookie
    .split(";")
    .find((cookie) => cookie.trim().startsWith("perfilActivo="));
  const perfilBruto = perfilCookie ? decodeURIComponent(perfilCookie.split("=")[1]) : null;

  if (!perfilBruto) return null;

  try {
    return JSON.parse(perfilBruto) as perfilDatosAmpleosInterface;
  } catch (error) {
    console.error("No se pudo leer el perfil activo desde la cookie:", error);
    return null;
  }
};

export default function EvaluarHomePage() {
  const registroEventosServices = useRef(new RegistroEventossServices());
  const registroComentariosServices = useRef(new RegistroComentariosServices());
  const rubricasServices = useRef(new RubricasServices());

  const { listRubicasStore } = useRubicasStore();
  const { listBandasStore } = useBandasStore();
  const { categoriasList, recargarCategorias } = useListaCategoriaFiltro();

  const [etapa, setEtapa] = useState<Etapa>("elegirEvento");
  const [eventoSeleccionado, setEventoSeleccionado] = useState<RegistroEventoInterface | null>(null);
  const [bandaResuelta, setBandaResuelta] = useState<bandaInterface | null>(null);
  const [rubricaResuelta, setRubricaResuelta] = useState<rubricaInterface | null>(null);
  const [categoriaResuelta, setCategoriaResuelta] = useState<categoriaInterface | null>(null);
  const [enSalaEspera, setEnSalaEspera] = useState(false);
  const [eventoListoParaContinuar, setEventoListoParaContinuar] = useState(false);
  const [eventoFueraDeCurso, setEventoFueraDeCurso] = useState<RegistroEventoInterface | null>(null);
  const [busquedaEventos, setBusquedaEventos] = useState("");
  const [restaurandoSesion, setRestaurandoSesion] = useState(true);
  const sesionRestauradaRef = useRef(false);
  const [vistaEnCancha, setVistaEnCancha] = useState<vistaBandasEventoInterface | null>(null);
  const [motivoSinBanda, setMotivoSinBanda] = useState<"sin_cancha" | "sin_rubrica">("sin_cancha");
  const [ultimaBandaEnCanchaId, setUltimaBandaEnCanchaId] = useState<string | null>(null);
  const [idRubricaAsignada, setIdRubricaAsignada] = useState<string | null>(null);
  const [nombreRubricaAsignada, setNombreRubricaAsignada] = useState<string | null>(null);
  const [nuevaBandaLista, setNuevaBandaLista] = useState(false);
  const [mensajeEsperaBanda, setMensajeEsperaBanda] = useState<string | null>(null);
  const [refrescandoEsperaBanda, setRefrescandoEsperaBanda] = useState(false);

  const [activadorApprovateMessage, setActivadorApprovateMessage] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [activarErrorMessage, setActivarErrorMessage] = useState(false);
  const [activadorLoadingMessage, setActivadorLoadingMessage] = useState(false);

  const autoRefreshIntervalMs = useMemo(() => {
    if (etapa === "elegirEvento" || enSalaEspera) return 15000;
    return 0;
  }, [enSalaEspera, etapa]);

  const {
    eventosAsignados,
    eventosAsignadosHoy,
    refrescarEventos,
    refrescandoEventos,
    cargaInicialCompletada,
    errorRefresco,
  } = useEventosAsignadosActualizados({
    autoRefreshIntervalMs,
    detectarInicioEnAutoRefresh: false,
  });

  const buscarEvento = useCallback(
    (idEvento: string) =>
      eventosAsignadosHoy.find((evento) => evento.idEvento === idEvento) ??
      eventosAsignados.find((evento) => evento.idEvento === idEvento),
    [eventosAsignados, eventosAsignadosHoy],
  );

  const persistirSesionEspera = useCallback(
    (idEvento: string, bandaReferenciaId: string, idRubrica: string) => {
      setEvaluarSession({
        idEvento,
        updatedAt: Date.now(),
        etapa: "esperaSiguienteBanda",
        ultimaBandaEnCanchaId: bandaReferenciaId,
        idRubricaAsignada: idRubrica,
      });
    },
    [],
  );

  const entrarEsperaSiguienteBanda = useCallback(
    (
      evento: RegistroEventoInterface,
      vistaFila: vistaBandasEventoInterface,
      idRubrica: string,
      nombreRubrica: string,
      bandaReferenciaId: string,
    ) => {
      setEventoSeleccionado(evento);
      setBandaResuelta(null);
      setRubricaResuelta(null);
      setCategoriaResuelta(null);
      setVistaEnCancha(vistaFila);
      setUltimaBandaEnCanchaId(bandaReferenciaId);
      setIdRubricaAsignada(idRubrica);
      setNombreRubricaAsignada(nombreRubrica);
      setNuevaBandaLista(false);
      setMensajeEsperaBanda(null);
      setEtapa("esperaSiguienteBanda");
      persistirSesionEspera(evento.idEvento, bandaReferenciaId, idRubrica);
    },
    [persistirSesionEspera],
  );

  const cargarBandaEnCancha = useCallback(
    async (idEvento: string, evento: RegistroEventoInterface) => {
      setEventoSeleccionado(evento);
      setEventoFueraDeCurso(null);
      setEnSalaEspera(false);
      setEventoListoParaContinuar(false);
      setNuevaBandaLista(false);
      setMensajeEsperaBanda(null);
      setEtapa("cargandoBanda");
      setBandaResuelta(null);
      setRubricaResuelta(null);
      setCategoriaResuelta(null);
      setVistaEnCancha(null);
      setMotivoSinBanda("sin_cancha");
      setEvaluarSession({ idEvento, updatedAt: Date.now() });

      const perfil = obtenerPerfilActivo();
      if (!perfil?.idPerfil) {
        setEtapa("sinBanda");
        return;
      }

      try {
        await registroEventosServices.current.initPerfil();
        await rubricasServices.current.initPerfil();
        await registroComentariosServices.current.initPerfil();

        if (categoriasList.length === 0) {
          await recargarCategorias();
        }

        const vistaFila = await registroEventosServices.current.getVistaBandasEventoByBandaEnCancha(
          idEvento,
          perfil.idPerfil,
        );

        const idRubrica = vistaFila.id_foranea_rubrica?.trim();

        if (!idRubrica) {
          setVistaEnCancha(vistaFila);
          setMotivoSinBanda("sin_rubrica");
          setEtapa("sinBanda");
          return;
        }

        let rubrica = listRubicasStore.find((r) => r.idRubrica === idRubrica);
        if (!rubrica) {
          try {
            rubrica = (await rubricasServices.current.getOne(idRubrica)) as rubricaInterface;
          } catch {
            rubrica = undefined;
          }
        }

        if (!rubrica) {
          setVistaEnCancha(vistaFila);
          setMotivoSinBanda("sin_rubrica");
          setEtapa("sinBanda");
          return;
        }

        const yaEvaluada = await registroComentariosServices.current.rubricaYaEvaluadaEnEvento(
          vistaFila.idBanda,
          idEvento,
          idRubrica,
        );

        if (yaEvaluada) {
          entrarEsperaSiguienteBanda(
            evento,
            vistaFila,
            idRubrica,
            rubrica.nombreRubrica,
            vistaFila.idBanda,
          );
          return;
        }

        const categoria =
          categoriasList.find((c) => c.idCategoria === vistaFila.idCategoria) ??
          ({
            idCategoria: vistaFila.idCategoria,
            created_at: "",
            nombreCategoria: vistaFila.nombreCategoria,
            detallesCategoria: "",
            idForaneaFederacion: evento.idForaneaFederacion,
          } satisfies categoriaInterface);

        const bandaObj =
          listBandasStore.find((b) => b.idBanda === vistaFila.idBanda) ??
          ({
            idBanda: vistaFila.idBanda,
            created_at: "",
            nombreBanda: vistaFila.nombreBanda,
            AliasBanda: vistaFila.AliasBanda ?? "",
            idForaneaCategoria: vistaFila.idCategoria,
            idForaneaRegion: evento.idForaneaRegion,
            idForaneaFederacion: evento.idForaneaFederacion,
            ciudadBanda: "",
            urlLogoBanda: "",
            fechaFundacionBanda: null,
            fechaInscripcionAFederacion: null,
            ubicacionSedeBanda: "",
          } satisfies bandaInterface);

        setBandaResuelta(bandaObj);
        setRubricaResuelta(rubrica);
        setCategoriaResuelta(categoria);
        setVistaEnCancha(null);
        setEtapa("evaluando");
      } catch {
        setVistaEnCancha(null);
        setMotivoSinBanda("sin_cancha");
        setEtapa("sinBanda");
      }
    },
    [categoriasList, entrarEsperaSiguienteBanda, listBandasStore, listRubicasStore, recargarCategorias],
  );

  useEffect(() => {
    if (!cargaInicialCompletada || sesionRestauradaRef.current) return;

    sesionRestauradaRef.current = true;
    const session = readEvaluarSession();

    if (!session?.idEvento) {
      setRestaurandoSesion(false);
      return;
    }

    const evento = buscarEvento(session.idEvento);
    if (!evento || !esEventoDelDia(evento.fechaEvento)) {
      deleteEvaluarSession();
      setRestaurandoSesion(false);
      return;
    }

    if (evento.estado_evento === "finalizado" || evento.estado_evento === "cancelado") {
      deleteEvaluarSession();
      setRestaurandoSesion(false);
      return;
    }

    setEventoSeleccionado(evento);

    if (evento.estado_evento === "pendiente") {
      setEnSalaEspera(true);
      setEventoListoParaContinuar(false);
      setRestaurandoSesion(false);
      return;
    }

    if (session.etapa === "esperaSiguienteBanda") {
      setUltimaBandaEnCanchaId(session.ultimaBandaEnCanchaId ?? null);
      setIdRubricaAsignada(session.idRubricaAsignada ?? null);
      setNuevaBandaLista(false);
      setMensajeEsperaBanda(null);
      setEtapa("esperaSiguienteBanda");
      setRestaurandoSesion(false);
      void (async () => {
        const perfil = obtenerPerfilActivo();
        if (!perfil?.idPerfil) return;
        try {
          await registroEventosServices.current.initPerfil();
          const vistaFila = await registroEventosServices.current.getVistaBandasEventoByBandaEnCancha(
            evento.idEvento,
            perfil.idPerfil,
          );
          setVistaEnCancha(vistaFila);
          const idRubrica = vistaFila.id_foranea_rubrica?.trim() ?? session.idRubricaAsignada ?? "";
          if (idRubrica) {
            const rubrica = listRubicasStore.find((r) => r.idRubrica === idRubrica);
            setNombreRubricaAsignada(rubrica?.nombreRubrica ?? null);
          }
        } catch {
          setVistaEnCancha(null);
        }
      })();
      return;
    }

    void cargarBandaEnCancha(evento.idEvento, evento).finally(() => setRestaurandoSesion(false));
  }, [buscarEvento, cargaInicialCompletada, cargarBandaEnCancha, listRubicasStore]);

  useEffect(() => {
    if (!enSalaEspera || !eventoSeleccionado) return;

    const eventoActualizado = eventosAsignados.find(
      (evento) => evento.idEvento === eventoSeleccionado.idEvento,
    );

    if (!eventoActualizado) return;

    if (
      eventoActualizado.estado_evento === "iniciado" &&
      eventoSeleccionado.estado_evento !== "iniciado"
    ) {
      setEventoSeleccionado(eventoActualizado);
      setEventoListoParaContinuar(true);
    }
  }, [enSalaEspera, eventoSeleccionado, eventosAsignados]);

  useEffect(() => {
    if (
      etapa !== "evaluando" &&
      etapa !== "sinBanda" &&
      etapa !== "finalizacion" &&
      etapa !== "esperaSiguienteBanda"
    ) {
      return;
    }
    if (!eventoSeleccionado) return;

    const eventoActualizado = eventosAsignados.find(
      (evento) => evento.idEvento === eventoSeleccionado.idEvento,
    );

    if (!eventoActualizado) return;

    if (eventoActualizado.estado_evento !== "iniciado") {
      setEventoFueraDeCurso(eventoActualizado);
      setEventoSeleccionado(eventoActualizado);
      setBandaResuelta(null);
      setRubricaResuelta(null);
      setCategoriaResuelta(null);
      setEtapa("elegirEvento");
    }
  }, [etapa, eventoSeleccionado, eventosAsignados]);

  const selecionarEvento = (idEvento: string) => {
    deleteEvaluarDraftCookie();
    const eventoElegido = eventosAsignadosHoy.find((evento) => evento.idEvento === idEvento);
    if (!eventoElegido || !puedeElegirEvento(eventoElegido.estado_evento)) return;

    setEventoFueraDeCurso(null);

    if (eventoElegido.estado_evento === "pendiente") {
      setEventoSeleccionado(eventoElegido);
      setEnSalaEspera(true);
      setEventoListoParaContinuar(false);
      setEtapa("elegirEvento");
      setEvaluarSession({ idEvento: eventoElegido.idEvento, updatedAt: Date.now() });
      return;
    }

    void cargarBandaEnCancha(eventoElegido.idEvento, eventoElegido);
  };

  const continuarDesdeSala = () => {
    if (!eventoSeleccionado) return;
    setEnSalaEspera(false);
    setEventoListoParaContinuar(false);
    void cargarBandaEnCancha(eventoSeleccionado.idEvento, eventoSeleccionado);
  };

  const continuarSinBanda = () => {
    if (!eventoSeleccionado) return;
    void cargarBandaEnCancha(eventoSeleccionado.idEvento, eventoSeleccionado);
  };

  const volverAElegirEvento = () => {
    deleteEvaluarDraftCookie();
    deleteEvaluarSession();
    setEventoSeleccionado(null);
    setBandaResuelta(null);
    setRubricaResuelta(null);
    setCategoriaResuelta(null);
    setVistaEnCancha(null);
    setMotivoSinBanda("sin_cancha");
    setEnSalaEspera(false);
    setEventoListoParaContinuar(false);
    setEventoFueraDeCurso(null);
    setUltimaBandaEnCanchaId(null);
    setIdRubricaAsignada(null);
    setNombreRubricaAsignada(null);
    setNuevaBandaLista(false);
    setMensajeEsperaBanda(null);
    setEtapa("elegirEvento");
  };

  const revisarEvluacion = () => {
    setActivadorLoadingMessage(true);
  };

  const finalizarEvaluacionBanda = () => {
    const idBandaEvaluada = bandaResuelta?.idBanda;
    const idRubrica = rubricaResuelta?.idRubrica;
    const nombreRubrica = rubricaResuelta?.nombreRubrica ?? null;

    deleteEvaluarDraftCookie();
    setBandaResuelta(null);
    setRubricaResuelta(null);
    setCategoriaResuelta(null);
    setActivadorLoadingMessage(false);
    setActivadorApprovateMessage(true);

    if (eventoSeleccionado && idBandaEvaluada && idRubrica) {
      setUltimaBandaEnCanchaId(idBandaEvaluada);
      setIdRubricaAsignada(idRubrica);
      setNombreRubricaAsignada(nombreRubrica);
      setNuevaBandaLista(false);
      setMensajeEsperaBanda(null);
      setEtapa("esperaSiguienteBanda");
      persistirSesionEspera(eventoSeleccionado.idEvento, idBandaEvaluada, idRubrica);

      void (async () => {
        const perfil = obtenerPerfilActivo();
        if (!perfil?.idPerfil) return;
        try {
          await registroEventosServices.current.initPerfil();
          const vistaFila = await registroEventosServices.current.getVistaBandasEventoByBandaEnCancha(
            eventoSeleccionado.idEvento,
            perfil.idPerfil,
          );
          setVistaEnCancha(vistaFila);
        } catch {
          /* Sin banda en cancha al consultar; la sala de espera sigue operativa */
        }
      })();
      return;
    }

    setEtapa("finalizacion");
  };

  const cancelarEvaluacionBanda = () => {
    deleteEvaluarDraftCookie();
    setBandaResuelta(null);
    setRubricaResuelta(null);
    setCategoriaResuelta(null);
    setActivadorLoadingMessage(false);
    setEtapa("finalizacion");
  };

  const continuarEvaluacion = () => {
    if (!eventoSeleccionado) return;
    void cargarBandaEnCancha(eventoSeleccionado.idEvento, eventoSeleccionado);
  };

  const continuarDesdeEsperaBanda = () => {
    if (!eventoSeleccionado || !nuevaBandaLista) return;
    setNuevaBandaLista(false);
    void cargarBandaEnCancha(eventoSeleccionado.idEvento, eventoSeleccionado);
  };

  const actualizarEsperaBanda = async () => {
    if (!eventoSeleccionado) return;

    setRefrescandoEsperaBanda(true);
    setNuevaBandaLista(false);
    setMensajeEsperaBanda(null);

    try {
      await refrescarEventos({ detectarInicio: false });

      const perfil = obtenerPerfilActivo();
      if (!perfil?.idPerfil) return;

      await registroEventosServices.current.initPerfil();
      await registroComentariosServices.current.initPerfil();

      const vistaFila = await registroEventosServices.current.getVistaBandasEventoByBandaEnCancha(
        eventoSeleccionado.idEvento,
        perfil.idPerfil,
      );

      setVistaEnCancha(vistaFila);

      const idRubrica = vistaFila.id_foranea_rubrica?.trim() ?? idRubricaAsignada ?? "";
      if (!idRubrica) return;

      let rubrica = listRubicasStore.find((r) => r.idRubrica === idRubrica);
      if (!rubrica) {
        try {
          await rubricasServices.current.initPerfil();
          rubrica = (await rubricasServices.current.getOne(idRubrica)) as rubricaInterface;
        } catch {
          rubrica = undefined;
        }
      }
      if (rubrica?.nombreRubrica) {
        setNombreRubricaAsignada(rubrica.nombreRubrica);
      }

      const yaEvaluada = await registroComentariosServices.current.rubricaYaEvaluadaEnEvento(
        vistaFila.idBanda,
        eventoSeleccionado.idEvento,
        idRubrica,
      );

      const referenciaBanda = ultimaBandaEnCanchaId ?? "";
      const esNuevaBanda = Boolean(referenciaBanda) && vistaFila.idBanda !== referenciaBanda;

      if (esNuevaBanda && !yaEvaluada) {
        setNuevaBandaLista(true);
        return;
      }

      if (yaEvaluada) {
        setMensajeEsperaBanda(
          "Esta banda ya fue evaluada con esta rúbrica. Espera el cambio de banda.",
        );
      } else {
        setMensajeEsperaBanda("Aún es la misma banda en cancha. Espera el cambio de banda.");
      }
    } catch {
      setVistaEnCancha(null);
      setMensajeEsperaBanda("No hay banda en cancha en este momento.");
    } finally {
      setRefrescandoEsperaBanda(false);
    }
  };

  const reiniciarEvaluacion = () => {
    volverAElegirEvento();
  };

  const cerrarMensajeError = useCallback(() => {
    setActivarErrorMessage(false);
  }, []);

  const lanzarError = useCallback((mensaje: string) => {
    setActivadorLoadingMessage(false);
    setActivarErrorMessage(true);
    setMensajeError(mensaje);
  }, []);

  const refrescarDesdeSala = async () => {
    await refrescarEventos({ detectarInicio: false });
  };

  const eventosHoyFiltrados = useMemo(() => {
    return eventosAsignadosHoy.filter(
      (evento) =>
        coincideBusqueda(evento.LugarEvento, busquedaEventos) ||
        coincideBusqueda(evento.tipo_evento, busquedaEventos),
    );
  }, [busquedaEventos, eventosAsignadosHoy]);

  const selectionTrail = [
    eventoSeleccionado?.LugarEvento,
    categoriaResuelta?.nombreCategoria,
    rubricaResuelta?.nombreRubrica,
    bandaResuelta?.nombreBanda,
  ].filter((p): p is string => Boolean(p));

  if (!cargaInicialCompletada || restaurandoSesion) {
    return (
      <div className="flex h-full w-full items-center justify-center px-4">
        <p className="text-center text-slate-300">
          {restaurandoSesion ? "Recuperando tu sesión…" : "Cargando…"}
        </p>
      </div>
    );
  }

  if (
    eventosAsignadosHoy.length === 0 &&
    !enSalaEspera &&
    !eventoFueraDeCurso &&
    !eventoSeleccionado &&
    etapa !== "esperaSiguienteBanda"
  ) {
    return (
      <div className="flex w-full items-center justify-center px-4">
        <p className="max-w-md text-center text-lg text-slate-300">
          No tienes eventos asignados para el día de hoy.
        </p>
      </div>
    );
  }

  if (eventoFueraDeCurso) {
    return (
      <div className="h-full w-full">
        <SalaEsperaEvento
          modo="evento-no-disponible"
          estadoEvento={eventoFueraDeCurso.estado_evento}
          nombreEvento={eventoFueraDeCurso.LugarEvento}
          refrescando={refrescandoEventos}
          mensajeError={errorRefresco}
          onRefrescar={refrescarDesdeSala}
          onVolver={volverAElegirEvento}
        />
      </div>
    );
  }

  if (enSalaEspera && eventoSeleccionado) {
    return (
      <div className="h-full w-full">
        <SalaEsperaEvento
          modo={eventoListoParaContinuar ? "inicio-detectado" : "espera"}
          nombreEvento={eventoSeleccionado.LugarEvento}
          refrescando={refrescandoEventos}
          mensajeError={errorRefresco}
          onRefrescar={refrescarDesdeSala}
          onContinuar={continuarDesdeSala}
          onVolver={volverAElegirEvento}
        />
      </div>
    );
  }

  if (etapa === "esperaSiguienteBanda" && eventoSeleccionado) {
    return (
      <div className="h-full w-full">
        <section id="mensajes">
          <ApprovateMessage
            open={activadorApprovateMessage}
            onClose={() => setActivadorApprovateMessage(false)}
            titulo="Exito"
            texto="Evaluacion guardada con exito"
          />
        </section>
        <SalaEsperaEvento
          modo="espera-siguiente-banda"
          nombreEvento={eventoSeleccionado.LugarEvento}
          nombreBandaEnCancha={vistaEnCancha?.nombreBanda}
          nombreRubrica={nombreRubricaAsignada ?? undefined}
          mensajeAuxiliar={mensajeEsperaBanda}
          nuevaBandaLista={nuevaBandaLista}
          refrescando={refrescandoEsperaBanda}
          mensajeError={errorRefresco}
          onRefrescar={actualizarEsperaBanda}
          onContinuar={continuarDesdeEsperaBanda}
          onVolver={volverAElegirEvento}
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <section id="mensajes">
        <ApprovateMessage
          open={activadorApprovateMessage}
          onClose={() => setActivadorApprovateMessage(false)}
          titulo="Exito"
          texto="Evaluacion guardada con exito"
        />
        <ErrorMessage
          titulo="ERROR"
          texto={mensajeError}
          open={activarErrorMessage}
          onClose={cerrarMensajeError}
        />
        <LoadingMessage1
          open={activadorLoadingMessage}
          onClose={() => setActivadorLoadingMessage(false)}
          titulo="Procesando"
          texto="Revisando rubrica y subiendo al servidor..."
        />
      </section>

      {etapa === "elegirEvento" && (
        <section className="w-full px-4">
          <h1 className="mb-4 text-3xl font-bold text-slate-300">Eventos</h1>
          <div className="mb-4">
            <BuscadorRow filtrarBuscador={(e) => setBusquedaEventos(e.target.value)} />
          </div>
          <div className="flex w-full flex-col gap-4">
            {eventosHoyFiltrados.length === 0 && (
              <p className="rounded-md bg-slate-800/60 p-4 text-slate-300">
                No hay eventos que coincidan con tu búsqueda.
              </p>
            )}
            {eventosHoyFiltrados.map((evento, index) => {
              const seleccionable = puedeElegirEvento(evento.estado_evento);
              return (
                <div
                  key={evento.idEvento}
                  onClick={() => {
                    if (seleccionable) selecionarEvento(evento.idEvento);
                  }}
                  style={{ animationDelay: `${index * 120}ms` }}
                  className={[
                    "animate-fade-in min-h-24 w-full rounded-md bg-slate-700 p-4 shadow transition-colors duration-300",
                    seleccionable ? "cursor-pointer hover:bg-slate-600" : "cursor-not-allowed opacity-60",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-slate-100">{evento.LugarEvento}</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        {formatearFechaEvento(evento.fechaEvento)} · {evento.tipo_evento}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-200">
                      {ETIQUETA_ESTADO_EVENTO[evento.estado_evento]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {etapa === "cargandoBanda" && (
        <section className="flex h-96 w-full items-center justify-center px-4">
          <p className="text-center text-lg text-slate-300">Buscando banda en cancha…</p>
        </section>
      )}

      {etapa === "sinBanda" && eventoSeleccionado && (
        <section className="flex h-96 w-full flex-col items-center justify-center gap-8 px-4 text-center">
          <div className="max-w-lg rounded-2xl border border-slate-600/40 bg-slate-800/50 p-6">
            {vistaEnCancha ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-wide text-[#00b4d8]">
                  Banda en cancha
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-100">{vistaEnCancha.nombreBanda}</h2>
                {vistaEnCancha.AliasBanda?.trim() ? (
                  <p className="mt-1 text-sm text-slate-300">{vistaEnCancha.AliasBanda}</p>
                ) : null}
                <p className="mt-2 text-sm text-slate-400">
                  Categoría: {vistaEnCancha.nombreCategoria}
                </p>
                <p className="mt-4 text-sm text-slate-300">
                  {motivoSinBanda === "sin_rubrica"
                    ? "Aún no tiene una rúbrica asignada para evaluar. Consulte al responsable de mesa y presione Continuar."
                    : "La banda está en cancha. Presione Continuar para iniciar la evaluación."}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-slate-100">Sin banda asignada</h2>
                <p className="mt-3 text-sm text-slate-300">
                  Todavía no hay una banda asignada para evaluar. Espere un momento y presione Continuar,
                  o consulte al responsable de mesa.
                </p>
              </>
            )}
            <p className="mt-2 text-xs text-slate-500">Evento: {eventoSeleccionado.LugarEvento}</p>
          </div>
          <button
            type="button"
            onClick={continuarSinBanda}
            className="animate-pulsing h-16 w-60 rounded-2xl bg-white text-2xl font-bold text-slate-800"
          >
            Continuar
            <ArrowRightCircleIcon className="ml-2 inline-block h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={volverAElegirEvento}
            className="flex animate-zoom-in gap-2 text-slate-500"
          >
            <ArrowPathIcon className="inline-block h-6 w-6" />
            Elegir otro evento
          </button>
        </section>
      )}

      {etapa === "finalizacion" && (
        <section className="flex h-96 w-full flex-col items-center justify-center gap-8">
          <button
            type="button"
            onClick={continuarEvaluacion}
            className="animate-pulsing h-16 w-60 rounded-2xl bg-white text-2xl font-bold text-slate-800"
          >
            Continuar
            <ArrowRightCircleIcon className="ml-2 inline-block h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={reiniciarEvaluacion}
            className="flex animate-zoom-in gap-2 text-slate-500"
          >
            <ArrowPathIcon className="inline-block h-6 w-6" />
            Reiniciar
          </button>
        </section>
      )}

      {selectionTrail.length > 0 && (etapa === "evaluando" || etapa === "finalizacion") && (
        <nav
          aria-label="Selección actual"
          className="mx-4 mt-4 w-full max-w-full rounded-2xl border border-[var(--vz-border)] bg-white px-4 py-3 shadow-sm"
        >
          <ol className="flex flex-wrap items-baseline gap-x-0 text-sm">
            {selectionTrail.map((text, i) => (
              <li key={`${i}-${text}`} className="flex items-baseline">
                {i > 0 && (
                  <span className="mx-2 select-none font-normal text-[var(--app-fg-muted)]" aria-hidden>
                    /
                  </span>
                )}
                <span
                  className={
                    i === selectionTrail.length - 1
                      ? "font-semibold tracking-tight text-[var(--app-fg)]"
                      : "font-medium tracking-tight text-[var(--app-fg-muted)]"
                  }
                >
                  {text}
                </span>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <section id="evaluar">
        {etapa === "evaluando" &&
        eventoSeleccionado &&
        categoriaResuelta &&
        rubricaResuelta &&
        bandaResuelta ? (
          <EvaluarBaseRubricaComponet
            eventoSelecionado={eventoSeleccionado}
            idRegionSelecionada={eventoSeleccionado.idForaneaRegion}
            categoriaSelecionada={categoriaResuelta}
            rubricaSelecionada={rubricaResuelta}
            bandaSelecionada={bandaResuelta}
            revisandoEvluacion={revisarEvluacion}
            finalizarEvaluacionBanda={finalizarEvaluacionBanda}
            cancelarEvaluacionBanda={cancelarEvaluacionBanda}
            lanzarError={lanzarError}
          />
        ) : null}
      </section>
    </div>
  );
}
