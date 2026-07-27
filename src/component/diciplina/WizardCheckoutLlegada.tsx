"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckIcon } from "@heroicons/react/24/outline";
import BuscadorRow from "@/component/buscadores/BuscadorRow";
import {
  combinarFechaHoyConHora,
  fechaHoyISO,
  horaActualISO,
  horaActualParaInput,
  normalizarFechaEvento,
} from "@/component/diciplina/checkoutUtils";
import {
  bandaInterface,
  categoriaInterface,
  registroEventoDatosAmpleosInterface,
} from "@/interfaces/interfaces";
import BandasServices from "@/lib/services/bandasServices";
import CategoriasServices from "@/lib/services/categoriaServices";
import ConfirmacionAsistenciaServices from "@/lib/services/confirmacionAsistenciaServices";
import {
  createCheckoutLlegada,
  getAllCheckoutByEvento,
} from "@/lib/services/chekoutServices";
import { useCheckoutRealtime } from "@/hooks/checkout";
import { cn } from "@/lib/utils";

const WIZARD_PASOS = [
  { label: "Evento" },
  { label: "Categoría" },
  { label: "Banda" },
  { label: "Llegada" },
] as const;

type PasoWizard = 0 | 1 | 2 | 3;

type Props = {
  hoy: string;
  eventosHoy: registroEventoDatosAmpleosInterface[];
  idPerfilDisciplina: string;
  onSuccess: (mensaje: string) => void;
  onError: (msg: string) => void;
  onRegistroGuardado?: () => void;
};

const inputClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100";

