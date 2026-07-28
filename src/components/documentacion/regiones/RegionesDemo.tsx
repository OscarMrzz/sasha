"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type RegionDemo = {
  idRegion: string;
  nombreRegion: string;
  created_at: string;
};

const REGIONES_INICIALES: RegionDemo[] = [
  { idRegion: "1", nombreRegion: "Principal", created_at: "2025-01-01" },
  { idRegion: "2", nombreRegion: "Occidente", created_at: "2025-01-02" },
  { idRegion: "3", nombreRegion: "Centro", created_at: "2025-01-03" },
  { idRegion: "4", nombreRegion: "Aguan", created_at: "2025-01-04" },
];

function IconSearch() {
  return (
    <svg className="h-5 w-5 shrink-0 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function IconMoreVertical() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg className="h-7 w-7 shrink-0 text-red-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type ToastProps = {
  open: boolean;
  titulo: string;
  texto: string;
  variant: "success" | "error";
  onClose: () => void;
};

function Toast({ open, titulo, texto, variant, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  const colors =
    variant === "success"
      ? "border-emerald-500/40 bg-emerald-950/90 text-emerald-100"
      : "border-red-500/40 bg-red-950/90 text-red-100";

  return createPortal(
    <div
      className={`fixed bottom-6 right-6 z-[300] flex min-w-[240px] max-w-sm flex-col gap-1 rounded-xl border px-4 py-3 shadow-lg ${colors}`}
      role="status"
    >
      <p className="text-sm font-semibold">{titulo}</p>
      <p className="text-sm opacity-90">{texto}</p>
    </div>,
    document.body
  );
}

type DialogShellProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  zIndex?: string;
};

function DialogShell({ open, onClose, children, className = "", zIndex = "z-[100]" }: DialogShellProps) {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => modalRef.current?.showModal(), 10);
      return () => clearTimeout(t);
    }
    modalRef.current?.close();
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <dialog
      ref={modalRef}
      onClose={onClose}
      className={`fixed inset-0 m-auto flex border-0 bg-transparent outline-none backdrop:bg-black/50 backdrop:backdrop-blur-xs ${zIndex}`}
    >
      <div className={className}>{children}</div>
    </dialog>,
    document.body
  );
}

type MenuMasOpcionesProps = {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function MenuMasOpciones({ onView, onEdit, onDelete }: MenuMasOpcionesProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const itemClass =
    "flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-100 hover:bg-slate-600";

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-label="Abrir menú"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded-full p-2 text-slate-200 transition hover:bg-slate-600/50"
      >
        <IconMoreVertical />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border border-slate-600 bg-slate-700 py-1 shadow-lg">
          <button
            type="button"
            className={itemClass}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onView();
            }}
          >
            <IconEye />
            Ver
          </button>
          <button
            type="button"
            className={itemClass}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onEdit();
            }}
          >
            <IconPencil />
            Editar
          </button>
          <div className="my-1 border-t border-slate-600" />
          <button
            type="button"
            className={`${itemClass} text-red-400 hover:bg-red-950/40 hover:text-red-300`}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete();
            }}
          >
            <IconTrash />
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

