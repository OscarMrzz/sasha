"use client";

import { useRef, useState } from "react";
import { CheckoutDetalleInterface } from "@/models";
import {
  updateCheckoutConfirmacionIngreso,
  updateCheckoutConfirmacionLlegada,
} from "@/services/chekoutServices";
import PerfilesServices from "@/services/perfilesServices";
import ModalVerCheckout from "@/components/diciplina/ModalVerCheckout";
import ConfirmCheckoutModal from "@/components/modales/ConfirmCheckoutModal/ConfirmCheckoutModal";
import { formatCheckoutFechaHora, horaActualSolo } from "@/components/diciplina/checkoutUtils";

type Props = {
  registro: CheckoutDetalleInterface;
  tipo: "llegada" | "ingreso";
  onSuccess: (mensaje: string) => void;
  onError: (msg: string) => void;
  onClose: () => void;
};

type ConfirmAction = "confirmar" | "denegar" | null;

export default function ModalResponderCheckout({
  registro,
  tipo,
  onSuccess,
  onError,
  onClose,
}: Props) {
  const perfilesServices = useRef(new PerfilesServices());
  const [procesando, setProcesando] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const idCheckout = registro.id_checkout ?? "";
  const horaRef =
    tipo === "llegada"
      ? formatCheckoutFechaHora(registro.hora_llegada_banda)
      : formatCheckoutFechaHora(registro.hora_ingreso);

  const ejecutarAccion = async (accion: Exclude<ConfirmAction, null>) => {
    if (!idCheckout) {
      onError("El registro no tiene identificador válido.");
      return;
    }

    setProcesando(true);
    let nombreRol = "";
    try {
      const perfil = await perfilesServices.current.getUsuarioLogiadoBanda();
      nombreRol = perfil.roles?.nombreRol ?? "";
      const confirmado = accion === "confirmar";
      const now = horaActualSolo();

      if (tipo === "llegada") {
        await updateCheckoutConfirmacionLlegada(idCheckout, {
          confirmacion_horallegada: confirmado,
          time_confirmacion_hora_llegada: now,
          id_foranea_confirmador: perfil.idPerfil,
        });
        onSuccess(
          confirmado
            ? "Hora de llegada confirmada."
            : "Hora de llegada denegada.",
        );
      } else {
        await updateCheckoutConfirmacionIngreso(idCheckout, {
          confirmacion_hora_ingreso: confirmado,
          time_confirmacion_hora_ingreso: new Date().toISOString(),
          id_foranea_confirmador: perfil.idPerfil,
        });
        onSuccess(
          confirmado
            ? "Hora de ingreso confirmada."
            : "Hora de ingreso denegada.",
        );
      }
      onClose();
    } catch (err) {
      const base =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "No se pudo procesar la confirmación.";
      const rolHint = nombreRol
        ? ` Tu rol actual es «${nombreRol}».`
        : "";
      const permisoHint =
        base.includes("No se actualizó") || base.includes("permiso")
          ? " En Supabase ejecuta supabase/snippets/politicas/politicas.sql (bloque CHECKOUT al final); verifica idForaneaBanda en tu perfil."
          : "";
      onError(`${base}${rolHint}${permisoHint}`);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <>
      <ConfirmCheckoutModal
        open={confirmAction !== null}
        accion={confirmAction ?? "confirmar"}
        tipo={tipo}
        nombreBanda={registro.nombreBanda}
        horaReferencia={horaRef}
        procesando={procesando}
        onClose={() => {
          if (!procesando) setConfirmAction(null);
        }}
        onConfirm={async () => {
          if (confirmAction) await ejecutarAccion(confirmAction);
        }}
      />

      <div className="space-y-4">
        <ModalVerCheckout registro={registro} />
        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-600 pt-4">
          <button
            type="button"
            disabled={procesando}
            onClick={() => setConfirmAction("denegar")}
            className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            Denegar
          </button>
          <button
            type="button"
            disabled={procesando}
            onClick={() => setConfirmAction("confirmar")}
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Confirmar
          </button>
        </div>
      </div>
    </>
  );
}
