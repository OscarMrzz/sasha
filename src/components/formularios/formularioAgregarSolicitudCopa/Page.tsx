"use client";

import { useEffect, useRef, useState } from "react";
import {
  bandaInterface,
  registroEventoDatosAmpleosInterface,
} from "@/models";
import { createSolicitudCopa } from "@/services/solicitudCopasServices";
import BandasServices from "@/services/bandasServices";
import PerfilesServices from "@/services/perfilesServices";
import RegistroEquipoEvaluadorServices from "@/services/registroEquipoEvaluadorServices";
import RegistroEventossServices from "@/services/registroEventosServices";
import { ComboBoxBandas } from "@/components/ComboBox/ComboBoxBandas";
import { ComboBoxEventos } from "@/components/ComboBox/ComboBoxEventos";
import { OPCIONES_LUGAR_SOLICITUD_COPA } from "@/helpers/solicitudCopa/lugarSolicitudCopa";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-slate-700/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30";
const labelClass = "mb-1 block text-xs uppercase text-slate-400";

type Props = {
  onSuccess: () => void;
  onError: (msg: string) => void;
  onClose: () => void;
};

async function cargarEventosFiscalEquipoEvaluador(): Promise<
  registroEventoDatosAmpleosInterface[]
> {
  const reg = new RegistroEventossServices();
  await reg.initPerfil();
  const listaCompleta = await reg.getDatosAmpleos();

  const equipoSvc = new RegistroEquipoEvaluadorServices();
  await equipoSvc.initPerfil();
  const idPerfil = reg.perfil?.idPerfil;
  if (!idPerfil) return [];

  const asignaciones = await equipoSvc.getporPerfil(idPerfil);
  const ids = new Set(asignaciones.map((a) => a.idForaneaEvento));

  return listaCompleta.filter(
    (e) => ids.has(e.idEvento) && e.estado_evento !== "finalizado"
  );
}

export default function FormularioAgregarSolicitudCopa({
  onSuccess,
  onError,
  onClose,
}: Props) {
  const bandasServices = useRef(new BandasServices());
  const perfilesServices = useRef(new PerfilesServices());

  const [eventos, setEventos] = useState<registroEventoDatosAmpleosInterface[]>(
    []
  );
  const [bandas, setBandas] = useState<bandaInterface[]>([]);
  const [idEvento, setIdEvento] = useState("");
  const [idBanda, setIdBanda] = useState("");
  const [lugar, setLugar] = useState("");
  const [tipo, setTipo] = useState<"directo" | "desempate" | "">("");
  const [justificacion, setJustificacion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [eventosData, bandasData] = await Promise.all([
          cargarEventosFiscalEquipoEvaluador(),
          (async () => {
            await bandasServices.current.initPerfil();
            return (await bandasServices.current.get()) as bandaInterface[];
          })(),
        ]);
        setEventos(eventosData);
        setBandas(bandasData);
      } catch (err) {
        onError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar eventos o bandas."
        );
      } finally {
        setCargando(false);
      }
    })();
  }, [onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEvento) {
      onError("Selecciona un evento.");
      return;
    }
    if (!idBanda) {
      onError("Selecciona una banda.");
      return;
    }
    if (!lugar) {
      onError("Selecciona el lugar de la copa.");
      return;
    }
    if (!tipo) {
      onError("Selecciona el tipo de copa.");
      return;
    }
    if (!justificacion.trim()) {
      onError("La justificación es obligatoria.");
      return;
    }

    setGuardando(true);
    try {
      const perfil = await perfilesServices.current.getUsuarioLogiado();
      await createSolicitudCopa({
        id_foranea_evento: idEvento,
        id_foranea_banda: idBanda,
        id_foranea_solicitante: perfil.idPerfil,
        tipo_solicitud_copa: tipo,
        justificacion_solicitud_copa: justificacion.trim(),
        lugar_solicitud_copas: Number(lugar),
        estado: null,
      });
      onSuccess();
      onClose();
    } catch (err) {
      onError(
        err instanceof Error ? err.message : "No se pudo crear la solicitud."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <p className="text-sm text-slate-400">Cargando formulario…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-2">
      <h2 className="text-xl font-bold text-white">Agregar solicitud de copa</h2>

      <div>
        <label className={labelClass}>Evento *</label>
        <ComboBoxEventos
          eventos={eventos}
          value={idEvento}
          onChange={setIdEvento}
          placeholder="Selecciona un evento"
          emptyLabel="No hay eventos asignados disponibles"
        />
      </div>

      <div>
        <label className={labelClass}>Banda *</label>
        <ComboBoxBandas
          bandas={bandas}
          value={idBanda}
          onChange={setIdBanda}
          placeholder="Selecciona una banda"
        />
      </div>

      <div>
        <label className={labelClass}>Lugar *</label>
        <select
          value={lugar}
          onChange={(e) => setLugar(e.target.value)}
          className={inputClass}
          required
        >
          <option value="">Selecciona el lugar</option>
          {OPCIONES_LUGAR_SOLICITUD_COPA.map((op) => (
            <option key={op.valor} value={String(op.valor)}>
              {op.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Tipo *</label>
        <select
          value={tipo}
          onChange={(e) =>
            setTipo(e.target.value as "directo" | "desempate" | "")
          }
          className={inputClass}
          required
        >
          <option value="">Selecciona el tipo</option>
          <option value="directo">Directo</option>
          <option value="desempate">Desempate</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Justificación *</label>
        <textarea
          value={justificacion}
          onChange={(e) => setJustificacion(e.target.value)}
          className={`${inputClass} min-h-[120px]`}
          placeholder="Describe el motivo de la solicitud"
          required
        />
      </div>

      <button
        type="submit"
        disabled={guardando}
        className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
      >
        {guardando ? "Enviando…" : "Enviar solicitud"}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg bg-slate-400 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
      >
        Cancelar
      </button>
    </form>
  );
}
