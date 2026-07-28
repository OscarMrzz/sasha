"use client";

import { useEffect, useRef, useState } from "react";
import { sancionInterface } from "@/models";
import {
  createSancion,
  deleteSancion,
  getSanciones,
  updateSancion,
} from "@/services/sancionesServices";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";
import { PlusIcon } from "@heroicons/react/16/solid";
import BuscadorRow from "@/components/buscadores/BuscadorRow";
import ConfirmDeleteModal from "@/components/modales/ConfirmDeleteModal/ConfirmDeleteModal";
import ErrorMessage from "@/components/Message/ErrorMessage";
import ApprovateMessage from "@/components/Message/ApprovateMessage";
import OverleyModalFormulario from "@/components/modales/OverleyModalFormulario/Page";
import CardRowSancion from "@/components/CardRow/CardRowSancion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useAtajoPagina from "@/hooks/useAtajoPagina";

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30";

type FormState = {
  detalles_sancion: string;
  puntos_sancion: string;
  fecha_creacion_sancion: string;
  version: string;
};

const emptyForm: FormState = {
  detalles_sancion: "",
  puntos_sancion: "",
  fecha_creacion_sancion: "",
  version: "",
};

export default function SancionesCrud() {
  const queryClient = useQueryClient();
  const [lista, setLista] = useState<sancionInterface[]>([]);
  const [originales, setOriginales] = useState<sancionInterface[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [openAgregar, setOpenAgregar] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);
  const [sancionEliminar, setSancionEliminar] = useState<sancionInterface | null>(null);
  const [openError, setOpenError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [openExito, setOpenExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [guardando, setGuardando] = useState(false);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["sanciones"],
    queryFn: getSanciones,
  });

  useEffect(() => {
    if (data) {
      setOriginales(data);
      setLista(data);
    }
  }, [data]);

  useEffect(() => {
    if (isError) {
      const msg =
        error instanceof Error
          ? error.message
          : "Error al cargar sanciones. Verifica los permisos en Supabase.";
      setMensajeError(msg);
      setOpenError(true);
    }
  }, [isError, error]);

  const refrescar = async () => {
    await queryClient.invalidateQueries({ queryKey: ["sanciones"] });
  };

  const mostrarError = (msg: string) => {
    setMensajeError(msg);
    setOpenError(true);
  };

  const mostrarExito = (msg: string) => {
    setMensajeExito(msg);
    setOpenExito(true);
  };

  const filtrar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value.toLowerCase();
    setLista(
      q
        ? originales.filter(
            (s) =>
              (s.detalles_sancion ?? "").toLowerCase().includes(q) ||
              (s.version ?? "").toLowerCase().includes(q)
          )
        : originales
    );
  };

  const abrirAgregar = () => {
    setForm(emptyForm);
    setEditId(null);
    setOpenAgregar(true);
  };

  useAtajoPagina("agregar", abrirAgregar);

  const abrirEditar = (s: sancionInterface) => {
    setEditId(s.id_sancion);
    setForm({
      detalles_sancion: s.detalles_sancion ?? "",
      puntos_sancion: String(s.puntos_sancion ?? ""),
      fecha_creacion_sancion: s.fecha_creacion_sancion
        ? String(s.fecha_creacion_sancion).slice(0, 10)
        : "",
      version: s.version ?? "",
    });
    setOpenEditar(true);
  };

  const payloadFromForm = () => ({
    detalles_sancion: form.detalles_sancion.trim(),
    puntos_sancion: Number(form.puntos_sancion),
    fecha_creacion_sancion: form.fecha_creacion_sancion || null,
    version: form.version.trim() || null,
  });

  const validar = () => {
    if (!form.detalles_sancion.trim()) {
      mostrarError("El detalle de la sanción es obligatorio.");
      return false;
    }
    if (!form.puntos_sancion || Number.isNaN(Number(form.puntos_sancion))) {
      mostrarError("Los puntos deben ser un número válido.");
      return false;
    }
    return true;
  };

  const guardarNueva = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;
    setGuardando(true);
    try {
      await createSancion(payloadFromForm());
      mostrarExito("Sanción creada correctamente.");
      setOpenAgregar(false);
      await refrescar();
    } catch (err) {
      mostrarError(err instanceof Error ? err.message : "No se pudo crear la sanción.");
    } finally {
      setGuardando(false);
    }
  };

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !validar()) return;
    setGuardando(true);
    try {
      await updateSancion(editId, payloadFromForm());
      mostrarExito("Sanción actualizada.");
      setOpenEditar(false);
      await refrescar();
    } catch (err) {
      mostrarError(err instanceof Error ? err.message : "No se pudo actualizar la sanción.");
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = async () => {
    if (!sancionEliminar) return;
    try {
      await deleteSancion(sancionEliminar.id_sancion);
      mostrarExito("Sanción eliminada.");
      await refrescar();
    } catch (err) {
      mostrarError(err instanceof Error ? err.message : "No se pudo eliminar la sanción.");
    } finally {
      setOpenEliminar(false);
      setSancionEliminar(null);
    }
  };

  const FormFields = () => (
    <>
      <div>
        <label className="mb-1 block text-xs uppercase text-slate-400">Detalle *</label>
        <textarea
          value={form.detalles_sancion}
          onChange={(e) => setForm((p) => ({ ...p, detalles_sancion: e.target.value }))}
          className={`${inputClass} min-h-[100px]`}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase text-slate-400">Puntos *</label>
        <input
          type="number"
          value={form.puntos_sancion}
          onChange={(e) => setForm((p) => ({ ...p, puntos_sancion: e.target.value }))}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase text-slate-400">
          Fecha creación sanción
        </label>
        <input
          type="date"
          value={form.fecha_creacion_sancion}
          onChange={(e) =>
            setForm((p) => ({ ...p, fecha_creacion_sancion: e.target.value }))
          }
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs uppercase text-slate-400">Versión</label>
        <input
          type="text"
          value={form.version}
          onChange={(e) => setForm((p) => ({ ...p, version: e.target.value }))}
          className={inputClass}
        />
      </div>
    </>
  );

  return (
    <div>
      <ConfirmDeleteModal
        open={openEliminar}
        onClose={() => setOpenEliminar(false)}
        onConfirm={confirmarEliminar}
        nombreElemento={sancionEliminar?.detalles_sancion ?? ""}
      />
      <ErrorMessage titulo="Error" open={openError} onClose={() => setOpenError(false)} texto={mensajeError} />
      <ApprovateMessage titulo="Éxito" open={openExito} onClose={() => setOpenExito(false)} texto={mensajeExito} />

      <OverleyModalFormulario open={openAgregar} onClose={() => setOpenAgregar(false)}>
        <form onSubmit={guardarNueva} className="flex flex-col gap-4 p-2">
          <h2 className="text-xl font-bold text-white">Agregar sanción</h2>
          <FormFields />
          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </form>
      </OverleyModalFormulario>

      <OverleyModalFormulario open={openEditar} onClose={() => setOpenEditar(false)}>
        <form onSubmit={guardarEdicion} className="flex flex-col gap-4 p-2">
          <h2 className="text-xl font-bold text-white">Editar sanción</h2>
          <FormFields />
          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {guardando ? "Guardando…" : "Actualizar"}
          </button>
        </form>
      </OverleyModalFormulario>

      <section className="mb-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Sanciones</h1>
          <span className="text-sm text-slate-400">{lista.length}</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <BuscadorRow filtrarBuscador={filtrar} />
          <button
            type="button"
            onClick={abrirAgregar}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-300"
          >
            <PlusIcon className="h-5 w-5" />
            Agregar
          </button>
        </div>
      </section>

      {isPending ? (
        <SkeletonTabla />
      ) : lista.length === 0 ? (
        <p className="rounded-xl border border-slate-600/40 bg-slate-800/40 px-4 py-8 text-center text-slate-400">
          No hay sanciones registradas.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {lista.map((s, index) => (
            <CardRowSancion
              key={s.id_sancion}
              index={index + 1}
              sancion={s}
              abrirInformacion={() => {}}
              abrirEditar={abrirEditar}
              abrirEliminar={(s) => {
                setSancionEliminar(s);
                setOpenEliminar(true);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