type CardRowProps = {
  index: number;
  region: RegionDemo;
  isNuevo: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function CardRowRegiones({ index, region, isNuevo, onView, onEdit, onDelete }: CardRowProps) {
  const indexBadge = (
    <p className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-600 text-lg font-bold text-slate-100">
      {index}
    </p>
  );

  const content = (
    <>
      <div className="flex min-w-0 items-center gap-4">
        {indexBadge}
        <h2 className="text-xl">{region.nombreRegion}</h2>
      </div>
      <MenuMasOpciones onView={onView} onEdit={onEdit} onDelete={onDelete} />
    </>
  );

  if (isNuevo) {
    return (
      <div onDoubleClick={onView} className="animate-pulse">
        <div className="flex h-25 w-full flex-wrap items-center justify-between rounded-lg bg-slate-400 p-4 text-slate-700">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      onDoubleClick={onView}
      className="flex h-25 w-full cursor-pointer flex-wrap items-center justify-between rounded-lg bg-slate-700 p-4 shadow-md hover:bg-slate-600"
    >
      {content}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 shadow-inner transition focus:border-[#00b4d8]/80 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#00b4d8]/35 focus:outline-none";

const labelClass = "mb-2 block text-xs font-medium uppercase tracking-wide text-white/70";

type FormularioRegionProps = {
  titulo: string;
  subtitulo: string;
  etiqueta: string;
  valorInicial: string;
  textoBoton: string;
  onCancel: () => void;
  onSubmit: (nombre: string) => void;
};

function FormularioRegion({
  titulo,
  subtitulo,
  etiqueta,
  valorInicial,
  textoBoton,
  onCancel,
  onSubmit,
}: FormularioRegionProps) {
  const [nombre, setNombre] = useState(valorInicial);

  useEffect(() => {
    setNombre(valorInicial);
  }, [valorInicial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nombre.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <div className="modal-scroll h-[90vh] w-2xl max-w-[95vw] bg-slate-600">
      <div className="p-6 pb-28 text-white">
        <div className="p-2 lg:px-8">
          <div className="mx-auto max-w-lg">
            <header className="mb-8 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#00b4d8]">{etiqueta}</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">{titulo}</h2>
              <p className="mt-2 text-sm text-white/55">{subtitulo}</p>
            </header>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:p-8">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className={labelClass} htmlFor="nombreRegion">
                    Nombre de región <span className="text-[#00b4d8]">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombreRegion"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={inputClass}
                    placeholder="Ej. Región Norte"
                    required
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#00b4d8] px-6 py-3 text-sm font-semibold text-[#0a1628] shadow-lg shadow-[#00b4d8]/25 transition hover:brightness-110"
                  >
                    {textoBoton}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function aplicarFiltro(originales: RegionDemo[], texto: string): RegionDemo[] {
  const q = texto.toLowerCase().trim();
  if (!q) return originales;
  return originales.filter((r) => r.nombreRegion.toLowerCase().includes(q));
}

function actualizarListas(
  originales: RegionDemo[],
  busqueda: string
): { originales: RegionDemo[]; filtradas: RegionDemo[] } {
  return {
    originales,
    filtradas: aplicarFiltro(originales, busqueda),
  };
}

export default function RegionesDemo() {
  const [regionesOriginales, setRegionesOriginales] = useState<RegionDemo[]>(REGIONES_INICIALES);
  const [regiones, setRegiones] = useState<RegionDemo[]>(REGIONES_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [nextId, setNextId] = useState(5);

  const [openAgregar, setOpenAgregar] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openEliminar, setOpenEliminar] = useState(false);

  const [regionSeleccionada, setRegionSeleccionada] = useState<RegionDemo | null>(null);
  const [regionParaEliminar, setRegionParaEliminar] = useState<RegionDemo | null>(null);

  const [ultimaRegionId, setUltimaRegionId] = useState<string | null>(null);
  const [mostrarAnimacion, setMostrarAnimacion] = useState(false);

  const [toast, setToast] = useState<{
    open: boolean;
    titulo: string;
    texto: string;
    variant: "success" | "error";
  }>({ open: false, titulo: "", texto: "", variant: "success" });

  const mostrarExito = (texto: string) =>
    setToast({ open: true, titulo: "Éxito", texto, variant: "success" });

  const mostrarError = (texto: string) =>
    setToast({ open: true, titulo: "Error", texto, variant: "error" });

  useEffect(() => {
    if (!ultimaRegionId) return;
    setMostrarAnimacion(true);
    const t = setTimeout(() => setMostrarAnimacion(false), 6000);
    return () => clearTimeout(t);
  }, [ultimaRegionId]);

  const sincronizar = (nuevasOriginales: RegionDemo[]) => {
    setRegionesOriginales(nuevasOriginales);
    setRegiones(aplicarFiltro(nuevasOriginales, busqueda));
  };

  const filtrarBuscador = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const texto = evento.target.value;
    setBusqueda(texto);
    setRegiones(aplicarFiltro(regionesOriginales, texto));
  };

  const abrirVer = (region: RegionDemo) => {
    setRegionSeleccionada(region);
    setOpenVer(true);
  };

  const abrirEditar = (region: RegionDemo) => {
    setRegionSeleccionada(region);
    setOpenEditar(true);
  };

  const abrirEliminar = (region: RegionDemo) => {
    setRegionParaEliminar(region);
    setOpenEliminar(true);
  };

  const handleAgregar = (nombre: string) => {
    const duplicada = regionesOriginales.some(
      (r) => r.nombreRegion.toLowerCase() === nombre.toLowerCase()
    );
    if (duplicada) {
      mostrarError("Ya existe una región con ese nombre");
      return;
    }

    const nueva: RegionDemo = {
      idRegion: String(nextId),
      nombreRegion: nombre,
      created_at: new Date().toISOString().slice(0, 10),
    };

    const actualizadas = [...regionesOriginales, nueva];
    sincronizar(actualizadas);
    setNextId((id) => id + 1);
    setUltimaRegionId(nueva.idRegion);
    setOpenAgregar(false);
    mostrarExito("Región creada exitosamente");
  };

  const handleEditar = (nombre: string) => {
    if (!regionSeleccionada) return;

    const duplicada = regionesOriginales.some(
      (r) =>
        r.idRegion !== regionSeleccionada.idRegion &&
        r.nombreRegion.toLowerCase() === nombre.toLowerCase()
    );
    if (duplicada) {
      mostrarError("Ya existe una región con ese nombre");
      return;
    }

    const actualizadas = regionesOriginales.map((r) =>
      r.idRegion === regionSeleccionada.idRegion ? { ...r, nombreRegion: nombre } : r
    );
    sincronizar(actualizadas);
    setOpenEditar(false);
    setRegionSeleccionada(null);
    mostrarExito("Región actualizada");
  };

  const handleEliminar = () => {
    if (!regionParaEliminar) return;
    const actualizadas = regionesOriginales.filter((r) => r.idRegion !== regionParaEliminar.idRegion);
    const { originales, filtradas } = actualizarListas(actualizadas, busqueda);
    setRegionesOriginales(originales);
    setRegiones(filtradas);
    setOpenEliminar(false);
    setRegionParaEliminar(null);
    mostrarExito("Región eliminada");
  };

  return (
    <div className="rounded-2xl bg-slate-800 p-6 text-slate-100">
      <Toast
        open={toast.open}
        titulo={toast.titulo}
        texto={toast.texto}
        variant={toast.variant}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      <DialogShell open={openAgregar} onClose={() => setOpenAgregar(false)}>
        <FormularioRegion
          etiqueta="Nueva región"
          titulo="Agregar región"
          subtitulo="Crea una región dentro de tu federación."
          valorInicial=""
          textoBoton="Agregar"
          onCancel={() => setOpenAgregar(false)}
          onSubmit={handleAgregar}
        />
      </DialogShell>

      <DialogShell open={openEditar} onClose={() => setOpenEditar(false)}>
        {regionSeleccionada && (
          <FormularioRegion
            etiqueta="Editar región"
            titulo="Editar región"
            subtitulo="Modifica el nombre de la región."
            valorInicial={regionSeleccionada.nombreRegion}
            textoBoton="Guardar"
            onCancel={() => setOpenEditar(false)}
            onSubmit={handleEditar}
          />
        )}
      </DialogShell>

      <DialogShell
        open={openVer}
        onClose={() => setOpenVer(false)}
        className="max-h-120 w-xl max-w-[95vw] overflow-hidden rounded-2xl bg-slate-700"
      >
        {regionSeleccionada && (
          <div className="flex flex-col overflow-hidden">
            <div className="scrollbar-estetica overflow-hidden p-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Información de la región
              </h2>
              <header className="mt-4 border-b border-slate-500/45 pb-6">
                <h3 className="text-balance text-xl font-bold leading-tight text-white sm:text-2xl">
                  {regionSeleccionada.nombreRegion}
                </h3>
              </header>
            </div>
            <div className="flex justify-end p-4">
              <button
                type="button"
                onClick={() => setOpenVer(false)}
                className="cursor-pointer border-2 px-4 py-2 text-white hover:bg-gray-200/20"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </DialogShell>

      <DialogShell
        open={openEliminar}
        onClose={() => {
          setOpenEliminar(false);
          setRegionParaEliminar(null);
        }}
        zIndex="z-[200]"
        className="w-sm max-w-[95vw] rounded-2xl bg-slate-700 p-6"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <IconWarning />
            <h2 className="text-lg font-bold text-white">Confirmar eliminación</h2>
          </div>
          <p className="text-sm text-slate-300">
            ¿Seguro que deseas eliminar a{" "}
            <span className="font-bold text-white">{regionParaEliminar?.nombreRegion ?? ""}</span>?
          </p>
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setOpenEliminar(false);
                setRegionParaEliminar(null);
              }}
              className="cursor-pointer rounded-lg border-2 border-slate-500 px-4 py-2 text-white transition hover:bg-slate-600"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleEliminar}
              className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </DialogShell>

      <section className="mb-4 flex w-full flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Regiones</h1>
          <span className="text-sm text-slate-400">{regiones.length}</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <search className="min-w-0 w-full sm:max-w-md">
            <label
              htmlFor="buscador-regiones-demo"
              className="flex h-11 w-full cursor-text items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/50 px-3 transition-[border-color,box-shadow] focus-within:border-[#00b4d8] focus-within:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]"
            >
              <IconSearch />
              <input
                id="buscador-regiones-demo"
                type="search"
                enterKeyHint="search"
                placeholder="Buscar..."
                value={busqueda}
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                onChange={filtrarBuscador}
              />
            </label>
          </search>
          <div className="flex items-center">
            <button
              type="button"
              className="flex cursor-pointer gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-300"
              onClick={() => setOpenAgregar(true)}
            >
              <IconPlus />
              Agregar
            </button>
          </div>
        </div>
      </section>

      <div className="flex w-full flex-col gap-4">
        {regiones.map((region, index) => (
          <CardRowRegiones
            key={region.idRegion}
            index={index + 1}
            region={region}
            isNuevo={region.idRegion === ultimaRegionId && mostrarAnimacion}
            onView={() => abrirVer(region)}
            onEdit={() => abrirEditar(region)}
            onDelete={() => abrirEliminar(region)}
          />
        ))}
        {regiones.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">No se encontraron regiones.</p>
        )}
      </div>
    </div>
  );
}
