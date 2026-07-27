"use client";

import { useState } from "react";
import { bandaInterface, registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";
import { createCheckoutLlegada } from "@/lib/services/chekoutServices";
import { ComboBoxBandas } from "@/component/ComboBox/ComboBoxBandas";
import { horaActualISO } from "@/component/diciplina/checkoutUtils";

type Props = {
  evento: registroEventoDatosAmpleosInterface;
  bandas: bandaInterface[];
  idPerfilDisciplina: string;
  onSuccess: (mensaje: string) => void;
  onError: (msg: string) => void;
  onClose: () => void;
};

const inputClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100";

export default function ModalFormCheckoutLlegada({
  evento,
  bandas,
  idPerfilDisciplina,
  onSuccess,
  onError,
  onClose,
}: Props) {
  const [idBanda, setIdBanda] = useState("");
  const [horaLlegada, setHoraLlegada] = useState(() => {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  });
  const [guardando, setGuardando] = useState(false);

  const guardar = async () => {
    if (!idBanda) {
      onError("Selecciona una banda.");
      return;
    }
    if (!horaLlegada) {
      onError("Indica la hora de llegada.");
      return;
    }

    setGuardando(true);
    try {
      await createCheckoutLlegada({
        id_foranea_banda: idBanda,
        hora_llegada_banda: horaLlegada,
        id_foranea_diciplina: idPerfilDisciplina,
        time_envio_confirmacion_llegada: horaActualISO(),
        id_foranea_evento: evento.idEvento,
      });
      onSuccess("Llegada registrada. Se notificó al dirigente.");
      onClose();
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Registrar llegada</h2>
      <p className="text-sm text-slate-300">
        Evento: <span className="font-medium text-white">{evento.LugarEvento}</span> ·{" "}
        {evento.fechaEvento}
      </p>

      <div>
        <label className="mb-1 block text-xs uppercase text-slate-400">Banda</label>
        <ComboBoxBandas bandas={bandas} value={idBanda} onChange={setIdBanda} />
      </div>

      <div>
        <label className="mb-1 block text-xs uppercase text-slate-400">
          Hora de llegada
        </label>
        <input
          type="datetime-local"
          className={inputClass}
          value={horaLlegada}
          onChange={(e) => setHoraLlegada(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
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
          {guardando ? "Guardando…" : "Registrar llegada"}
        </button>
      </div>
    </div>
  );
}
