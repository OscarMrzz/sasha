"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import BuscadorRow from "@/component/buscadores/BuscadorRow";
import SkeletonTabla from "@/component/skeleton/SkeletonTabla/Page";
import RegionService from "@/lib/services/regionesServices";
import RegistroEventossServices from "@/lib/services/registroEventosServices";
import ConfirmacionAsistenciaServices from "@/lib/services/confirmacionAsistenciaServices";
import {
  regionesInterface,
  registroEventoDatosAmpleosInterface,
  confirmacionAsistenciaInterface,
} from "@/interfaces/interfaces";
import CardRowAgendaBanda from "@/component/CardRow/CardRowAgendaBanda";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

const selectBaseClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100 transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]";

const MESES = [
  { idMes: "1", nombreMes: "Enero" },
  { idMes: "2", nombreMes: "Febrero" },
  { idMes: "3", nombreMes: "Marzo" },
  { idMes: "4", nombreMes: "Abril" },
  { idMes: "5", nombreMes: "Mayo" },
  { idMes: "6", nombreMes: "Junio" },
  { idMes: "7", nombreMes: "Julio" },
  { idMes: "8", nombreMes: "Agosto" },
  { idMes: "9", nombreMes: "Septiembre" },
  { idMes: "10", nombreMes: "Octubre" },
  { idMes: "11", nombreMes: "Noviembre" },
  { idMes: "12", nombreMes: "Diciembre" },
] as const;

const MI_BANDA_EVENTOS_AGENDA_QUERY_KEY: unknown[] = ["mi-banda-eventos-agenda"];

function fechaSoloLocal(isoOrDate: string): Date {
  const raw = isoOrDate.split("T")[0];
  const [y, m, d] = raw.split("-").map((n) => Number(n));
  return new Date(y, (m || 1) - 1, d || 1);
}

