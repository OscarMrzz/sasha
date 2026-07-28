"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckIcon } from "@heroicons/react/24/outline";
import BuscadorRow from "@/components/buscadores/BuscadorRow";
import {
  combinarFechaHoyConHora,
  esPendienteRegistroIngreso,
  fechaHoyISO,
  formatCheckoutFechaHora,
  horaActualISO,
  horaActualParaInput,
  normalizarFechaEvento,
} from "@/components/diciplina/checkoutUtils";
import {
  CheckoutDetalleInterface,
  registroEventoDatosAmpleosInterface,
} from "@/models";
import {
  getCheckoutPendientesEntrada,
  updateCheckoutIngreso,
} from "@/services/chekoutServices";
import BandasServices from "@/services/bandasServices";
import { useCheckoutRealtime } from "@/hooks/checkout";
import { cn } from "@/lib/utils";

const WIZARD_PASOS = [
  { label: "Evento" },
  { label: "Banda" },
  { label: "Ingreso" },
] as const;

type PasoWizard = 0 | 1 | 2;

type Props = {
  hoy: string;
  eventosHoy: registroEventoDatosAmpleosInterface[];
  onSuccess: (mensaje: string) => void;
  onError: (msg: string) => void;
  onRegistroGuardado?: () => void;
};

const inputClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100";

