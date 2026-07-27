"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEventosDisciplinaHoy } from "@/hooks/diciplina/useEventosDisciplinaHoy";
import SkeletonTabla from "@/component/skeleton/SkeletonTabla/Page";
import WizardCheckoutEntrada from "@/component/diciplina/WizardCheckoutEntrada";
import ErrorMessage from "@/component/Message/ErrorMessage";
import ApprovateMessage from "@/component/Message/ApprovateMessage";

export default function CheckoutEntradaPage() {
  const queryClient = useQueryClient();
  const { hoy, eventosHoy, cargando, sinEventos } = useEventosDisciplinaHoy();

  const [openError, setOpenError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [openExito, setOpenExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const refrescar = async () => {
    await queryClient.invalidateQueries({ queryKey: ["checkout-entrada"] });
    await queryClient.invalidateQueries({ queryKey: ["checkout-evento"] });
    await queryClient.invalidateQueries({ queryKey: ["checkout-notif-ingreso"] });
  };

  if (cargando) return <SkeletonTabla />;

  if (sinEventos) {
    return (
      <div className="py-12 text-center text-slate-400">
        <h1 className="mb-2 text-2xl font-bold text-white">Checkout — Entrada</h1>
        <p>No hay eventos hoy ({hoy}) en los que formes parte del equipo evaluador.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Checkout — Entrada</h1>
        <p className="text-sm text-slate-400">
          Registra el ingreso de bandas con llegada confirmada por el dirigente · {hoy}
        </p>
      </div>

      <WizardCheckoutEntrada
        hoy={hoy}
        eventosHoy={eventosHoy}
        onSuccess={(msg) => {
          setMensajeExito(msg);
          setOpenExito(true);
          void refrescar();
        }}
        onError={(msg) => {
          setMensajeError(msg);
          setOpenError(true);
        }}
        onRegistroGuardado={() => void refrescar()}
      />

      <ErrorMessage open={openError} texto={mensajeError} onClose={() => setOpenError(false)} />
      <ApprovateMessage open={openExito} texto={mensajeExito} onClose={() => setOpenExito(false)} />
    </div>
  );
}
