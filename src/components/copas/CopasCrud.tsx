"use client";

import BuscadorRow from "@/components/buscadores/BuscadorRow";
import { ComboBoxBandas } from "@/components/ComboBox/ComboBoxBandas";
import ConfirmDeleteModal from "@/components/modales/ConfirmDeleteModal/ConfirmDeleteModal";
import type {
  bandaDatosAmpleosInterface,
  copaInterface,
  registroEventoDatosAmpleosInterface,
} from "@/models";
import { eliminarCopaAccion } from "@/actions/copasAcciones";
import {
  eventoPermiteEdicionCopas,
  MENSAJE_COPAS_EVENTO_BLOQUEADO,
} from "@/helpers/copas/eventoPermiteEdicionCopas";
import CopasServices from "@/services/copasServices";
import RegistroEventossServices from "@/services/registroEventosServices";
import BandasServices from "@/services/bandasServices";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useRef, useState } from "react";

const LUGARES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type FormCopa = {
  id_foranea_evento: string;
  id_foranea_banda: string;
  lugar: number;
  tipo: "directo" | "desempate";
};

const formVacio: FormCopa = {
  id_foranea_evento: "",
  id_foranea_banda: "",
  lugar: 1,
  tipo: "directo",
};

export default function CopasCrud() {
  const copasServices = useRef(new CopasServices());
  const eventosServices = useRef(new RegistroEventossServices());
  const bandasServices = useRef(new BandasServices());
  const queryClient = useQueryClient();

  const [filtroEvento, setFiltroEvento] = useState("");
  const [search, setSearch] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<copaInterface | null>(null);
  const [form, setForm] = useState<FormCopa>(formVacio);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [copaAEliminar, setCopaAEliminar] = useState<copaInterface | null>(null);

  const { data: eventos = [] as registroEventoDatosAmpleosInterface[] } = useQuery({
    queryKey: ["copas-crud", "eventos"],
    queryFn: async () => {
      await eventosServices.current.initPerfil();
      return eventosServices.current.getDatosAmpleos();
    },
  });

  const { data: bandas = [] as bandaDatosAmpleosInterface[] } = useQuery({
    queryKey: ["copas-crud", "bandas"],
    queryFn: async () => {
      await bandasServices.current.initPerfil();
      return bandasServices.current.getDatosAmpleos();
    },
  });

  const { data: copas = [], isFetching } = useQuery({
    queryKey: ["copas-crud", "lista"],
    queryFn: async () => {
      await copasServices.current.initPerfil();
      return copasServices.current.get();
    },
  });

  const eventoMap = useMemo(
    () => new Map(eventos.map((e) => [e.idEvento, e])),
    [eventos],
  );
  const bandaMap = useMemo(
    () => new Map(bandas.map((b) => [b.idBanda, b])),
    [bandas],
  );

  const copasFiltradas = useMemo(() => {
    let lista = copas;
    if (filtroEvento) {
      lista = lista.filter((c) => c.id_foranea_evento === filtroEvento);
    }
    const q = search.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((c) => {
      const nombre = bandaMap.get(c.id_foranea_banda)?.nombreBanda ?? "";
      return nombre.toLowerCase().includes(q);
    });
  }, [copas, filtroEvento, search, bandaMap]);

  const eventoForm = eventoMap.get(form.id_foranea_evento);
  const eventoEditable = eventoForm
    ? eventoPermiteEdicionCopas(eventoForm.estado_evento)
    : true;

  const abrirCrear = () => {
    setEditando(null);
    setForm({
      ...formVacio,
      id_foranea_evento: filtroEvento || "",
    });
    setError(null);
    setModalAbierto(true);
  };

  const abrirEditar = (copa: copaInterface) => {
    const ev = eventoMap.get(copa.id_foranea_evento);
    if (ev && !eventoPermiteEdicionCopas(ev.estado_evento)) {
      setError(MENSAJE_COPAS_EVENTO_BLOQUEADO);
      return;
    }
    setEditando(copa);
    setForm({
      id_foranea_evento: copa.id_foranea_evento,
      id_foranea_banda: copa.id_foranea_banda,
      lugar: Number(copa.lugar),
      tipo: (copa.tipo as "directo" | "desempate") || "directo",
    });
    setError(null);
    setModalAbierto(true);
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await copasServices.current.initPerfil();
      if (editando) {
        await copasServices.current.update(editando.id_copas, form);
      } else {
        await copasServices.current.create(form);
      }
      await queryClient.invalidateQueries({ queryKey: ["copas-crud"] });
      await queryClient.invalidateQueries({ queryKey: ["copas-temporada"] });
      setModalAbierto(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!copaAEliminar) return;
    try {
      await eliminarCopaAccion(
        copaAEliminar.id_copas,
        copaAEliminar.id_foranea_evento,
      );
      await queryClient.invalidateQueries({ queryKey: ["copas-crud"] });
      setCopaAEliminar(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Gestión de copas</h2>
        <button
          type="button"
          onClick={abrirCrear}
          className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-500"
        >
          <PlusIcon className="h-5 w-5" />
          Agregar copa
        </button>
      </div>

      {error && !modalAbierto && (
        <p className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        <select
          className="rounded-md border border-slate-300 bg-slate-800 p-2 text-slate-100"
          value={filtroEvento}
          onChange={(e) => setFiltroEvento(e.target.value)}
        >
          <option value="">Todos los eventos</option>
          {eventos.map((e) => (
            <option key={e.idEvento} value={e.idEvento}>
              {e.LugarEvento} ({e.estado_evento})
            </option>
          ))}
        </select>
        <BuscadorRow filtrarBuscador={(e) => setSearch(e.target.value)} />
      </div>

      {isFetching ? (
        <p className="text-slate-400">Cargando copas…</p>
      ) : !copasFiltradas.length ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-slate-400">
          No hay copas registradas.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {copasFiltradas.map((copa) => {
            const ev = eventoMap.get(copa.id_foranea_evento);
            const banda = bandaMap.get(copa.id_foranea_banda);
            const editable = ev
              ? eventoPermiteEdicionCopas(ev.estado_evento)
              : false;
            return (
              <li
                key={copa.id_copas}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-700 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-white">
                    {banda?.nombreBanda ?? "Banda"} — {copa.lugar}º lugar
                  </p>
                  <p className="text-sm text-slate-400">
                    {ev?.LugarEvento ?? "Evento"} · {copa.tipo}
                    {!editable && (
                      <span className="ml-2 text-amber-400">(bloqueado)</span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!editable}
                    onClick={() => abrirEditar(copa)}
                    className="rounded-lg bg-slate-600 p-2 disabled:opacity-40"
                    aria-label="Editar"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    disabled={!editable}
                    onClick={() => setCopaAEliminar(copa)}
                    className="rounded-lg bg-red-900/50 p-2 disabled:opacity-40"
                    aria-label="Eliminar"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">
              {editando ? "Editar copa" : "Nueva copa"}
            </h3>
            {!eventoEditable && (
              <p className="mb-3 text-sm text-amber-300">{MENSAJE_COPAS_EVENTO_BLOQUEADO}</p>
            )}
            {error && (
              <p className="mb-3 text-sm text-red-300">{error}</p>
            )}
            <div className="flex flex-col gap-3">
              <label className="text-sm text-slate-400">
                Evento
                <select
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 p-2 text-white"
                  value={form.id_foranea_evento}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, id_foranea_evento: e.target.value }))
                  }
                  disabled={!eventoEditable}
                >
                  <option value="">Selecciona</option>
                  {eventos.map((e) => (
                    <option key={e.idEvento} value={e.idEvento}>
                      {e.LugarEvento} ({e.estado_evento})
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-slate-400">
                Banda
                <div className="mt-1">
                  <ComboBoxBandas
                    bandas={bandas}
                    value={form.id_foranea_banda}
                    onChange={(id) =>
                      setForm((f) => ({ ...f, id_foranea_banda: id }))
                    }
                    disabled={!eventoEditable}
                    placeholder="Selecciona banda"
                  />
                </div>
              </label>
              <label className="text-sm text-slate-400">
                Lugar
                <select
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 p-2 text-white"
                  value={form.lugar}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lugar: Number(e.target.value) }))
                  }
                  disabled={!eventoEditable}
                >
                  {LUGARES.map((n) => (
                    <option key={n} value={n}>
                      {n}º lugar
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-slate-400">
                Tipo
                <select
                  className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-700 p-2 text-white"
                  value={form.tipo}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      tipo: e.target.value as "directo" | "desempate",
                    }))
                  }
                  disabled={!eventoEditable}
                >
                  <option value="directo">Directo</option>
                  <option value="desempate">Desempate</option>
                </select>
              </label>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex-1 rounded-lg border border-slate-500 py-2"
                onClick={() => setModalAbierto(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={guardando || !eventoEditable}
                className="flex-1 rounded-lg bg-sky-600 py-2 font-semibold disabled:opacity-50"
                onClick={() => void guardar()}
              >
                {guardando ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={!!copaAEliminar}
        onClose={() => setCopaAEliminar(null)}
        onConfirm={() => void eliminar()}
        titulo="Eliminar copa"
        nombreElemento="esta asignación de copa"
      />
    </div>
  );
}
