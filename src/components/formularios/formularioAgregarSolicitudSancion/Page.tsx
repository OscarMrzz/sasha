"use client";

import { useEffect, useRef, useState } from "react";
import { bandaInterface, sancionInterface } from "@/models";
import { getSanciones } from "@/services/sancionesServices";
import { createSolicitudSancion } from "@/services/solicituSancion";
import BandasServices from "@/services/bandasServices";
import PerfilesServices from "@/services/perfilesServices";
import { ComboBoxBandas } from "@/components/ComboBox/ComboBoxBandas";
import { ComboBoxSanciones } from "@/components/ComboBox/ComboBoxSanciones";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-slate-700/80 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30";
const labelClass = "mb-1 block text-xs uppercase text-slate-400";

type Props = {
  onSuccess: () => void;
  onError: (msg: string) => void;
  onClose: () => void;
};

export default function FormularioAgregarSolicitudSancion({
  onSuccess,
  onError,
  onClose,
}: Props) {
  const bandasServices = useRef(new BandasServices());
  const perfilesServices = useRef(new PerfilesServices());

  const [sanciones, setSanciones] = useState<sancionInterface[]>([]);
  const [bandas, setBandas] = useState<bandaInterface[]>([]);
  const [idSancion, setIdSancion] = useState("");
  const [idBanda, setIdBanda] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [sancionesData, bandasData] = await Promise.all([
          getSanciones(),
          (async () => {
            await bandasServices.current.initPerfil();
            return (await bandasServices.current.get()) as bandaInterface[];
          })(),
        ]);
        setSanciones(sancionesData);
        setBandas(bandasData);
      } catch (err) {
        onError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar sanciones o bandas."
        );
      } finally {
        setCargando(false);
      }
    })();
  }, [onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idSancion) {
      onError("Selecciona una sanción.");
      return;
    }
    if (!idBanda) {
      onError("Selecciona una banda.");
      return;
    }
    if (!justificacion.trim()) {
      onError("La justificación es obligatoria.");
      return;
    }

    setGuardando(true);
    try {
      const perfil = await perfilesServices.current.getUsuarioLogiado();
      await createSolicitudSancion({
        id_fonranea_sancion: idSancion,
        id_foranea_banda: idBanda,
        id_foranea_solicitante: perfil.idPerfil,
        justificacion: justificacion.trim(),
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
      <h2 className="text-xl font-bold text-white">Agregar solicitud de sanción</h2>

      <div>
        <label className={labelClass}>Sanción *</label>
        <ComboBoxSanciones
          sanciones={sanciones}
          value={idSancion}
          onChange={setIdSancion}
          placeholder="Selecciona una sanción"
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
