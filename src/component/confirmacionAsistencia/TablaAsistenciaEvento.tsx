"use client";

import { ComboBoxBandas } from "@/component/ComboBox/ComboBoxBandas";
import { ComboBoxCategorias } from "@/component/ComboBox/ComboBoxCategorias";
import { ComboBoxEventos } from "@/component/ComboBox/ComboBoxEventos";
import CardRowAsistencia from "@/component/confirmacionAsistencia/CardRowAsistencia";
import type {
  bandaDatosAmpleosInterface,
  bandaInterface,
  categoriaDatosAmpleosInterface,
  confirmacionConBandaInterface,
  RegistroEventoInterface,
} from "@/interfaces/interfaces";
import { formatearFechaEvento } from "@/lib/fechas/formatearFechaEvento";
import BandasServices from "@/lib/services/bandasServices";
import CategoriasServices from "@/lib/services/categoriaServices";
import ConfirmacionAsistenciaServices from "@/lib/services/confirmacionAsistenciaServices";
import RegistroEventossServices from "@/lib/services/registroEventosServices";
import { useAsistenciaFiltrosStore } from "@/Store/ConfirmacionStore/asistenciaFiltrosStore";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";

type TablaAsistenciaEventoProps = {
  titulo?: string;
};

const labelClassName =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400";

