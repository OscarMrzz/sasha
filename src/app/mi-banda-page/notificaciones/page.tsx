"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckoutDetalleInterface } from "@/models";
import {
  getCheckoutNotificacionesIngreso,
  getCheckoutNotificacionesLlegada,
} from "@/services/chekoutServices";
import PerfilesServices from "@/services/perfilesServices";
import { useCheckoutRealtime } from "@/hooks/checkout";
import CardRowCheckoutNotificacion from "@/components/CardRow/CardRowCheckoutNotificacion";
import OverleyModal from "@/components/modales/OverleyModal/Page";
import OverleyModalFormulario from "@/components/modales/OverleyModalFormulario/Page";
import ModalVerCheckout from "@/components/diciplina/ModalVerCheckout";
import ModalResponderCheckout from "@/components/diciplina/ModalResponderCheckout";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";
import ErrorMessage from "@/components/Message/ErrorMessage";
import ApprovateMessage from "@/components/Message/ApprovateMessage";

export default function NotificacionesPage() {
  const queryClient = useQueryClient();
  const [openVer, setOpenVer] = useState(false);
  const [openResponder, setOpenResponder] = useState(false);
  const [seleccionado, setSeleccionado] = useState<CheckoutDetalleInterface | null>(null);
  const [tipoRespuesta, setTipoRespuesta] = useState<"llegada" | "ingreso">("llegada");
  const [openError, setOpenError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [openExito, setOpenExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const { data: perfil, isPending: cargandoPerfil } = useQuery({
    queryKey: ["perfil-dirigente-notificaciones"],
    queryFn: async () => {
      const svc = new PerfilesServices();
      return svc.getUsuarioLogiadoBanda();
    },
  });

  const idBanda =
    perfil?.idForaneaBanda?.trim() || perfil?.bandas?.idBanda?.trim() || "";

  useCheckoutRealtime({ queryClient, idBanda });

  const { data: llegada = [], isPending: cargandoLlegada } = useQuery({
    queryKey: ["checkout-notif-llegada", idBanda],
    queryFn: () => getCheckoutNotificacionesLlegada(idBanda),
    enabled: Boolean(idBanda),
  });

  const { data: ingreso = [], isPending: cargandoIngreso } = useQuery({
    queryKey: ["checkout-notif-ingreso", idBanda],
    queryFn: () => getCheckoutNotificacionesIngreso(idBanda),
    enabled: Boolean(idBanda),
  });

  const refrescar = async () => {
    await queryClient.invalidateQueries({ queryKey: ["checkout-notif-llegada", idBanda] });
    await queryClient.invalidateQueries({ queryKey: ["checkout-notif-ingreso", idBanda] });
  };

  const abrirResponder = (r: CheckoutDetalleInterface, tipo: "llegada" | "ingreso") => {
    setSeleccionado(r);
    setTipoRespuesta(tipo);
    setOpenResponder(true);
  };

  if (cargandoPerfil) return <SkeletonTabla />;

  if (!idBanda) {
    return (
      <div className="py-12 text-center text-slate-400">
        <h1 className="mb-2 text-2xl font-bold text-white">Notificaciones</h1>
        <p>Tu perfil no está vinculado a una banda.</p>
      </div>
    );
  }

  const cargando = cargandoLlegada || cargandoIngreso;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Notificaciones</h1>

      <section className="space-y-3">
   
        {cargando ? (
          <SkeletonTabla />
        ) : llegada.length === 0 ? (
          <p className="text-sm text-slate-400"></p>
        ) : (
          <div className="flex flex-col gap-3">
            {llegada.map((r) => (
              <CardRowCheckoutNotificacion
                key={r.id_checkout}
                registro={r}
                tipo="llegada"
                onView={() => {
                  setSeleccionado(r);
                  setOpenVer(true);
                }}
                onResponder={() => abrirResponder(r, "llegada")}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
    
        {cargando ? (
          <SkeletonTabla />
        ) : ingreso.length === 0 ? (
          <p className="text-sm text-slate-400"></p>
        ) : (
          <div className="flex flex-col gap-3">
            {ingreso.map((r) => (
              <CardRowCheckoutNotificacion
                key={r.id_checkout}
                registro={r}
                tipo="ingreso"
                onView={() => {
                  setSeleccionado(r);
                  setOpenVer(true);
                }}
                onResponder={() => abrirResponder(r, "ingreso")}
              />
            ))}
          </div>
        )}
      </section>
      <section>
        {
          llegada.length === 0 && ingreso.length === 0 && (
            <p className="text-sm text-slate-400">Sin notificaciones pendientes.</p>
          )
        }
      </section>

      <OverleyModal open={openVer} onClose={() => setOpenVer(false)}>
        {seleccionado ? <ModalVerCheckout registro={seleccionado} /> : null}
      </OverleyModal>

      <OverleyModalFormulario open={openResponder} onClose={() => setOpenResponder(false)}>
        {seleccionado ? (
          <ModalResponderCheckout
            registro={seleccionado}
            tipo={tipoRespuesta}
            onSuccess={(msg) => {
              setMensajeExito(msg);
              setOpenExito(true);
              void refrescar();
            }}
            onError={(msg) => {
              setMensajeError(msg);
              setOpenError(true);
            }}
            onClose={() => setOpenResponder(false)}
          />
        ) : null}
      </OverleyModalFormulario>

      <ErrorMessage open={openError} texto={mensajeError} onClose={() => setOpenError(false)} />
      <ApprovateMessage open={openExito} texto={mensajeExito} onClose={() => setOpenExito(false)} />
    </div>
  );
}
