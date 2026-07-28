"use client";

import BuscadorRow from "@/components/buscadores/BuscadorRow";
import type {
  categoriaDatosAmpleosInterface,
  registroEventoDatosAmpleosInterface,
} from "@/models";
import { eventoPermiteEdicionCopas } from "@/helpers/copas/eventoPermiteEdicionCopas";
import { filtrarEventosDelDia } from "@/helpers/fechas/eventosDelDia";
import CopasServices from "@/services/copasServices";
import RegistroEventossServices from "@/services/registroEventosServices";
import CategoriasServices from "@/services/categoriaServices";
import BandasServices from "@/services/bandasServices";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useRef, useState } from "react";

export default function TablaConsultaCopasEvento() {
  const eventosServices = useRef(new RegistroEventossServices());
  const categoriasServices = useRef(new CategoriasServices());
  const copasServices = useRef(new CopasServices());
  const bandasServices = useRef(new BandasServices());

  const [idEvento, setIdEvento] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [search, setSearch] = useState("");

  const { data: eventos = [] as registroEventoDatosAmpleosInterface[] } = useQuery({
    queryKey: ["consulta-copas", "eventos"],
    queryFn: async () => {
      await eventosServices.current.initPerfil();
      const todos = await eventosServices.current.getDatosAmpleos();
      return filtrarEventosDelDia(todos);
    },
  });

  const { data: categorias = [] as categoriaDatosAmpleosInterface[] } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => categoriasServices.current.getDatosAmpleos(),
  });

  const eventoSeleccionado = eventos.find((e) => e.idEvento === idEvento);

  const { data: filas = [], isFetching } = useQuery({
    queryKey: ["consulta-copas", idEvento, idCategoria],
    queryFn: async () => {
      await copasServices.current.initPerfil();
      await bandasServices.current.initPerfil();
      const [copas, bandas] = await Promise.all([
        copasServices.current.getPorEvento(idEvento),
        bandasServices.current.getDatosAmpleos(),
      ]);

      const bandaPorId = new Map(bandas.map((b) => [b.idBanda, b]));

      return copas
        .flatMap((copa) => {
          const idBanda = copa.id_foranea_banda?.trim();
          if (!idBanda) return [];

          const lugar = Number(copa.lugar);
          if (!Number.isFinite(lugar) || lugar <= 0) return [];

          const banda = bandaPorId.get(idBanda);
          if (!banda || banda.idForaneaCategoria !== idCategoria) return [];

          return [
            {
              idBanda,
              nombreBanda: banda.nombreBanda,
              lugar,
              tipo: copa.tipo ?? null,
            },
          ];
        })
        .sort((a, b) => a.lugar - b.lugar);
    },
    enabled: Boolean(idEvento.trim() && idCategoria.trim()),
  });

  const filasFiltradas = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filas;
    return filas.filter((f) => f.nombreBanda.toLowerCase().includes(q));
  }, [filas, search]);

  const bloqueado = eventoSeleccionado
    ? !eventoPermiteEdicionCopas(eventoSeleccionado.estado_evento)
    : false;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-8">
      <h1 className="text-2xl font-bold">Consultar copas por evento</h1>
      <p className="text-sm text-slate-400">
        Elige evento y categoría para ver qué copa obtuvo cada banda participante.
      </p>

      {bloqueado && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-3 text-sm text-amber-100">
          Este evento está finalizado o cancelado. Solo consulta; no se pueden modificar copas.
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        <select
          className="rounded-md border border-slate-300 bg-slate-800 p-2 text-slate-100"
          value={idEvento}
          onChange={(e) => {
            setIdEvento(e.target.value);
            setIdCategoria("");
          }}
        >
          <option value="">Selecciona evento</option>
          {eventos.map((e) => (
            <option key={e.idEvento} value={e.idEvento}>
              {e.LugarEvento} ({e.estado_evento})
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-slate-300 bg-slate-800 p-2 text-slate-100"
          value={idCategoria}
          onChange={(e) => setIdCategoria(e.target.value)}
          disabled={!idEvento}
        >
          <option value="">Selecciona categoría</option>
          {categorias.map((c) => (
            <option key={c.idCategoria} value={c.idCategoria}>
              {c.nombreCategoria}
            </option>
          ))}
        </select>
        <BuscadorRow filtrarBuscador={(e) => setSearch(e.target.value)} />
      </div>

      {!idEvento || !idCategoria ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          Selecciona evento y categoría.
        </p>
      ) : isFetching ? (
        <p className="text-slate-400">Cargando…</p>
      ) : !filasFiltradas.length ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          No hay copas asignadas en esta categoría para el evento.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filasFiltradas.map((f) => (
            <li
              key={f.idBanda}
              className="flex items-center justify-between rounded-xl bg-slate-700 px-4 py-4"
            >
              <span className="font-semibold text-white">{f.nombreBanda}</span>
              <span className="rounded-full bg-amber-500/25 px-3 py-1 font-bold text-amber-100">
                {f.lugar}º lugar
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