export default function WizardCheckoutEntrada({
  hoy,
  eventosHoy,
  onSuccess,
  onError,
  onRegistroGuardado,
}: Props) {
  const queryClient = useQueryClient();
  const [paso, setPaso] = useState<PasoWizard>(0);
  const [idEvento, setIdEvento] = useState("");
  const [checkoutSeleccionado, setCheckoutSeleccionado] =
    useState<CheckoutDetalleInterface | null>(null);
  const [busquedaBanda, setBusquedaBanda] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [cantidadIntegrantes, setCantidadIntegrantes] = useState("");
  const [cantidadPalillonas, setCantidadPalillonas] = useState("");
  const [aportacion, setAportacion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [horaIngreso, setHoraIngreso] = useState(horaActualParaInput);

  const bandasServices = useRef(new BandasServices());

  const { data: bandasFederacion = [] } = useQuery({
    queryKey: ["wizard-checkout-entrada", "bandas"],
    queryFn: async () => {
      await bandasServices.current.initPerfil();
      return bandasServices.current.getDatosAmpleos();
    },
  });

  const aliasPorIdBanda = useMemo(
    () =>
      new Map(
        bandasFederacion.map((b) => [b.idBanda, b.AliasBanda ?? ""] as const),
      ),
    [bandasFederacion],
  );

  const eventoSeleccionado = eventosHoy.find((e) => e.idEvento === idEvento);

  useEffect(() => {
    if (eventosHoy.length === 1 && !idEvento) {
      setIdEvento(eventosHoy[0].idEvento);
    }
  }, [eventosHoy, idEvento]);

  const {
    data: checkoutsPendientes = [],
    isPending: cargandoPendientes,
    isFetching: refrescandoPendientes,
  } = useQuery({
    queryKey: ["checkout-entrada", idEvento],
    queryFn: async () => {
      const lista = await getCheckoutPendientesEntrada(idEvento);
      return lista.filter((r) =>
        esPendienteRegistroIngreso(r.time_envio_confirmacion_ingreso),
      );
    },
    enabled: Boolean(idEvento),
  });

  const cargando = cargandoPendientes || refrescandoPendientes;

  useCheckoutRealtime({
    queryClient,
    idEvento: idEvento || undefined,
  });

  const checkoutsFiltrados = useMemo(() => {
    const soloPendientes = checkoutsPendientes.filter((r) =>
      esPendienteRegistroIngreso(r.time_envio_confirmacion_ingreso),
    );
    const q = busquedaBanda.trim().toLowerCase();
    if (!q) return soloPendientes;
    return soloPendientes.filter(
      (r) =>
        (r.nombreBanda ?? "").toLowerCase().includes(q) ||
        (r.nombreCategoria ?? "").toLowerCase().includes(q) ||
        (aliasPorIdBanda.get(r.id_foranea_banda ?? "") ?? "")
          .toLowerCase()
          .includes(q),
    );
  }, [checkoutsPendientes, busquedaBanda, aliasPorIdBanda]);

  const puedeAvanzar = useMemo(() => {
    if (paso === 0) return Boolean(idEvento);
    if (paso === 1) return Boolean(checkoutSeleccionado?.id_checkout);
    return false;
  }, [paso, idEvento, checkoutSeleccionado]);

  const seleccionarEvento = (id: string) => {
    setIdEvento(id);
    setCheckoutSeleccionado(null);
    setBusquedaBanda("");
  };

  const seleccionarCheckout = (registro: CheckoutDetalleInterface) => {
    setCheckoutSeleccionado(registro);
    setCantidadIntegrantes(registro.cantidad_integrantes?.toString() ?? "");
    setCantidadPalillonas(registro.cantidad_palillonas?.toString() ?? "");
    setAportacion(registro.aportacion?.toString() ?? "");
    setObservaciones(registro.observaciones ?? "");
    setHoraIngreso(horaActualParaInput());
  };

  const reiniciar = () => {
    setPaso(0);
    setCheckoutSeleccionado(null);
    setBusquedaBanda("");
    setCantidadIntegrantes("");
    setCantidadPalillonas("");
    setAportacion("");
    setObservaciones("");
    setHoraIngreso(horaActualParaInput());
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
    if (paso === 1) {
      if (!checkoutSeleccionado?.id_checkout) {
        onError("Selecciona una banda con llegada confirmada.");
        return;
      }
    }
    if (paso < 2) setPaso((p) => (p + 1) as PasoWizard);
  };

  const retroceder = () => {
    if (paso > 0) setPaso((p) => (p - 1) as PasoWizard);
  };

  const guardar = async () => {
    const idCheckout = checkoutSeleccionado?.id_checkout;
    if (!idCheckout) {
      onError("Selecciona una banda válida.");
      return;
    }

    const integrantes = Number(cantidadIntegrantes);
    const palillonas = Number(cantidadPalillonas);
    const aport = Number(aportacion);
    if (!Number.isFinite(integrantes) || integrantes < 0) {
      onError("Indica cantidad de integrantes válida.");
      return;
    }
    if (!Number.isFinite(palillonas) || palillonas < 0) {
      onError("Indica cantidad de palillonas válida.");
      return;
    }
    if (!Number.isFinite(aport) || aport < 0) {
      onError("Indica aportación válida.");
      return;
    }
    if (!horaIngreso.trim()) {
      onError("Indica la hora de ingreso.");
      return;
    }

    setGuardando(true);
    try {
      await updateCheckoutIngreso(idCheckout, {
        hora_ingreso: combinarFechaHoyConHora(horaIngreso),
        cantidad_integrantes: integrantes,
        cantidad_palillonas: palillonas,
        aportacion: aport,
        observaciones: observaciones.trim() || undefined,
        time_envio_confirmacion_ingreso: horaActualISO(),
      });
      onSuccess("Ingreso registrado. Se notificó al dirigente.");
      onRegistroGuardado?.();
      const eventoActivo = idEvento;
      reiniciar();
      if (eventoActivo) {
        await queryClient.invalidateQueries({
          queryKey: ["checkout-entrada", eventoActivo],
        });
      }
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "No se pudo registrar el ingreso.";
      onError(msg);
    } finally {
      setGuardando(false);
    }
  };

  const renderProgreso = () => (
    <nav aria-label="Pasos checkout entrada" className="mb-6 w-full">
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
    if (checkoutSeleccionado?.nombreBanda) partes.push(checkoutSeleccionado.nombreBanda);
    if (!partes.length) return null;
    return <p className="mb-4 text-sm text-slate-400">{partes.join(" · ")}</p>;
  };

  const renderPaso = () => {
    if (paso === 0) {
      return (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-white">Evento de hoy ({hoy})</h3>
          <p className="text-sm text-slate-400">
            Selecciona el evento para registrar el ingreso de bandas con llegada ya confirmada.
          </p>
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
          <h3 className="text-lg font-semibold text-white">Banda</h3>
          {renderContexto()}
          <p className="text-sm text-slate-400">
            Bandas con llegada confirmada por el dirigente, pendientes de ingreso.
          </p>
          <BuscadorRow filtrarBuscador={(e) => setBusquedaBanda(e.target.value)} />
          {cargando ? (
            <p className="text-slate-400">Cargando bandas…</p>
          ) : checkoutsFiltrados.length === 0 ? (
            <p className="rounded-lg bg-slate-800/60 p-4 text-sm text-slate-300">
              No hay bandas con llegada confirmada pendientes de ingreso en este evento.
            </p>
          ) : (
            <div className="max-h-[40vh] flex flex-col gap-2 overflow-y-auto pr-1">
              {checkoutsFiltrados.map((registro) => (
                <button
                  key={registro.id_checkout}
                  type="button"
                  onClick={() => seleccionarCheckout(registro)}
                  className={cn(
                    "w-full rounded-lg p-3 text-left transition-colors",
                    checkoutSeleccionado?.id_checkout === registro.id_checkout
                      ? "bg-[#00b4d8] ring-2 ring-[#00b4d8]/60"
                      : "bg-slate-700 hover:bg-slate-600",
                  )}
                >
                  <span className="font-semibold text-white">
                    {registro.nombreBanda ?? "—"}
                  </span>
                  <p className="mt-1 text-xs text-slate-400">
                    {registro.nombreCategoria ?? "—"} · Llegada confirmada:{" "}
                    {formatCheckoutFechaHora(registro.hora_llegada_banda)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold text-white">Registrar ingreso</h3>
        {renderContexto()}
        {checkoutSeleccionado ? (
          <p className="rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-300">
            Llegada confirmada:{" "}
            <span className="font-medium text-white">
              {formatCheckoutFechaHora(checkoutSeleccionado.hora_llegada_banda)}
            </span>
          </p>
        ) : null}
        <p className="rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-300">
          Fecha de ingreso: <span className="font-medium text-white">{fechaHoyISO()}</span>{" "}
          (hoy)
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase text-slate-400">
              Hora de ingreso
            </label>
            <input
              type="time"
              className={inputClass}
              value={horaIngreso}
              onChange={(e) => setHoraIngreso(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase text-slate-400">Integrantes</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={cantidadIntegrantes}
              onChange={(e) => setCantidadIntegrantes(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase text-slate-400">Palillonas</label>
            <input
              type="number"
              min={0}
              className={inputClass}
              value={cantidadPalillonas}
              onChange={(e) => setCantidadPalillonas(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs uppercase text-slate-400">Aportación</label>
            <input
              type="number"
              min={0}
              step="0.01"
              className={inputClass}
              value={aportacion}
              onChange={(e) => setAportacion(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase text-slate-400">Observaciones</label>
          <textarea
            className={`${inputClass} min-h-20 py-2`}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
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
          {paso < 2 ? (
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
              disabled={guardando || !checkoutSeleccionado?.id_checkout}
              onClick={() => void guardar()}
              className="rounded-lg bg-[#00b4d8] px-4 py-2 font-semibold text-white hover:bg-[#0096b8] disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Registrar ingreso"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
