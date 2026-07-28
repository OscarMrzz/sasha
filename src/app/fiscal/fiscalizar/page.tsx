"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/16/solid";
import type { ModalInformacionSelectedItem } from "@/components/informacion/informacionResultados/ModalInformacionResultados";
import ModalInformacionResultados from "@/components/informacion/informacionResultados/ModalInformacionResultados";
import SalaEsperaEvento from "@/components/eventos/SalaEsperaEvento";
import ModalFormularioSolicitudRevicion from "@/components/informacion/informacionResultados/modalFormularioSolicitudRevicion";
import ApprovateMessage from "@/components/Message/ApprovateMessage";
import CardRowPosicion from "@/components/CardRow/CardRowPosicion";
import BuscadorRow from "@/components/buscadores/BuscadorRow";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";
import { RegistroEventoInterface, vistaResultadosPreliminaresInterface } from "@/models";
import RegistroCumplimientoServices from "@/services/RegistroCumplimientosServices";
import { coincideBusqueda } from "@/helpers/busqueda/normalizarTextoBusqueda";
import { esEventoDelDia } from "@/helpers/fechas/eventosDelDia";
import { formatearFechaEvento } from "@/helpers/fechas/formatearFechaEvento";
import { useEventosAsignadosActualizados } from "@/hooks/eventos/useEventosAsignadosActualizados";
import { useListaCategoriaFiltro } from "@/hooks/useListaCategoriasFiltro";
import { useModalSolicitudRevicionesStore } from "@/store/revicionesStore/modalSolicitudRevicionesStore";
import { useModalMessageAprovateSolicitudRevicionStore } from "@/store/revicionesStore/modalMessage/modalMessageAprovateSolicitudRevicionStore";
import {
  deleteFiscalWizardCookie,
  FiscalWizardCookieState,
  FiscalWizardCampo,
  readFiscalWizardCookie,
  setFiscalWizardCookie,
} from "@/lib/fiscalPersistence";

type campos = FiscalWizardCookieState["campoSeleccionadoActual"];

const WIZARD_STEPS: { campoKey: Exclude<campos, "resultados" | "">; label: string }[] = [
  { campoKey: "evento", label: "Evento" },
  { campoKey: "categoria", label: "Categoría" },
];

