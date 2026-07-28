"use client";

import { useEffect, useRef, useState } from "react";
import {
  bandaInterface,
  perfilDatosAmpleosInterface,
  sancionInterface,
} from "@/models";
import BandasServices from "@/services/bandasServices";
import { getSanciones } from "@/services/sancionesServices";
import { revalidarResultadosPorIdBanda } from "@/actions/revalidarResultadosEvento";
import { createAplicacionSancion } from "@/services/aplicacionSancionesServices";
import ErrorMessage from "@/components/Message/ErrorMessage";
import ApprovateMessage from "@/components/Message/ApprovateMessage";
import loading2 from "@/animacionesJson/Loading2.json";
import Lottie from "lottie-react";
import { ComboBoxBandas } from "@/components/ComboBox/ComboBoxBandas";

export default function AplicarSancionComponent() {
  const bandasServices = useRef(new BandasServices());
  const [bandas, setBandas] = useState<bandaInterface[]>([]);
  const [sanciones, setSanciones] = useState<sancionInterface[]>([]);
  const [cargando, setCargando] = useState(true);
  const [idBanda, setIdBanda] = useState("");
  const [idSancion, setIdSancion] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [perfil, setPerfil] = useState<perfilDatosAmpleosInterface | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [openExito, setOpenExito] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const perfilCookie = document.cookie
          .split(";")
          .find((c) => c.trim().startsWith("perfilActivo="));
        const perfilBruto = perfilCookie
          ? decodeURIComponent(perfilCookie.split("=")[1])
          : null;
        if (perfilBruto) {
          setPerfil(JSON.parse(perfilBruto) as perfilDatosAmpleosInterface);
        }

        await bandasServices.current.initPerfil();
        const [listaBandas, listaSanciones] = await Promise.all([
          bandasServices.current.get() as Promise<bandaInterface[]>,
          getSanciones(),
        ]);
        setBandas(listaBandas ?? []);
        setSanciones(listaSanciones ?? []);
      } catch (e) {
        console.error(e);
        setMensajeError("No se pudieron cargar bandas o sanciones.");
        setOpenError(true);
      } finally {
        setCargando(false);
      }
    };
    void cargar();
  }, []);

  const bandaSel = bandas.find((b) => b.idBanda === idBanda);
  const sancionSel = sanciones.find((s) => s.id_sancion === idSancion);

  const validar = () => {
    if (!idBanda) {
      setMensajeError("Selecciona una banda.");
      setOpenError(true);
      return false;
    }
    if (!idSancion) {
      setMensajeError("Selecciona una sanción.");
      setOpenError(true);
      return false;
    }
    if (!justificacion.trim()) {
      setMensajeError("Escribe la justificación.");
      setOpenError(true);
      return false;
    }
    if (!perfil?.idPerfil) {
      setMensajeError("No se pudo obtener tu perfil. Vuelve a iniciar sesión.");
      setOpenError(true);
      return false;
    }
    return true;
  };

  const solicitarConfirmacion = () => {
    if (!validar()) return;
    setOpenConfirm(true);
  };

  const aplicarSancion = async () => {
    if (!perfil?.idPerfil || !idBanda || !idSancion) return;
    setAplicando(true);
    try {
      await createAplicacionSancion({
        id_foranea_sancion: idSancion,
        id_foranea_banda: idBanda,
        id_foranea_perfil: perfil.idPerfil,
        fecha: new Date().toISOString().slice(0, 10),
        justificacion: justificacion.trim(),
      });
      await revalidarResultadosPorIdBanda(idBanda);
      setOpenConfirm(false);
      setIdSancion("");
      setJustificacion("");
      setOpenExito(true);
    } catch (e) {
      console.error(e);
      setMensajeError("No se pudo aplicar la sanción. Revisa permisos.");
      setOpenError(true);
    } finally {
      setAplicando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3">
        <Lottie animationData={loading2} loop className="max-h-28 w-28" aria-hidden />
        <p className="text-sm text-slate-400">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <ErrorMessage
        titulo="Error"
        open={openError}
        onClose={() => setOpenError(false)}
        texto={mensajeError}
      />
      <ApprovateMessage
        titulo="Sanción aplicada"
        open={openExito}
        onClose={() => setOpenExito(false)}
        texto="La sanción se registró correctamente."
      />

      {openConfirm ? (
        <dialog
          open
          className="fixed inset-0 z-[200] m-auto flex max-w-md rounded-2xl border-0 bg-slate-700 p-6 text-white shadow-xl backdrop:bg-black/50"
        >
          <div className="flex w-full flex-col gap-4">
            <h2 className="text-lg font-bold">Confirmar sanción</h2>
            <p className="text-sm text-slate-300">
              Vas a aplicar la sanción <strong>{sancionSel?.detalles_sancion}</strong> (
              <span className="text-red-300">-{sancionSel?.puntos_sancion} pts</span>) a la
              banda <strong>{bandaSel?.nombreBanda}</strong>.
            </p>
            <p className="text-sm text-slate-400">
              Justificación: {justificacion.trim()}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={aplicando}
                onClick={() => setOpenConfirm(false)}
                className="rounded-lg border border-slate-500 px-4 py-2 hover:bg-slate-600"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={aplicando}
                onClick={() => void aplicarSancion()}
                className="rounded-lg bg-red-600 px-4 py-2 font-semibold hover:bg-red-500 disabled:opacity-50"
              >
                {aplicando ? "Aplicando…" : "Sí, aplicar"}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}

      <header>
        <h1 className="text-2xl font-bold text-white">Aplicar sanción</h1>
        <p className="mt-1 text-sm text-slate-400">
          Selecciona la banda, la sanción y escribe la justificación.
        </p>
      </header>

      <section className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase text-slate-400">Banda</label>
        <ComboBoxBandas
          bandas={bandas}
          value={idBanda}
          onChange={(id) => {
            setIdBanda(id);
            setIdSancion("");
          }}
          placeholder="Seleccionar banda"
        />
      </section>

      {idBanda ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">Sanciones disponibles</h2>
          {sanciones.length === 0 ? (
            <p className="text-slate-400">No hay sanciones en el catálogo.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sanciones.map((s) => {
                const selected = idSancion === s.id_sancion;
                return (
                  <button
                    key={s.id_sancion}
                    type="button"
                    onClick={() => setIdSancion(s.id_sancion)}
                    className={`rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-sky-500 bg-sky-950/40 ring-2 ring-sky-500/40"
                        : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
                    }`}
                  >
                    <p className="font-medium text-white">{s.detalles_sancion}</p>
                    <p className="mt-1 text-sm text-red-300">-{s.puntos_sancion} puntos</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {s.version ? `Versión ${s.version}` : "Sin versión"}
                      {s.fecha_creacion_sancion
                        ? ` · ${String(s.fecha_creacion_sancion).slice(0, 10)}`
                        : ""}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {idBanda && idSancion ? (
        <section className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase text-slate-400">
            Justificación
          </label>
          <textarea
            value={justificacion}
            onChange={(e) => setJustificacion(e.target.value)}
            rows={4}
            placeholder="Describe por qué se aplica esta sanción…"
            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white placeholder:text-slate-500"
          />
          <button
            type="button"
            onClick={solicitarConfirmacion}
            className="mt-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-500"
          >
            Aplicar sanción
          </button>
        </section>
      ) : null}
    </div>
  );
}