export default function TablaAsistenciaEvento({
  titulo = "Confirmacion de asistencia",
}: TablaAsistenciaEventoProps) {
  const eventosServices = useRef(new RegistroEventossServices());
  const categoriasServices = useRef(new CategoriasServices());
  const bandasServices = useRef(new BandasServices());
  const confirmacionServices = useRef(new ConfirmacionAsistenciaServices());

  const eventoSeleccionado = useAsistenciaFiltrosStore((s) => s.eventoSeleccionado);
  const categoriaSeleccionada = useAsistenciaFiltrosStore(
    (s) => s.categoriaSeleccionada,
  );
  const bandaSeleccionada = useAsistenciaFiltrosStore((s) => s.bandaSeleccionada);
  const setEvento = useAsistenciaFiltrosStore((s) => s.setEvento);
  const setCategoria = useAsistenciaFiltrosStore((s) => s.setCategoria);
  const setBanda = useAsistenciaFiltrosStore((s) => s.setBanda);

  const { data: eventos = [], isPending: cargandoEventos } = useQuery({
    queryKey: ["asistencia-evento", "eventos"],
    queryFn: async () => {
      await eventosServices.current.initPerfil();
      return eventosServices.current.getDatosAmpleos();
    },
  });

  const { data: categoriasList = [] as categoriaDatosAmpleosInterface[] } =
    useQuery({
      queryKey: ["asistencia-evento", "categorias"],
      queryFn: () => categoriasServices.current.getDatosAmpleos(),
    });

  const { data: bandasList = [] as bandaDatosAmpleosInterface[] } = useQuery({
    queryKey: ["asistencia-evento", "bandas"],
    queryFn: async () => {
      await bandasServices.current.initPerfil();
      return bandasServices.current.getDatosAmpleos();
    },
  });

  const {
    data: confirmaciones = [],
    isFetching: cargandoConfirmaciones,
  } = useQuery({
    queryKey: ["asistencia-evento", "confirmaciones", eventoSeleccionado],
    queryFn: () =>
      confirmacionServices.current.getConfirmacionesPorEvento(eventoSeleccionado),
    enabled: !!eventoSeleccionado.trim(),
  });

  const eventosOrdenados = useMemo((): RegistroEventoInterface[] => {
    return [...eventos].sort(
      (a, b) =>
        new Date(b.fechaEvento).getTime() - new Date(a.fechaEvento).getTime(),
    );
  }, [eventos]);

  const bandasPorId = useMemo(() => {
    const map = new Map<string, bandaDatosAmpleosInterface>();
    for (const b of bandasList) {
      map.set(b.idBanda, b);
    }
    return map;
  }, [bandasList]);

  const bandasParaCombo = useMemo((): bandaInterface[] => {
    if (!eventoSeleccionado.trim()) return [];

    const ids = new Set(
      confirmaciones.map((c) => c.id_foranea_banda).filter(Boolean),
    );

    const lista: bandaInterface[] = [];
    for (const id of ids) {
      const banda = bandasPorId.get(id);
      if (!banda) continue;
      if (
        categoriaSeleccionada.trim() &&
        banda.idForaneaCategoria !== categoriaSeleccionada
      ) {
        continue;
      }
      lista.push(banda);
    }

    lista.sort((a, b) =>
      a.nombreBanda.localeCompare(b.nombreBanda, "es", { sensitivity: "base" }),
    );
    return lista;
  }, [confirmaciones, bandasPorId, eventoSeleccionado, categoriaSeleccionada]);

  const filas = useMemo((): confirmacionConBandaInterface[] => {
    const filasBase: confirmacionConBandaInterface[] = [];
    for (const c of confirmaciones) {
      const banda = bandasPorId.get(c.id_foranea_banda);
      if (!banda) continue;
      filasBase.push({
        ...c,
        nombreBanda: banda.nombreBanda,
        AliasBanda: banda.AliasBanda ?? null,
        urlLogoBanda: banda.urlLogoBanda ?? null,
        idForaneaCategoria: banda.idForaneaCategoria,
        nombreCategoria: banda.categorias?.nombreCategoria ?? "Sin categoría",
      });
    }
    let base = filasBase;

    if (categoriaSeleccionada.trim()) {
      base = base.filter(
        (f) => f.idForaneaCategoria === categoriaSeleccionada,
      );
    }

    if (bandaSeleccionada.trim()) {
      base = base.filter((f) => f.id_foranea_banda === bandaSeleccionada);
    }

    base.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    return base;
  }, [confirmaciones, bandasPorId, categoriaSeleccionada, bandaSeleccionada]);

  const eventoActual = eventos.find((e) => e.idEvento === eventoSeleccionado);
  const nombreCategoria =
    categoriasList.find((c) => c.idCategoria === categoriaSeleccionada)
      ?.nombreCategoria ?? "Todas las categorías";
  const nombreBanda =
    bandasParaCombo.find((b) => b.idBanda === bandaSeleccionada)?.nombreBanda ??
    "Todas las bandas";

  const filtrosListos = !!eventoSeleccionado.trim();

  const handleCategoria = (id: string) => {
    setCategoria(id);
    if (bandaSeleccionada && id.trim()) {
      const banda = bandasPorId.get(bandaSeleccionada);
      if (banda && banda.idForaneaCategoria !== id) {
        setBanda("");
      }
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-8">
      <section className="mb-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-100">{titulo}</h1>
          <span
            className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-slate-700 px-2.5 py-0.5 text-sm font-semibold text-slate-200"
            aria-label="Total de bandas confirmadas"
          >
            {filtrosListos ? filas.length : "—"}
          </span>
        </div>

        <p className="text-sm text-slate-400">
          {filtrosListos && eventoActual ? (
            <>
              <span className="text-slate-200">
                {formatearFechaEvento(eventoActual.fechaEvento)}
              </span>
              {" · "}
              <span className="text-slate-200">{eventoActual.LugarEvento}</span>
              {" · "}
              <span className="text-slate-200">{nombreCategoria}</span>
              {bandaSeleccionada.trim() ? (
                <>
                  {" · "}
                  <span className="text-slate-200">{nombreBanda}</span>
                </>
              ) : null}
            </>
          ) : (
            <>
              Selecciona un <span className="text-slate-200">evento</span> para
              ver las bandas que confirmaron asistencia y la fecha y hora de
              cada confirmación.
            </>
          )}
          {cargandoConfirmaciones && (
            <span className="ml-2 text-slate-500">Cargando…</span>
          )}
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
          <div className="min-w-0">
            <label htmlFor="combo-evento-asistencia" className={labelClassName}>
              Evento
            </label>
            <ComboBoxEventos
              id="combo-evento-asistencia"
              eventos={eventosOrdenados}
              value={eventoSeleccionado}
              onChange={setEvento}
              disabled={cargandoEventos}
              placeholder="Seleccionar evento"
              emptyLabel="No hay eventos"
            />
          </div>
          <div className="min-w-0">
            <label
              htmlFor="combo-categoria-asistencia"
              className={labelClassName}
            >
              Categoría
            </label>
            <ComboBoxCategorias
              id="combo-categoria-asistencia"
              categorias={categoriasList}
              value={categoriaSeleccionada}
              onChange={handleCategoria}
              placeholder="Todas las categorías"
              emptyLabel="No hay categorías"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="combo-banda-asistencia" className={labelClassName}>
              Banda
            </label>
            <ComboBoxBandas
              id="combo-banda-asistencia"
              bandas={bandasParaCombo}
              value={bandaSeleccionada}
              onChange={setBanda}
              disabled={!filtrosListos || cargandoConfirmaciones}
              placeholder="Todas las bandas"
              emptyLabel={
                filtrosListos
                  ? "Sin bandas confirmadas en este evento"
                  : "Selecciona un evento primero"
              }
            />
          </div>
        </div>
      </section>

      {!filtrosListos ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          Elige un evento para consultar la lista de asistencia confirmada.
        </p>
      ) : !filas.length && !cargandoConfirmaciones ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          No hay bandas con asistencia confirmada para este evento (o ninguna
          coincide con los filtros).
        </p>
      ) : (
        <section className="flex flex-col gap-4 sm:gap-5">
          {filas.map((fila, i) => (
            <CardRowAsistencia
              key={fila.id_confirmacion_asistencia}
              fila={fila}
              index={i}
            />
          ))}
        </section>
      )}
    </div>
  );
}