function inicioHoyLocal(): Date {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

function esEventoPasado(fechaEvento: string): boolean {
  const dia = fechaSoloLocal(fechaEvento);
  return dia < inicioHoyLocal();
}

function coincideFiltros(
  e: registroEventoDatosAmpleosInterface,
  regionId: string,
  mesId: string,
  textoBusqueda: string
): boolean {
  if (regionId && e.idForaneaRegion !== regionId) return false;
  if (mesId) {
    const mesEvento = e.fechaEvento.split("-")[1];
    if (mesEvento !== mesId.padStart(2, "0")) return false;
  }
  const t = textoBusqueda.trim().toLowerCase();
  if (t) {
    const lugar = (e.LugarEvento ?? "").toLowerCase();
    const regionNombre = (e.regiones?.nombreRegion ?? "").toLowerCase();
    if (!lugar.includes(t) && !regionNombre.includes(t)) return false;
  }
  return true;
}

function mapConfirmacionesPorEvento(
  filas: confirmacionAsistenciaInterface[],
): Map<string, boolean> {
  const m = new Map<string, boolean>();
  for (const c of filas) {
    m.set(c.id_foranea_evento, c.estado_asistencia);
  }
  return m;
}

export default function MiBandaEventosPage() {
  const eventosServices = useRef(new RegistroEventossServices());
  const [regionesLista, setRegionesLista] = useState<regionesInterface[]>([]);
  const [cargandoFiltros, setCargandoFiltros] = useState(true);
  const [regionSeleccionada, setRegionSeleccionada] = useState("");
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [textoBusqueda, setTextoBusqueda] = useState("");

  const { data, isPending, isError, error } = useQuery({
    queryKey: MI_BANDA_EVENTOS_AGENDA_QUERY_KEY,
    queryFn: async () => {
      const svc = eventosServices.current;
      await svc.initPerfil();
      const eventos = await svc.getDatosAmpleos();
      const idBanda = svc.perfil?.idForaneaBanda ?? null;
      let confirmaciones: confirmacionAsistenciaInterface[] = [];
      if (idBanda?.trim()) {
        const confSvc = new ConfirmacionAsistenciaServices();
        confirmaciones = await confSvc.getAllConfirmaciones(idBanda);
      }
      return { eventos, idBanda, confirmaciones };
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const regionService = new RegionService();
        const regionData = await regionService.get();
        if (!cancelled) setRegionesLista(regionData);
      } catch (e) {
        console.error("❌ Error al cargar regiones:", e);
      } finally {
        if (!cancelled) setCargandoFiltros(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { proximos, pasados } = useMemo(() => {
    const lista = data?.eventos ?? [];
    const prox: registroEventoDatosAmpleosInterface[] = [];
    const past: registroEventoDatosAmpleosInterface[] = [];
    for (const e of lista) {
      if (esEventoPasado(e.fechaEvento)) past.push(e);
      else prox.push(e);
    }
    prox.sort((a, b) => a.fechaEvento.localeCompare(b.fechaEvento));
    past.sort((a, b) => b.fechaEvento.localeCompare(a.fechaEvento));
    return { proximos: prox, pasados: past };
  }, [data]);

  const estadoAsistenciaPorEventoId = useMemo(
    () => mapConfirmacionesPorEvento(data?.confirmaciones ?? []),
    [data?.confirmaciones],
  );

  const proximosFiltrados = useMemo(
    () =>
      proximos.filter((e) =>
        coincideFiltros(e, regionSeleccionada, mesSeleccionado, textoBusqueda)
      ),
    [proximos, regionSeleccionada, mesSeleccionado, textoBusqueda]
  );

  const pasadosFiltrados = useMemo(
    () =>
      pasados.filter((e) =>
        coincideFiltros(e, regionSeleccionada, mesSeleccionado, textoBusqueda)
      ),
    [pasados, regionSeleccionada, mesSeleccionado, textoBusqueda]
  );

  const proximosAgrupados = useMemo(() => {
    const map = new Map<string, registroEventoDatosAmpleosInterface[]>();
    for (const e of proximosFiltrados) {
      const key = e.fechaEvento.split("T")[0];
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [proximosFiltrados]);

  useEffect(() => {
    if (isError) console.error("❌ Error al obtener eventos:", error);
  }, [isError, error]);

  const idBanda = data?.idBanda?.trim() ?? null;

  return (
    <div className="w-full pb-25">
      {idBanda ? (
        <Link
          href={`/mi-banda-page/${idBanda}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-sky-400 transition hover:text-sky-300"
        >
          <ChevronLeftIcon className="h-4 w-4" aria-hidden />
          Volver inicio
        </Link>
      ) : null}
      <section className="mb-6 flex w-full flex-col gap-4">
        <header>
          <h1 className="text-2xl font-bold text-white">Agenda de eventos</h1>
         
        </header>

        <BuscadorRow
          filtrarBuscador={(ev) => setTextoBusqueda(ev.target.value)}
        />

        <div className="grid gap-3 sm:grid-cols-2 sm:max-w-2xl">
          <div className="min-w-0">
            <label
              htmlFor="agenda-filtro-region"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
            >
              Región
            </label>
            <select
              id="agenda-filtro-region"
              className={selectBaseClass}
              value={regionSeleccionada}
              onChange={(e) => setRegionSeleccionada(e.target.value)}
              disabled={cargandoFiltros}
            >
              <option className="bg-slate-800 text-slate-100" value="">
                Todas las regiones
              </option>
              {regionesLista.map((r) => (
                <option
                  className="bg-slate-800 text-slate-100"
                  key={r.idRegion}
                  value={r.idRegion}
                >
                  {r.nombreRegion}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0">
            <label
              htmlFor="agenda-filtro-mes"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
            >
              Mes
            </label>
            <select
              id="agenda-filtro-mes"
              className={selectBaseClass}
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(e.target.value)}
            >
              <option className="bg-slate-800 text-slate-100" value="">
                Todos los meses
              </option>
              {MESES.map((m) => (
                <option
                  className="bg-slate-800 text-slate-100"
                  key={m.idMes}
                  value={m.idMes}
                >
                  {m.nombreMes}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {isPending ? (
        <SkeletonTabla />
      ) : isError ? (
        <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          No se pudieron cargar los eventos. Comprueba tu sesión y que el perfil tenga federación
          asignada.
        </p>
      ) : (
        <>
          <section aria-label="Próximos eventos" className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-slate-600/30" />
              <h2 className="shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300/90">
                Próximos
              </h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-600 to-slate-600/30" />
            </div>

            {proximosFiltrados.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-600 bg-slate-800/40 px-4 py-8 text-center text-sm text-slate-400">
                {proximos.length === 0
                  ? "No hay eventos programados a futuro."
                  : "No hay próximos eventos que coincidan con los filtros."}
              </p>
            ) : (
              <div className="relative pl-2 sm:pl-3">
                <div
                  className="absolute bottom-6 left-[1.45rem] top-2 w-px bg-gradient-to-b from-[var(--color-primario)]/50 via-slate-600/80 to-transparent sm:left-[1.6rem]"
                  aria-hidden
                />
                <ul className="relative z-[1] flex flex-col gap-4 sm:gap-5">
                  {proximosAgrupados.map(([fechaDia, eventosDia]) => (
                    <li key={fechaDia} className="flex flex-col gap-3">
                      {eventosDia.map((evento) => (
                        <CardRowAgendaBanda
                          key={evento.idEvento}
                          evento={evento}
                          idBanda={data?.idBanda ?? null}
                          estadoAsistenciaPorEventoId={estadoAsistenciaPorEventoId}
                          queryKey={MI_BANDA_EVENTOS_AGENDA_QUERY_KEY}
                        />
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <details className="group mt-12 overflow-hidden rounded-xl border border-slate-600 bg-slate-800/30 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-700/30">
              <span className="text-sm font-medium text-slate-300">
                Ver eventos pasados
                <span className="ml-2 tabular-nums text-slate-500">
                  ({pasadosFiltrados.length}
                  {pasadosFiltrados.length !== pasados.length ? ` de ${pasados.length}` : ""})
                </span>
              </span>
              <ChevronDownIcon className="h-5 w-5 shrink-0 text-slate-500 transition group-open:rotate-180" />
            </summary>
            <div className="border-t border-slate-700/80 px-3 py-4 sm:px-4">
              {pasadosFiltrados.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">
                  {pasados.length === 0
                    ? "No hay eventos pasados registrados."
                    : "Ningún evento pasado coincide con los filtros."}
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {pasadosFiltrados.map((evento) => (
                    <li key={evento.idEvento}>
                      <CardRowAgendaBanda
                        evento={evento}
                        tenue
                        idBanda={data?.idBanda ?? null}
                        estadoAsistenciaPorEventoId={estadoAsistenciaPorEventoId}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        </>
      )}
    </div>
  );
}
