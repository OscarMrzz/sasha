"use client";

import BuscadorRow from "@/components/buscadores/BuscadorRow";
import SelectorLugarCopa from "@/components/copas/SelectorLugarCopa";
import SalaEsperaEvento from "@/components/eventos/SalaEsperaEvento";
import ApprovateMessage from "@/components/Message/ApprovateMessage";
import type {
  bandaInterface,
  categoriaInterface,
  copaInterface,
  RegistroEventoInterface,
} from "@/models";
import { guardarCopasEventoCategoria } from "@/actions/copasAcciones";
import { eventoPermiteEdicionCopas } from "@/helpers/copas/eventoPermiteEdicionCopas";
import { coincideBusqueda } from "@/helpers/busqueda/normalizarTextoBusqueda";
import {
  deleteCopasWizardCookie,
  setCopasWizardCookie,
  type CopasWizardCampo,
  type CopasWizardCookieState,
} from "@/lib/copasWizardPersistence";
import { filtrarEventosDelDia } from "@/helpers/fechas/eventosDelDia";
import { formatearFechaEvento } from "@/helpers/fechas/formatearFechaEvento";
import ConfirmacionAsistenciaServices from "@/services/confirmacionAsistenciaServices";
import CopasServices from "@/services/copasServices";
import { useListaCategoriaFiltro } from "@/hooks/useListaCategoriasFiltro";
import { useBandasStore } from "@/store/BandasStore/listBandaStore";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/16/solid";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type campos = CopasWizardCampo;

type AsignacionDraft = {
  idBanda: string;
  nombreBanda: string;
  lugar: number;
  id_copas?: string;
};

const WIZARD_STEPS: { campoKey: Exclude<campos, "resumen" | "copa" | "">; label: string }[] = [
  { campoKey: "evento", label: "Evento" },
  { campoKey: "categoria", label: "Categoría" },
  { campoKey: "banda", label: "Banda" },
];

