"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckoutDetalleInterface } from "@/models";
import { getAllCheckoutByEvento } from "@/services/chekoutServices";
import { useEventosDisciplinaHoy } from "@/hooks/diciplina/useEventosDisciplinaHoy";
import BuscadorRow from "@/components/buscadores/BuscadorRow";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";
import OverleyModal from "@/components/modales/OverleyModal/Page";
import ModalVerCheckout from "@/components/diciplina/ModalVerCheckout";
import WizardCheckoutLlegada from "@/components/diciplina/WizardCheckoutLlegada";
import ErrorMessage from "@/components/Message/ErrorMessage";
import ApprovateMessage from "@/components/Message/ApprovateMessage";
import { formatCheckoutFechaHora } from "@/components/diciplina/checkoutUtils";

export default function CheckoutLlegadaPage() {
  const queryClient = useQueryClient();
  const { hoy, idPerfil, eventosHoy, cargando, sinEventos } = useEventosDisciplinaHoy();

  const [idEventoLista, setIdEventoLista] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [openVer, setOpenVer] = useState(false);
  const [seleccionado, setSeleccionado] = useState<CheckoutDetalleInterface | null>(null);
  const [openError, setOpenError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [openExito, setOpenExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const idEventoConsulta = idEventoLista || eventosHoy[0]?.idEvento || "";

  const { data: registros = [], isPending: cargandoRegistros } = useQuery({
    queryKey: ["checkout-evento", idEventoConsulta],
    queryFn: () => getAllCheckoutByEvento(idEventoConsulta),
    enabled: Boolean(idEventoConsulta),
  });

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return registros;
    return registros.filter(
      (r) =>
        (r.nombreBanda ?? "").toLowerCase().includes(q) ||
        (r.nombreCategoria ?? "").toLowerCase().includes(q),
    );
  }, [registros, busqueda]);

  const refrescar = async (idEvento?: string) => {
    const id = idEvento ?? idEventoConsulta;
    if (!id) return;
    await queryClient.invalidateQueries({ queryKey: ["checkout-evento", id] });
  };

  if (cargando) {
    return <SkeletonTabla />;
  }

  if (sinEventos) {
    return (
      <div className="py-12 text-center text-slate-400">
        <h1 className="mb-2 text-2xl font-bold text-white">Checkout — Llegada</h1>
        <p>No hay eventos hoy ({hoy}) en los que formes parte del equipo evaluador.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Checkout — Llegada</h1>
        <p className="text-sm text-slate-400">
          Registra la llegada de bandas y notifica al dirigente · {hoy}
        </p>
      </div>

      {idPerfil ? (
        <WizardCheckoutLlegada
          hoy={hoy}
          eventosHoy={eventosHoy}
          idPerfilDisciplina={idPerfil}
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
      ) : null}

   

      <OverleyModal open={openVer} onClose={() => setOpenVer(false)}>
        {seleccionado ? <ModalVerCheckout registro={seleccionado} /> : null}
      </OverleyModal>

      <ErrorMessage open={openError} texto={mensajeError} onClose={() => setOpenError(false)} />
      <ApprovateMessage open={openExito} texto={mensajeExito} onClose={() => setOpenExito(false)} />
    </div>
  );
}