export default function WizardCheckoutLlegada({
  hoy,
  eventosHoy,
  idPerfilDisciplina,
  onSuccess,
  onError,
  onRegistroGuardado,
}: Props) {
  const queryClient = useQueryClient();
  const [paso, setPaso] = useState<PasoWizard>(0);
  const [idEvento, setIdEvento] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [idBanda, setIdBanda] = useState("");
  const [busquedaBanda, setBusquedaBanda] = useState("");
  const [categorias, setCategorias] = useState<categoriaInterface[]>([]);
  const [bandas, setBandas] = useState<bandaInterface[]>([]);
  const [idsBandaConCheckout, setIdsBandaConCheckout] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [horaLlegada, setHoraLlegada] = useState(horaActualParaInput);

  const eventoSeleccionado = eventosHoy.find((e) => e.idEvento === idEvento);
  const categoriaSeleccionada = categorias.find((c) => c.idCategoria === idCategoria);
  const bandaSeleccionada = bandas.find((b) => b.idBanda === idBanda);

  useEffect(() => {
    if (eventosHoy.length === 1 && !idEvento) {
      setIdEvento(eventosHoy[0].idEvento);
    }
  }, [eventosHoy, idEvento]);

  const cargarDatosEvento = useCallback(async () => {
    if (!idEvento) {
      setCategorias([]);
      setBandas([]);
      setIdsBandaConCheckout(new Set());
      return;
    }

    setCargando(true);
    try {
      const catSvc = new CategoriasServices();
      await catSvc.initPerfil();
      const bandasSvc = new BandasServices();
      await bandasSvc.initPerfil();
      const confSvc = new ConfirmacionAsistenciaServices();
      const todasBandas = (await bandasSvc.get()) ?? [];
      const [cats, bandasConfirmadas, checkoutsEvento] = await Promise.all([
        catSvc.get(),
        confSvc.getBandasConfirmadasParaEvento(idEvento, todasBandas),
        getAllCheckoutByEvento(idEvento),
      ]);
      setCategorias((cats ?? []) as categoriaInterface[]);
      setBandas(bandasConfirmadas);
      setIdsBandaConCheckout(
        new Set(
          checkoutsEvento
            .map((c) => c.id_foranea_banda)
            .filter((id): id is string => Boolean(id)),
        ),
      );
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "No se pudieron cargar los datos del evento.";
      onError(msg);
    } finally {
      setCargando(false);
    }
  }, [idEvento, onError]);

  useEffect(() => {
    void cargarDatosEvento();
  }, [cargarDatosEvento]);

  useCheckoutRealtime({
    queryClient,
    idEvento: idEvento || undefined,
    onCheckoutChange: () => {
      void cargarDatosEvento();
    },
  });

  const bandasDisponibles = useMemo(
    () => bandas.filter((b) => !idsBandaConCheckout.has(b.idBanda)),
    [bandas, idsBandaConCheckout],
  );

  const categoriasDisponibles = useMemo(() => {
    const idsCat = new Set(bandasDisponibles.map((b) => b.idForaneaCategoria));
    return categorias
      .filter((c) => idsCat.has(c.idCategoria))
      .sort((a, b) => a.nombreCategoria.localeCompare(b.nombreCategoria));
  }, [bandasDisponibles, categorias]);

  const bandasPorCategoria = useMemo(() => {
    if (!idCategoria) return [];
    const q = busquedaBanda.trim().toLowerCase();
    return bandasDisponibles
      .filter((b) => b.idForaneaCategoria === idCategoria)
      .filter(
        (b) =>
          !q ||
          b.nombreBanda.toLowerCase().includes(q) ||
          (b.AliasBanda ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) => a.nombreBanda.localeCompare(b.nombreBanda));
  }, [bandasDisponibles, idCategoria, busquedaBanda]);

  const puedeAvanzar = useMemo(() => {
    if (paso === 0) return Boolean(idEvento);
    if (paso === 1) return Boolean(idCategoria);
    if (paso === 2) return Boolean(idBanda);
    return false;
  }, [paso, idEvento, idCategoria, idBanda]);

  const seleccionarEvento = (id: string) => {
    setIdEvento(id);
    setIdCategoria("");
    setIdBanda("");
    setBusquedaBanda("");
  };

  const seleccionarCategoria = (id: string) => {
    setIdCategoria(id);
    setIdBanda("");
    setBusquedaBanda("");
  };

  const reiniciar = () => {
    setPaso(0);
    setIdCategoria("");
    setIdBanda("");
    setBusquedaBanda("");
    setHoraLlegada(horaActualParaInput());
    if (eventosHoy.length === 1) {
      setIdEvento(eventosHoy[0].idEvento);
    } else {
      setIdEvento("");
    }
  };

  const avanzar = () => {
    if (paso === 0 && !idEvento) {
      onError("Selecciona un evento.");
      return;
    }
    if (paso === 1 && !idCategoria) {
      onError("Selecciona una categoría.");
      return;
    }
    if (paso === 2 && !idBanda) {
      onError("Selecciona una banda.");
      return;
    }
    if (paso < 3) setPaso((p) => (p + 1) as PasoWizard);
  };

  const retroceder = () => {
    if (paso > 0) setPaso((p) => (p - 1) as PasoWizard);
  };

  const guardar = async () => {
    if (!idEvento || !idBanda) {
      onError("Completa evento y banda.");
      return;
    }
    if (!horaLlegada.trim()) {
      onError("Indica la hora de llegada.");
      return;
    }
    if (idsBandaConCheckout.has(idBanda)) {
      onError("Esta banda ya tiene llegada registrada en este evento.");
      return;
    }

    setGuardando(true);
    try {
      await createCheckoutLlegada({
        id_foranea_banda: idBanda,
        hora_llegada_banda: combinarFechaHoyConHora(horaLlegada),
        id_foranea_diciplina: idPerfilDisciplina,
        time_envio_confirmacion_llegada: horaActualISO(),
        id_foranea_evento: idEvento,
      });
      onSuccess("Llegada registrada. Se notificó al dirigente.");
      onRegistroGuardado?.();
      reiniciar();
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "No se pudo registrar la llegada.";
      onError(msg);
    } finally {
      setGuardando(false);
    }
  };

  const renderProgreso = () => (
    <nav aria-label="Pasos checkout llegada" className="mb-6 w-full">
      <ol className="flex w-full items-center">
        {WIZARD_PASOS.map((step, i) => {
          const isDone = i < paso;
          const isCurrent = paso === i;
          return (
            <li
              key={step.label}
              className="flex min-w-0 flex-1 items-center last:flex-[0_0_auto]"
            >
              <div className="flex w-full min-w-0 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    isDone && "border-[#00b4d8]/80 bg-[#00b4d8]/20 text-[#00b4d8]",
                    isCurrent &&
                      "border-[#00b4d8] bg-slate-800 text-white ring-2 ring-[#00b4d8]/35",
                    !isDone &&
                      !isCurrent &&
                      "border-slate-600 bg-slate-800/60 text-slate-500",
                  )}
                >
                  {isDone ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className="text-center text-[10px] text-slate-400 sm:text-xs">
                  {step.label}
                </span>
              </div>
              {i < WIZARD_PASOS.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 min-w-[8px] flex-1",
                    i < paso ? "bg-[#00b4d8]/70" : "bg-slate-600",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  const renderContexto = () => {
    const partes: string[] = [];
    if (eventoSeleccionado) partes.push(eventoSeleccionado.LugarEvento);
    if (categoriaSeleccionada) partes.push(categoriaSeleccionada.nombreCategoria);
    if (bandaSeleccionada) partes.push(bandaSeleccionada.nombreBanda);
    if (!partes.length) return null;
    return <p className="mb-4 text-sm text-slate-400">{partes.join(" · ")}</p>;
  };

  const renderPaso = () => {
    if (paso === 0) {
      return (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-white">Evento de hoy ({hoy})</h3>
          <p className="text-sm text-slate-400">Selecciona el evento donde registrarás la llegada.</p>
          <div className="max-h-[45vh] flex flex-col gap-2 overflow-y-auto pr-1">
            {eventosHoy.map((evento) => (
              <button
                key={evento.idEvento}
                type="button"
                onClick={() => seleccionarEvento(evento.idEvento)}
                className={cn(
                  "w-full rounded-lg p-3 text-left transition-colors",
                  idEvento === evento.idEvento
                    ? "bg-[#00b4d8] ring-2 ring-[#00b4d8]/60"
                    : "bg-slate-700 hover:bg-slate-600",
                )}
              >
                <span className="font-semibold text-white">{evento.LugarEvento}</span>
                <p className="mt-1 text-xs text-slate-300">
                  {normalizarFechaEvento(evento.fechaEvento)} ·{" "}
                  {evento.regiones?.nombreRegion ?? "—"}
                </p>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (paso === 1) {
      return (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-white">Categoría</h3>
          {renderContexto()}
          {cargando ? (
            <p className="text-slate-400">Cargando categorías…</p>
          ) : categoriasDisponibles.length === 0 ? (
            <p className="rounded-lg bg-slate-800/60 p-4 text-sm text-slate-300">
              No hay categorías con bandas confirmadas pendientes de llegada en este evento.
            </p>
          ) : (
            <div className="max-h-[45vh] flex flex-col gap-2 overflow-y-auto pr-1">
              {categoriasDisponibles.map((cat) => (
                <button
                  key={cat.idCategoria}
                  type="button"
                  onClick={() => seleccionarCategoria(cat.idCategoria)}
                  className={cn(
                    "w-full rounded-lg p-3 text-left text-base font-semibold transition-colors",
                    idCategoria === cat.idCategoria
                      ? "bg-[#00b4d8] ring-2 ring-[#00b4d8]/60"
                      : "bg-slate-700 hover:bg-slate-600 text-white",
                  )}
                >
                  {cat.nombreCategoria}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (paso === 2) {
      return (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-white">Banda</h3>
          {renderContexto()}
          <p className="text-sm text-slate-400">
            Bandas confirmadas para este evento en la categoría elegida (sin filtrar por región).
          </p>
          <BuscadorRow filtrarBuscador={(e) => setBusquedaBanda(e.target.value)} />
          {cargando ? (
            <p className="text-slate-400">Cargando bandas…</p>
          ) : bandasPorCategoria.length === 0 ? (
            <p className="rounded-lg bg-slate-800/60 p-4 text-sm text-slate-300">
              No hay bandas confirmadas en esta categoría sin llegada registrada.
            </p>
          ) : (
            <div className="max-h-[40vh] flex flex-col gap-2 overflow-y-auto pr-1">
              {bandasPorCategoria.map((banda) => (
                <button
                  key={banda.idBanda}
                  type="button"
                  onClick={() => setIdBanda(banda.idBanda)}
                  className={cn(
                    "w-full rounded-lg p-3 text-left transition-colors",
                    idBanda === banda.idBanda
                      ? "bg-[#00b4d8] ring-2 ring-[#00b4d8]/60"
                      : "bg-slate-700 hover:bg-slate-600",
                  )}
                >
                  <span className="font-semibold text-white">{banda.nombreBanda}</span>
                  {banda.AliasBanda ? (
                    <p className="text-xs text-slate-400">{banda.AliasBanda}</p>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-white">Registrar llegada</h3>
        {renderContexto()}
       
        <div>
          <label className="mb-1 block text-xs uppercase text-slate-400">Hora de llegada</label>
          <input
            type="time"
            className={inputClass}
            value={horaLlegada}
            onChange={(e) => setHoraLlegada(e.target.value)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-slate-600/80 bg-slate-800/40 p-4 sm:p-6">
      {renderProgreso()}
      {renderPaso()}
      <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-slate-600 pt-4">
        <button
          type="button"
          disabled={paso === 0 || guardando}
          onClick={retroceder}
          className="rounded-lg border border-slate-500 px-4 py-2 text-white hover:bg-slate-600 disabled:opacity-40"
        >
          Atrás
        </button>
        <div className="flex gap-3">
          {paso < 3 ? (
            <button
              type="button"
              disabled={!puedeAvanzar || cargando || guardando}
              onClick={avanzar}
              className="rounded-lg bg-[#00b4d8] px-4 py-2 font-semibold text-white hover:bg-[#0096b8] disabled:opacity-50"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="button"
              disabled={guardando || !idBanda}
              onClick={() => void guardar()}
              className="rounded-lg bg-[#00b4d8] px-4 py-2 font-semibold text-white hover:bg-[#0096b8] disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Registrar llegada"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
