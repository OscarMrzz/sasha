"use client";

import { useState } from "react";
import { CheckoutDetalleInterface } from "@/interfaces/interfaces";
import { updateCheckoutIngreso } from "@/lib/services/chekoutServices";
import ModalVerCheckout from "@/component/diciplina/ModalVerCheckout";
import {
  combinarFechaHoyConHora,
  fechaHoyISO,
  horaActualISO,
  horaActualParaInput,
} from "@/component/diciplina/checkoutUtils";

type Props = {
  registro: CheckoutDetalleInterface;
  onSuccess: (mensaje: string) => void;
  onError: (msg: string) => void;
  onClose: () => void;
};

const inputClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100";

export default function ModalIngreso({
  registro,
  onSuccess,
  onError,
  onClose,
}: Props) {
  const [cantidadIntegrantes, setCantidadIntegrantes] = useState(
    registro.cantidad_integrantes?.toString() ?? "",
  );
  const [cantidadPalillonas, setCantidadPalillonas] = useState(
    registro.cantidad_palillonas?.toString() ?? "",
  );
  const [aportacion, setAportacion] = useState(registro.aportacion?.toString() ?? "");
  const [observaciones, setObservaciones] = useState(registro.observaciones ?? "");
  const [horaIngreso, setHoraIngreso] = useState(horaActualParaInput);
  const [guardando, setGuardando] = useState(false);

  const idCheckout = registro.id_checkout ?? "";

  const guardar = async () => {
    if (!idCheckout) {
      onError("Registro sin identificador.");
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
    if (!horaIngreso) {
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
      onClose();
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Registrar ingreso</h2>
      <ModalVerCheckout registro={registro} />

      <p className="rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-300">
        Fecha de ingreso: <span className="font-medium text-white">{fechaHoyISO()}</span> (hoy)
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
          <label className="mb-1 block text-xs uppercase text-slate-400">
            Integrantes
          </label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={cantidadIntegrantes}
            onChange={(e) => setCantidadIntegrantes(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase text-slate-400">
            Palillonas
          </label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={cantidadPalillonas}
            onChange={(e) => setCantidadPalillonas(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase text-slate-400">
            Aportación
          </label>
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
        <label className="mb-1 block text-xs uppercase text-slate-400">
          Observaciones
        </label>
        <textarea
          className={`${inputClass} min-h-24 py-2`}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-600 pt-4">
        <button
          type="button"
          disabled={guardando}
          onClick={onClose}
          className="rounded-lg border border-slate-500 px-4 py-2 text-white hover:bg-slate-600 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={guardando}
          onClick={() => void guardar()}
          className="rounded-lg bg-[#00b4d8] px-4 py-2 font-semibold text-white hover:bg-[#0096b8] disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Registrar ingreso"}
        </button>
      </div>
    </div>
  );
}