const ETIQUETA_ESTADO: Record<RegistroEventoInterface["estado_evento"], string> = {
  pendiente: "Pendiente",
  iniciado: "En curso",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

type Props = {
  eventosFuente: RegistroEventoInterface[];
  cargandoEventos?: boolean;
  /** Si true, solo eventos con fecha de hoy (responsable de mesa). */
  soloEventosDelDia?: boolean;
  /** Si true, solo eventos con estado «iniciado» (en curso). */
  soloEventosIniciados?: boolean;
  /** Título del paso de selección de evento. */
  tituloPasoEventos?: string;
};

export default function WizardAsignarCopas({
  eventosFuente,
  cargandoEventos = false,
  soloEventosDelDia = true,
  soloEventosIniciados = false,
  tituloPasoEventos,
}: Props) {
  const tituloEventos =
    tituloPasoEventos ?? (soloEventosDelDia ? "Eventos del día" : "Eventos");
  const copasServices = useRef(new CopasServices());
  const confirmacionServices = useRef(new ConfirmacionAsistenciaServices());
  const { listBandasStore } = useBandasStore();

  const [campoSeleccionadoActual, setCampoSeleccionadoActual] = useState<campos>("evento");
  const [campoSelecionadoAnterior, setCampoSelecionadoAnterior] = useState<campos>("");
  const [eventoSeleccionado, setEventoSeleccionado] = useState<RegistroEventoInterface>();
  const [bandaSeleccionada, setBandaSeleccionada] = useState<bandaInterface>();
  const [busquedaEventos, setBusquedaEventos] = useState("");
  const [busquedaBandas, setBusquedaBandas] = useState("");
  const [asignaciones, setAsignaciones] = useState<Record<string, AsignacionDraft>>({});
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  const {
    categoriasList,
    cargandoCategorias,
    categoriaSelecionada,
    setcategoriaSelecionada,
  } = useListaCategoriaFiltro();

  const eventosDisponibles = useMemo(() => {
    let lista = eventosFuente;
    if (soloEventosIniciados) {
      lista = lista.filter((e) => e.estado_evento === "iniciado");
    } else {
      lista = lista.filter((e) => eventoPermiteEdicionCopas(e.estado_evento));
    }
    if (soloEventosDelDia) {
      lista = filtrarEventosDelDia(lista);
    }
    return lista;
  }, [eventosFuente, soloEventosDelDia, soloEventosIniciados]);

  const eventosFiltrados = useMemo(
    () =>
      eventosDisponibles.filter(
        (e) =>
          coincideBusqueda(e.LugarEvento, busquedaEventos) ||
          coincideBusqueda(e.tipo_evento ?? "", busquedaEventos),
      ),
    [busquedaEventos, eventosDisponibles],
  );

  const { data: bandasConfirmadas = [], isFetching: cargandoBandas } = useQuery({
    queryKey: ["copas-wizard", "bandas", eventoSeleccionado?.idEvento],
    queryFn: async () => {
      if (!eventoSeleccionado?.idEvento) return [];
      const confirmaciones =
        await confirmacionServices.current.getConfirmacionesPorEvento(
          eventoSeleccionado.idEvento,
        );
      const ids = new Set(
        confirmaciones
          .map((c) => c.id_foranea_banda)
          .filter((id): id is string => Boolean(id?.trim())),
      );
      return listBandasStore
        .filter((b) => ids.has(b.idBanda))
        .sort((a, b) =>
          (a.nombreBanda || "").localeCompare(b.nombreBanda || "", "es", {
            sensitivity: "base",
          }),
        );
    },
    enabled: Boolean(eventoSeleccionado?.idEvento && listBandasStore.length > 0),
  });

  const bandasEnCategoria = useMemo(() => {
    if (!categoriaSelecionada) return [];
    return bandasConfirmadas.filter(
      (b) => b.idForaneaCategoria === categoriaSelecionada.idCategoria,
    );
  }, [bandasConfirmadas, categoriaSelecionada]);

  const bandasFiltradas = useMemo(() => {
    const q = busquedaBandas.trim().toLowerCase();
    if (!q) return bandasEnCategoria;
    return bandasEnCategoria.filter(
      (b) =>
        (b.nombreBanda || "").toLowerCase().includes(q) ||
        (b.AliasBanda ?? "").toLowerCase().includes(q),
    );
  }, [bandasEnCategoria, busquedaBandas]);

  const cargarCopasExistentes = useCallback(async () => {
    if (!eventoSeleccionado?.idEvento || !categoriaSelecionada) return;
    await copasServices.current.initPerfil();
    const copas: copaInterface[] = await copasServices.current.getPorEvento(
      eventoSeleccionado.idEvento,
    );
    const idsCategoria = new Set(bandasEnCategoria.map((b) => b.idBanda));
    const draft: Record<string, AsignacionDraft> = {};
    for (const c of copas) {
      if (!idsCategoria.has(c.id_foranea_banda)) continue;
      const banda = bandasEnCategoria.find((b) => b.idBanda === c.id_foranea_banda);
      draft[c.id_foranea_banda] = {
        idBanda: c.id_foranea_banda,
        nombreBanda: banda?.nombreBanda ?? "Banda",
        lugar: Number(c.lugar),
        id_copas: c.id_copas,
      };
    }
    setAsignaciones(draft);
  }, [eventoSeleccionado?.idEvento, categoriaSelecionada, bandasEnCategoria]);

  useEffect(() => {
    if (campoSeleccionadoActual === "banda" || campoSeleccionadoActual === "resumen") {
      void cargarCopasExistentes();
    }
  }, [campoSeleccionadoActual, cargarCopasExistentes]);

  const persistirWizard = useCallback(
    (override?: Partial<CopasWizardCookieState>) => {
      setCopasWizardCookie({
        idEvento: override?.idEvento ?? eventoSeleccionado?.idEvento,
        idCategoria: override?.idCategoria ?? categoriaSelecionada?.idCategoria,
        idBanda: override?.idBanda ?? bandaSeleccionada?.idBanda,
        campoSeleccionadoActual:
          override?.campoSeleccionadoActual ?? campoSeleccionadoActual,
        campoSelecionadoAnterior:
          override?.campoSelecionadoAnterior ?? campoSelecionadoAnterior,
        updatedAt: Date.now(),
      });
    },
    [
      bandaSeleccionada?.idBanda,
      campoSeleccionadoActual,
      campoSelecionadoAnterior,
      categoriaSelecionada?.idCategoria,
      eventoSeleccionado?.idEvento,
    ],
  );

  const seleccionarEvento = (evento: RegistroEventoInterface) => {
    if (!eventoPermiteEdicionCopas(evento.estado_evento)) return;
    setEventoSeleccionado(evento);
    setcategoriaSelecionada(undefined);
    setBandaSeleccionada(undefined);
    setAsignaciones({});
    setCampoSeleccionadoActual("categoria");
    setCampoSelecionadoAnterior("evento");
    persistirWizard({
      idEvento: evento.idEvento,
      idCategoria: undefined,
      idBanda: undefined,
      campoSeleccionadoActual: "categoria",
      campoSelecionadoAnterior: "evento",
    });
  };

  const seleccionarCategoria = (cat: categoriaInterface) => {
    setcategoriaSelecionada(cat);
    setBandaSeleccionada(undefined);
    setAsignaciones({});
    setCampoSeleccionadoActual("banda");
    setCampoSelecionadoAnterior("categoria");
    persistirWizard({
      idCategoria: cat.idCategoria,
      idBanda: undefined,
      campoSeleccionadoActual: "banda",
      campoSelecionadoAnterior: "categoria",
    });
  };

  const seleccionarBanda = (banda: bandaInterface) => {
    setBandaSeleccionada(banda);
    setCampoSeleccionadoActual("copa");
    setCampoSelecionadoAnterior("banda");
    persistirWizard({
      idBanda: banda.idBanda,
      campoSeleccionadoActual: "copa",
      campoSelecionadoAnterior: "banda",
    });
  };

  const seleccionarLugar = (lugar: number) => {
    if (!bandaSeleccionada) return;
    setAsignaciones((prev) => ({
      ...prev,
      [bandaSeleccionada.idBanda]: {
        idBanda: bandaSeleccionada.idBanda,
        nombreBanda: bandaSeleccionada.nombreBanda,
        lugar,
        id_copas: prev[bandaSeleccionada.idBanda]?.id_copas,
      },
    }));
    setBandaSeleccionada(undefined);
    setCampoSeleccionadoActual("banda");
    setCampoSelecionadoAnterior("copa");
    persistirWizard({
      idBanda: undefined,
      campoSeleccionadoActual: "banda",
      campoSelecionadoAnterior: "copa",
    });
  };

  const irAResumen = () => {
    const lista = Object.values(asignaciones);
    if (!lista.length) {
      setErrorMensaje("Asigna al menos una copa antes de ver el resumen.");
      return;
    }
    setErrorMensaje(null);
    setCampoSeleccionadoActual("resumen");
    setCampoSelecionadoAnterior("banda");
    persistirWizard({
      campoSeleccionadoActual: "resumen",
      campoSelecionadoAnterior: "banda",
    });
  };

  const confirmarGuardado = async () => {
    if (!eventoSeleccionado || !categoriaSelecionada) return;
    setGuardando(true);
    setErrorMensaje(null);
    try {
      await guardarCopasEventoCategoria(
        eventoSeleccionado.idEvento,
        categoriaSelecionada.idCategoria,
        Object.values(asignaciones).map((a) => ({
          id_foranea_banda: a.idBanda,
          lugar: a.lugar,
          id_copas: a.id_copas,
          tipo: "directo",
        })),
      );
      setMensajeExito(true);
      deleteCopasWizardCookie();
      setCampoSeleccionadoActual("evento");
      setCampoSelecionadoAnterior("");
      setEventoSeleccionado(undefined);
      setcategoriaSelecionada(undefined);
      setBandaSeleccionada(undefined);
      setAsignaciones({});
    } catch (e) {
      setErrorMensaje(e instanceof Error ? e.message : "Error al guardar copas.");
    } finally {
      setGuardando(false);
    }
  };

  const volverAtras = () => {
    setErrorMensaje(null);
    if (campoSeleccionadoActual === "resumen") {
      setCampoSeleccionadoActual("banda");
      setCampoSelecionadoAnterior("categoria");
      return;
    }
    if (campoSeleccionadoActual === "copa") {
      setBandaSeleccionada(undefined);
      setCampoSeleccionadoActual("banda");
      setCampoSelecionadoAnterior("categoria");
      return;
    }
    if (campoSeleccionadoActual === "banda") {
      setcategoriaSelecionada(undefined);
      setAsignaciones({});
      setCampoSeleccionadoActual("categoria");
      setCampoSelecionadoAnterior("evento");
      return;
    }
    if (campoSeleccionadoActual === "categoria") {
      setEventoSeleccionado(undefined);
      setCampoSeleccionadoActual("evento");
      setCampoSelecionadoAnterior("");
      deleteCopasWizardCookie();
    }
  };

  const lugaresOcupadosOtros = useMemo(() => {
    if (!bandaSeleccionada) return [];
    return Object.values(asignaciones)
      .filter((a) => a.idBanda !== bandaSeleccionada.idBanda)
      .map((a) => a.lugar);
  }, [asignaciones, bandaSeleccionada]);

  const lugarActualBanda =
    bandaSeleccionada != null
      ? (asignaciones[bandaSeleccionada.idBanda]?.lugar ?? null)
      : null;

  const resumenOrdenado = useMemo(
    () =>
      Object.values(asignaciones).sort((a, b) => a.lugar - b.lugar),
    [asignaciones],
  );

  const campoParaMostrar = campoSeleccionadoActual;
  const showWizard =
    campoParaMostrar !== "" &&
    campoParaMostrar !== "resumen" &&
    campoParaMostrar !== "copa";
  const wizardStepIndex = WIZARD_STEPS.findIndex((s) => s.campoKey === campoParaMostrar);
  const wizardCurrentIndex = wizardStepIndex < 0 ? 0 : wizardStepIndex;

  if (cargandoEventos) {
    return (
      <p className="text-center text-slate-300">Cargando eventos…</p>
    );
  }

  if (!eventosDisponibles.length && campoParaMostrar === "evento") {
    return (
      <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-slate-400">
        {soloEventosDelDia && soloEventosIniciados
          ? "No hay eventos activos hoy. Solo aparecen eventos del día en curso (iniciados)."
          : soloEventosDelDia
            ? "No hay eventos del día disponibles para asignar copas."
            : "No hay eventos disponibles para asignar copas."}
      </p>
    );
  }

  if (
    eventoSeleccionado &&
    !eventoPermiteEdicionCopas(eventoSeleccionado.estado_evento)
  ) {
    return (
      <SalaEsperaEvento
        modo="evento-no-disponible"
        estadoEvento={eventoSeleccionado.estado_evento}
        nombreEvento={eventoSeleccionado.LugarEvento}
        onVolver={() => {
          setEventoSeleccionado(undefined);
          setCampoSeleccionadoActual("evento");
        }}
      />
    );
  }

  return (
    <div className="h-full w-full">
      <ApprovateMessage
        open={mensajeExito}
        onClose={() => setMensajeExito(false)}
        titulo="Copas guardadas"
        texto="Las copas se registraron correctamente."
      />

      {errorMensaje && (
        <p className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
          {errorMensaje}
        </p>
      )}

      {campoParaMostrar !== "evento" && (
        <button
          type="button"
          onClick={volverAtras}
          className="mb-6 mt-4 cursor-pointer"
          aria-label="Volver"
        >
          <ArrowLeftIcon className="h-8 w-8 text-blue-300" />
        </button>
      )}

      {showWizard && (
        <nav aria-label="Pasos" className="mb-8 w-full">
          <ol className="flex w-full items-center">
            {WIZARD_STEPS.map((step, i) => {
              const isDone = i < wizardCurrentIndex;
              const isCurrent = campoParaMostrar === step.campoKey;
              const segmentDone = wizardCurrentIndex > i;
              return (
                <li
                  key={step.campoKey}
                  className="flex min-w-0 flex-1 items-center last:flex-[0_0_auto]"
                >
                  <div className="flex w-full min-w-0 flex-col items-center gap-2">
                    <div
                      className={[
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                        isDone && "border-sky-500/80 bg-sky-500/20 text-sky-100",
                        !isDone &&
                          isCurrent &&
                          "border-sky-400 bg-slate-800 text-white ring-2 ring-sky-400/35",
                        !isDone &&
                          !isCurrent &&
                          "border-slate-600 bg-slate-800/60 text-slate-500",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {isDone ? <CheckIcon className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className="text-center text-[10px] text-slate-400 sm:text-xs">
                      {step.label}
                    </span>
                  </div>
                  {i < WIZARD_STEPS.length - 1 && (
                    <div
                      className={`mx-1 h-0.5 min-w-[12px] flex-1 ${segmentDone ? "bg-sky-500/70" : "bg-slate-600"}`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {campoParaMostrar === "evento" && (
        <div className="w-full">
          <h2 className="mb-4 text-3xl font-bold text-slate-300">{tituloEventos}</h2>
          <div className="mb-4">
            <BuscadorRow
              filtrarBuscador={(e) => setBusquedaEventos(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-4">
            {eventosFiltrados.map((evento, index) => (
              <button
                key={evento.idEvento}
                type="button"
                onClick={() => seleccionarEvento(evento)}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-fade-in w-full cursor-pointer rounded-md bg-slate-700 p-4 text-left shadow transition-colors hover:bg-slate-600"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-100">{evento.LugarEvento}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {formatearFechaEvento(evento.fechaEvento)} · {evento.tipo_evento}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
                    {ETIQUETA_ESTADO[evento.estado_evento]}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {campoParaMostrar === "categoria" && (
        <div className="w-full">
          <h2 className="mb-4 text-3xl font-bold text-slate-300">Categoría</h2>
          <div className="flex flex-col gap-4">
            {cargandoCategorias && (
              <p className="text-slate-400">Cargando categorías…</p>
            )}
            {!cargandoCategorias &&
              categoriasList.map((cat, index) => (
                <button
                  key={cat.idCategoria}
                  type="button"
                  onClick={() => seleccionarCategoria(cat)}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="animate-fade-in h-24 w-full cursor-pointer rounded-md bg-slate-700 p-4 text-left text-xl font-semibold shadow hover:bg-slate-600"
                >
                  {cat.nombreCategoria}
                </button>
              ))}
          </div>
        </div>
      )}

      {campoParaMostrar === "banda" && (
        <div className="w-full">
          <h2 className="mb-4 text-3xl font-bold text-slate-300">Bandas</h2>
          <p className="mb-4 text-sm text-slate-400">
            {categoriaSelecionada?.nombreCategoria} · {eventoSeleccionado?.LugarEvento}
          </p>
          <div className="mb-4">
            <BuscadorRow
              filtrarBuscador={(e) => setBusquedaBandas(e.target.value)}
            />
          </div>
          {cargandoBandas ? (
            <p className="text-slate-400">Cargando bandas…</p>
          ) : !bandasFiltradas.length ? (
            <p className="rounded-md bg-slate-800/60 p-4 text-slate-300">
              No hay bandas confirmadas en esta categoría para el evento.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {bandasFiltradas.map((banda, index) => {
                const asig = asignaciones[banda.idBanda];
                return (
                  <button
                    key={banda.idBanda}
                    type="button"
                    onClick={() => seleccionarBanda(banda)}
                    style={{ animationDelay: `${index * 80}ms` }}
                    className="animate-fade-in flex w-full items-center justify-between rounded-md bg-slate-700 p-4 text-left hover:bg-slate-600"
                  >
                    <span className="text-lg font-semibold">{banda.nombreBanda}</span>
                    {asig ? (
                      <span className="rounded-full bg-amber-500/25 px-3 py-1 text-sm font-bold text-amber-100">
                        {asig.lugar}º lugar
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">Sin copa</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={irAResumen}
            disabled={!Object.keys(asignaciones).length}
            className="mt-8 w-full rounded-xl bg-sky-600 py-4 text-lg font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Ver resumen y confirmar
          </button>
        </div>
      )}

      {campoParaMostrar === "copa" && bandaSeleccionada && (
        <div className="w-full">
          <h2 className="mb-2 text-3xl font-bold text-slate-300">Copa</h2>
          <p className="mb-6 text-lg text-slate-200">{bandaSeleccionada.nombreBanda}</p>
          <SelectorLugarCopa
            lugarSeleccionado={lugarActualBanda}
            lugaresOcupados={lugaresOcupadosOtros}
            onSeleccionar={seleccionarLugar}
          />
        </div>
      )}

      {campoParaMostrar === "resumen" && (
        <div className="w-full">
          <h2 className="mb-4 text-3xl font-bold text-slate-300">Resumen</h2>
          <p className="mb-6 text-sm text-slate-400">
            {eventoSeleccionado?.LugarEvento} · {categoriaSelecionada?.nombreCategoria}
          </p>
          <ul className="mb-8 flex flex-col gap-3">
            {resumenOrdenado.map((a) => (
              <li
                key={a.idBanda}
                className="rounded-lg border border-slate-600/50 bg-slate-800/80 px-4 py-3"
              >
                <span className="font-bold text-amber-200">{a.lugar}º lugar</span>
                <span className="mx-2 text-slate-500">—</span>
                <span className="text-slate-100">{a.nombreBanda}</span>
                <span className="ml-2 text-sm text-slate-400">
                  ({categoriaSelecionada?.nombreCategoria})
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={volverAtras}
              disabled={guardando}
              className="flex-1 rounded-xl border border-slate-500 py-4 font-semibold text-slate-200"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void confirmarGuardado()}
              disabled={guardando}
              className="flex-1 rounded-xl bg-emerald-600 py-4 font-bold text-white disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Confirmar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