const ETIQUETA_ESTADO_EVENTO: Record<RegistroEventoInterface["estado_evento"], string> = {
  pendiente: "Pendiente",
  iniciado: "En curso",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const puedeElegirEvento = (estado: RegistroEventoInterface["estado_evento"]) =>
  estado === "pendiente" || estado === "iniciado";

const leerWizardPersistido = (): FiscalWizardCookieState | null => {
  if (typeof window === "undefined") return null;
  return readFiscalWizardCookie();
};

const pasoAvanzadoEnWizard = (estado: FiscalWizardCookieState) =>
  Boolean(
    estado.idCategoria ||
      estado.campoSeleccionadoActual === "categoria" ||
      estado.campoSeleccionadoActual === "resultados",
  );

export default function FiscalizarHomePage() {
  const {
    activadorModalSolicitudReviciones,
    desactivarOverleyCriteriosFormularioSolicitudRevisar,
  } = useModalSolicitudRevicionesStore();
  const {
    activadorModalSolicitudRevicionesMessage,
    desactivarOverleyCriteriosFormularioSolicitudRevisarMessage,
  } = useModalMessageAprovateSolicitudRevicionStore();

  const registroCumplimientoServices = useRef(new RegistroCumplimientoServices());
  const wizardPersistidoRef = useRef<FiscalWizardCookieState | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ModalInformacionSelectedItem | null>(null);
  const [searchText, setSearchText] = useState("");
  const [eventoSeleccionado, setEventoSeleccionado] = useState<RegistroEventoInterface>();
  const [eventoFueraDeCurso, setEventoFueraDeCurso] = useState<RegistroEventoInterface | null>(null);
  const [eventoListoParaContinuar, setEventoListoParaContinuar] = useState(false);
  const [busquedaEventos, setBusquedaEventos] = useState("");

  const [campoSeleccionadoActual, setCampoSeleccionadoActual] = useState<campos>(() => {
    const guardado = leerWizardPersistido();
    wizardPersistidoRef.current = guardado;
    return guardado?.campoSeleccionadoActual ?? "evento";
  });
  const [campoSelecionadoAnterior, setCampoSelecionadoAnterior] = useState<campos>(
    () => wizardPersistidoRef.current?.campoSelecionadoAnterior ?? "",
  );
  const [restaurandoWizard, setRestaurandoWizard] = useState(
    () => wizardPersistidoRef.current !== null,
  );
  const [cookieWizardCargada, setCookieWizardCargada] = useState(false);
  const restauracionWizardCompletadaRef = useRef(!wizardPersistidoRef.current);
  const [enSalaEspera, setEnSalaEspera] = useState(
    () => wizardPersistidoRef.current?.enSalaEspera === true,
  );

  const {
    eventosAsignados,
    eventosAsignadosHoy,
    refrescarEventos,
    refrescandoEventos,
    cargaInicialCompletada,
    errorRefresco,
  } = useEventosAsignadosActualizados({
    autoRefreshIntervalMs: 15000,
    detectarInicioEnAutoRefresh: false,
  });

  const {
    categoriasList,
    cargandoCategorias,
    categoriaSelecionada,
    setcategoriaSelecionada,
    recargarCategorias,
  } = useListaCategoriaFiltro();

  const idEvento = eventoSeleccionado?.idEvento ?? "";
  const idCategoria = categoriaSelecionada?.idCategoria ?? "";
  const filtrosValidos = Boolean(idEvento && idCategoria);

  const { data: resultadosOriginales = [], isFetching } = useQuery({
    queryKey: ["resultados-fiscal", idEvento, idCategoria],
    queryFn: async () => {
      await registroCumplimientoServices.current.initPerfil();
      return registroCumplimientoServices.current.resultadosEventoCategoria(idEvento, idCategoria);
    },
    enabled: filtrosValidos && campoSeleccionadoActual === "resultados",
  });

  const resultados = useMemo(() => {
    const t = searchText.trim().toLowerCase();
    if (!t) return resultadosOriginales;
    return resultadosOriginales.filter((r) => r.nombreBanda.toLowerCase().includes(t));
  }, [resultadosOriginales, searchText]);

  const persistirWizard = useCallback(
    (override?: Partial<FiscalWizardCookieState>) => {
      const pick = <K extends keyof FiscalWizardCookieState>(key: K, fallback: FiscalWizardCookieState[K]) =>
        override && Object.prototype.hasOwnProperty.call(override, key) ? override[key]! : fallback;

      setFiscalWizardCookie({
        idEvento: pick("idEvento", eventoSeleccionado?.idEvento),
        idCategoria: pick("idCategoria", categoriaSelecionada?.idCategoria),
        campoSeleccionadoActual: pick("campoSeleccionadoActual", campoSeleccionadoActual),
        campoSelecionadoAnterior: pick("campoSelecionadoAnterior", campoSelecionadoAnterior),
        enSalaEspera: pick("enSalaEspera", enSalaEspera),
        updatedAt: Date.now(),
      });
    },
    [
      campoSeleccionadoActual,
      campoSelecionadoAnterior,
      categoriaSelecionada?.idCategoria,
      enSalaEspera,
      eventoSeleccionado?.idEvento,
    ],
  );

  useEffect(() => {
    if (!wizardPersistidoRef.current) {
      wizardPersistidoRef.current = readFiscalWizardCookie();
      if (wizardPersistidoRef.current) {
        setRestaurandoWizard(true);
        restauracionWizardCompletadaRef.current = false;
        setCampoSeleccionadoActual(wizardPersistidoRef.current.campoSeleccionadoActual);
        setCampoSelecionadoAnterior(wizardPersistidoRef.current.campoSelecionadoAnterior);
        setEnSalaEspera(wizardPersistidoRef.current.enSalaEspera === true);
      }
    }
    setCookieWizardCargada(true);
    if (!wizardPersistidoRef.current) {
      restauracionWizardCompletadaRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!cookieWizardCargada || !restaurandoWizard || restauracionWizardCompletadaRef.current) return;

    const estado = wizardPersistidoRef.current;
    if (!estado) {
      setRestaurandoWizard(false);
      restauracionWizardCompletadaRef.current = true;
      return;
    }

    const descartarEstadoGuardado = () => {
      deleteFiscalWizardCookie();
      wizardPersistidoRef.current = null;
      setRestaurandoWizard(false);
      restauracionWizardCompletadaRef.current = true;
      setCampoSeleccionadoActual("evento");
      setCampoSelecionadoAnterior("");
      setEventoSeleccionado(undefined);
      setcategoriaSelecionada(undefined);
      setEnSalaEspera(false);
    };

    const completarRestauracion = (paso: campos, anterior: campos) => {
      setCampoSeleccionadoActual(paso);
      setCampoSelecionadoAnterior(anterior);
      wizardPersistidoRef.current = null;
      setRestaurandoWizard(false);
      restauracionWizardCompletadaRef.current = true;
      setFiscalWizardCookie({
        idEvento: eventoSeleccionado?.idEvento ?? estado.idEvento,
        idCategoria: categoriaSelecionada?.idCategoria ?? estado.idCategoria,
        campoSeleccionadoActual: paso,
        campoSelecionadoAnterior: anterior,
        enSalaEspera,
        updatedAt: Date.now(),
      });
    };

    const buscarEventoGuardado = (eventId: string) =>
      eventosAsignadosHoy.find((e) => e.idEvento === eventId) ??
      eventosAsignados.find((e) => e.idEvento === eventId);

    if (!estado.idEvento) {
      descartarEstadoGuardado();
      return;
    }

    if (estado.idEvento && !eventoSeleccionado) {
      if (!cargaInicialCompletada) return;

      const eventoGuardado = buscarEventoGuardado(estado.idEvento);
      if (!eventoGuardado) {
        descartarEstadoGuardado();
        return;
      }

      if (!esEventoDelDia(eventoGuardado.fechaEvento)) {
        descartarEstadoGuardado();
        return;
      }

      if (
        eventoGuardado.estado_evento === "finalizado" ||
        eventoGuardado.estado_evento === "cancelado"
      ) {
        descartarEstadoGuardado();
        return;
      }

      setEventoSeleccionado(eventoGuardado);

      if (
        (eventoGuardado.estado_evento === "pendiente" || estado.enSalaEspera) &&
        !pasoAvanzadoEnWizard(estado)
      ) {
        setEnSalaEspera(true);
        setEventoListoParaContinuar(eventoGuardado.estado_evento === "iniciado");
        completarRestauracion("evento", "");
        return;
      }

      return;
    }

    if (estado.idCategoria && !categoriaSelecionada) {
      if (cargandoCategorias) return;
      if (categoriasList.length === 0) {
        void recargarCategorias();
        if (!cargaInicialCompletada) return;
        completarRestauracion("categoria", "evento");
        return;
      }

      const categoriaGuardada = categoriasList.find((c) => c.idCategoria === estado.idCategoria);
      if (!categoriaGuardada) {
        completarRestauracion("categoria", "evento");
        return;
      }

      setcategoriaSelecionada(categoriaGuardada);
      return;
    }

    const pasoRestaurado: campos =
      estado.campoSeleccionadoActual === "resultados" && !categoriaSelecionada && !estado.idCategoria
        ? "categoria"
        : estado.campoSeleccionadoActual || "evento";

    completarRestauracion(pasoRestaurado, estado.campoSelecionadoAnterior || "");
  }, [
    cargaInicialCompletada,
    cargandoCategorias,
    categoriaSelecionada,
    categoriasList,
    cookieWizardCargada,
    enSalaEspera,
    eventoSeleccionado,
    eventosAsignados,
    eventosAsignadosHoy,
    recargarCategorias,
    restaurandoWizard,
    setcategoriaSelecionada,
  ]);

  useEffect(() => {
    if (restaurandoWizard) return;
    if (!eventoSeleccionado || enSalaEspera || eventoFueraDeCurso) return;
    if (campoSeleccionadoActual === "evento") return;

    const eventoActualizado = eventosAsignados.find((e) => e.idEvento === eventoSeleccionado.idEvento);
    if (!eventoActualizado) return;

    if (eventoActualizado.estado_evento !== "iniciado") {
      setEventoFueraDeCurso(eventoActualizado);
      setEventoSeleccionado(undefined);
      setcategoriaSelecionada(undefined);
      setCampoSeleccionadoActual("evento");
      setCampoSelecionadoAnterior("");
      deleteFiscalWizardCookie();
    } else if (eventoActualizado !== eventoSeleccionado) {
      setEventoSeleccionado(eventoActualizado);
    }
  }, [
    campoSeleccionadoActual,
    enSalaEspera,
    eventoFueraDeCurso,
    eventoSeleccionado,
    eventosAsignados,
    restaurandoWizard,
    setcategoriaSelecionada,
  ]);

  useEffect(() => {
    if (restaurandoWizard) return;
    persistirWizard();
  }, [
    campoSeleccionadoActual,
    campoSelecionadoAnterior,
    categoriaSelecionada?.idCategoria,
    enSalaEspera,
    eventoSeleccionado?.idEvento,
    persistirWizard,
    restaurandoWizard,
  ]);

  useEffect(() => {
    if (campoSeleccionadoActual !== "categoria") return;
    if (cargandoCategorias) return;
    if (categoriasList.length > 0) return;
    void recargarCategorias();
  }, [campoSeleccionadoActual, cargandoCategorias, categoriasList.length, recargarCategorias]);

  useEffect(() => {
    if (!enSalaEspera || !eventoSeleccionado) return;

    const eventoActualizado = eventosAsignados.find((e) => e.idEvento === eventoSeleccionado.idEvento);
    if (!eventoActualizado) return;

    if (eventoActualizado.estado_evento === "iniciado") {
      setEventoSeleccionado(eventoActualizado);
      setEventoListoParaContinuar(true);
      return;
    }

    if (eventoActualizado !== eventoSeleccionado) {
      setEventoSeleccionado(eventoActualizado);
    }
  }, [enSalaEspera, eventoSeleccionado, eventosAsignados]);

  const volverAElegirEvento = useCallback(() => {
    deleteFiscalWizardCookie();
    setEventoSeleccionado(undefined);
    setcategoriaSelecionada(undefined);
    setCampoSeleccionadoActual("evento");
    setCampoSelecionadoAnterior("");
    setEnSalaEspera(false);
    setEventoListoParaContinuar(false);
    setEventoFueraDeCurso(null);
    setSearchText("");
  }, [setcategoriaSelecionada]);

  const continuarDesdeSala = useCallback(() => {
    setEnSalaEspera(false);
    setEventoListoParaContinuar(false);
    setEventoFueraDeCurso(null);
    setCampoSeleccionadoActual("categoria");
    setCampoSelecionadoAnterior("evento");
    persistirWizard({
      campoSeleccionadoActual: "categoria",
      campoSelecionadoAnterior: "evento",
      enSalaEspera: false,
    });
  }, [persistirWizard]);

  const refrescarDesdeSala = async () => {
    await refrescarEventos({ detectarInicio: false });
  };

  const selecionarEvento = (eventId: string) => {
    const eventoElegido = eventosAsignadosHoy.find((e) => e.idEvento === eventId);
    if (!eventoElegido || !puedeElegirEvento(eventoElegido.estado_evento)) return;

    setEventoFueraDeCurso(null);
    setEventoSeleccionado(eventoElegido);
    setcategoriaSelecionada(undefined);
    setSearchText("");

    if (eventoElegido.estado_evento === "pendiente") {
      setEnSalaEspera(true);
      setEventoListoParaContinuar(false);
      setCampoSeleccionadoActual("evento");
      setCampoSelecionadoAnterior("");
      persistirWizard({
        idEvento: eventoElegido.idEvento,
        idCategoria: undefined,
        campoSeleccionadoActual: "evento",
        campoSelecionadoAnterior: "",
        enSalaEspera: true,
      });
      return;
    }

    setEnSalaEspera(false);
    setEventoListoParaContinuar(false);
    setCampoSeleccionadoActual("categoria");
    setCampoSelecionadoAnterior("evento");
    persistirWizard({
      idEvento: eventoElegido.idEvento,
      idCategoria: undefined,
      campoSeleccionadoActual: "categoria",
      campoSelecionadoAnterior: "evento",
      enSalaEspera: false,
    });
  };

  const selecionarCategoria = (idCat: string) => {
    const categoria = categoriasList.find((c) => c.idCategoria === idCat);
    setcategoriaSelecionada(categoria);
    setCampoSeleccionadoActual("resultados");
    setCampoSelecionadoAnterior("categoria");
    setSearchText("");
    persistirWizard({
      idCategoria: categoria?.idCategoria,
      campoSeleccionadoActual: "resultados",
      campoSelecionadoAnterior: "categoria",
    });
  };

  const volverAtras = () => {
    if (campoSelecionadoAnterior === "evento") {
      setEventoSeleccionado(undefined);
      setcategoriaSelecionada(undefined);
      setCampoSelecionadoAnterior("");
      setCampoSeleccionadoActual("evento");
      deleteFiscalWizardCookie();
      return;
    }
    if (campoSelecionadoAnterior === "categoria") {
      setcategoriaSelecionada(undefined);
      setCampoSelecionadoAnterior("evento");
      setCampoSeleccionadoActual("categoria");
      setSearchText("");
      return;
    }
    setCampoSeleccionadoActual(campoSelecionadoAnterior);
  };

  const onDobleClickFila = (resultado: vistaResultadosPreliminaresInterface) => {
    setSelectedRow({ idBanda: resultado.idForaneaBanda, idEvento: resultado.idEvento });
    setModalOpen(true);
  };

  const selectionTrail = [
    eventoSeleccionado?.LugarEvento,
    categoriaSelecionada?.nombreCategoria,
  ].filter((p): p is string => Boolean(p));

  const campoParaMostrar = campoSeleccionadoActual;

  const showWizard = campoParaMostrar !== "" && campoParaMostrar !== "resultados";

  const wizardStepIndex =
    campoParaMostrar === "resultados"
      ? WIZARD_STEPS.length
      : WIZARD_STEPS.findIndex((s) => s.campoKey === campoParaMostrar);

  const wizardCurrentIndex = wizardStepIndex < 0 ? 0 : wizardStepIndex;

  const eventosHoyFiltrados = useMemo(() => {
    return eventosAsignadosHoy.filter(
      (evento) =>
        coincideBusqueda(evento.LugarEvento, busquedaEventos) ||
        coincideBusqueda(evento.tipo_evento, busquedaEventos),
    );
  }, [busquedaEventos, eventosAsignadosHoy]);

  const mostrarSkeleton = filtrosValidos && isFetching && resultadosOriginales.length === 0;

  if (!cargaInicialCompletada || restaurandoWizard) {
    return (
      <div className="flex h-full w-full items-center justify-center px-4">
        <p className="text-center text-slate-300">
          {restaurandoWizard ? "Recuperando tu progreso…" : "Cargando…"}
        </p>
      </div>
    );
  }

  if (
    eventosAsignadosHoy.length === 0 &&
    !enSalaEspera &&
    !eventoFueraDeCurso &&
    !eventoSeleccionado
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

  return (
    <div className="h-full w-full">
      <ApprovateMessage
        open={activadorModalSolicitudRevicionesMessage}
        onClose={() => desactivarOverleyCriteriosFormularioSolicitudRevisarMessage()}
        titulo="Solicitud enviada"
        texto="Su solicitud de revisión ha sido enviada con éxito."
      />
      <ModalFormularioSolicitudRevicion
        open={activadorModalSolicitudReviciones}
        onClose={desactivarOverleyCriteriosFormularioSolicitudRevisar}
      />
      <ModalInformacionResultados
        open={modalOpen}
        selectedItem={modalOpen ? selectedRow : undefined}
        onClose={() => {
          setModalOpen(false);
          setSelectedRow(null);
        }}
      />

      <section id="wizard" className="flex w-full flex-col">
        {campoParaMostrar !== "evento" && (
          <div onClick={volverAtras} className="mb-10 mt-18 cursor-pointer">
            <ArrowLeftIcon className="w-8 text-blue-300" />
          </div>
        )}

        {showWizard && (
          <nav aria-label="Pasos del formulario" className="mt-6 w-full">
            <ol className="flex w-full items-center">
              {WIZARD_STEPS.map((step, i) => {
                const isDone = i < wizardCurrentIndex;
                const isCurrent = campoParaMostrar === step.campoKey;
                const segmentDone = wizardCurrentIndex > i;

                return (
                  <li key={step.campoKey} className="flex min-w-0 flex-1 items-center last:flex-[0_0_auto]">
                    <div className="flex w-full min-w-0 flex-col items-center gap-2">
                      <div
                        className={[
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                          isDone && "border-sky-500/80 bg-sky-500/20 text-sky-100",
                          !isDone && isCurrent && "border-sky-400 bg-slate-800 text-white ring-2 ring-sky-400/35",
                          !isDone && !isCurrent && "border-slate-600 bg-slate-800/60 text-slate-500",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {isDone ? (
                          <CheckIcon className="h-4 w-4" aria-hidden />
                        ) : (
                          <span>{i + 1}</span>
                        )}
                      </div>
                      <span
                        className={[
                          "max-w-[5.5rem] truncate text-center text-[11px] font-medium leading-tight sm:max-w-none sm:text-xs",
                          isCurrent ? "text-slate-100" : isDone ? "text-slate-400" : "text-slate-500",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < WIZARD_STEPS.length - 1 && (
                      <div
                        className={[
                          "mx-1 h-0.5 min-w-[0.5rem] flex-1 rounded-full transition-colors sm:mx-2",
                          segmentDone ? "bg-sky-500/70" : "bg-slate-700",
                        ].join(" ")}
                        aria-hidden
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {selectionTrail.length > 0 && (
          <nav
            aria-label="Selección actual"
            className="mt-4 w-full max-w-full rounded-2xl border border-slate-600/35 bg-slate-800/35 px-4 py-3 backdrop-blur-sm"
          >
            <ol className="flex flex-wrap items-baseline gap-x-0 text-sm">
              {selectionTrail.map((text, i) => (
                <li key={`${i}-${text}`} className="flex items-baseline">
                  {i > 0 && (
                    <span className="mx-2 select-none font-normal text-slate-600" aria-hidden>
                      /
                    </span>
                  )}
                  <span
                    className={
                      i === selectionTrail.length - 1
                        ? "font-semibold tracking-tight text-slate-100"
                        : "font-medium tracking-tight text-slate-400"
                    }
                  >
                    {text}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {campoParaMostrar === "evento" && (
          <div className="mt-6 w-full">
            <h1 className="mb-4 text-3xl font-bold text-slate-300">Eventos de hoy</h1>
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
          </div>
        )}

        {campoParaMostrar === "categoria" && (
          <div className="mt-6 w-full">
            <h2 className="mb-4 text-3xl font-bold text-slate-300">Categorías</h2>
            <div className="flex w-full flex-col gap-4">
              {cargandoCategorias && (
                <p className="rounded-md bg-slate-800/60 p-4 text-slate-300">Cargando categorías…</p>
              )}
              {!cargandoCategorias && categoriasList.length === 0 && (
                <p className="rounded-md bg-slate-800/60 p-4 text-slate-300">
                  No hay categorías disponibles.
                </p>
              )}
              {!cargandoCategorias &&
                categoriasList.map((categoria, index) => (
                  <div
                    key={categoria.idCategoria}
                    onClick={() => selecionarCategoria(categoria.idCategoria)}
                    style={{ animationDelay: `${index * 120}ms` }}
                    className="animate-fade-in h-24 w-full cursor-pointer rounded-md bg-slate-700 p-4 shadow transition-colors duration-300 hover:bg-slate-600"
                  >
                    <h2>{categoria.nombreCategoria}</h2>
                  </div>
                ))}
            </div>
          </div>
        )}

        {campoParaMostrar === "resultados" && (
          <div className="mt-6 w-full pb-16">
            <h1 className="mb-4 text-2xl font-bold">Resultados por evento</h1>
            <BuscadorRow filtrarBuscador={(e) => setSearchText(e.target.value)} />
            <div className="mt-4">
              {mostrarSkeleton ? (
                <SkeletonTabla />
              ) : resultados.length === 0 ? (
                <p className="py-10 text-center text-slate-400">
                  No hay resultados publicados para este evento y categoría todavía.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {resultados.map((resultado) => (
                    <CardRowPosicion
                      key={resultado.idForaneaBanda + resultado.idEvento}
                      resultado={resultado}
                      onVerDetalle={onDobleClickFila}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
