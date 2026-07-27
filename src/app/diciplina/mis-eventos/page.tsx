"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BuscadorRow from "@/component/buscadores/BuscadorRow";
import CardRowEventos from "@/component/CardRow/CardRowEventos";
import ModalVerEvento from "@/component/informacion/ifnromacionEventoComponent/ModalVerEvento";
import SkeletonTabla from "@/component/skeleton/SkeletonTabla/Page";
import { useEventosDisciplina } from "@/hooks/diciplina/useEventosDisciplina";
import { fechaHoyISO, normalizarFechaEvento } from "@/component/diciplina/checkoutUtils";
import type { regionesInterface, registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";
import RegionService from "@/lib/services/regionesServices";

const selectBaseClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100 transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]";

const LISTA_MESES = [
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
];

export default function MisEventosDisciplinaPage() {
  const hoy = fechaHoyISO();
  const [eventoActivo, setEventoActivo] = useState<registroEventoDatosAmpleosInterface | null>(null);
  const [openVer, setOpenVer] = useState(false);
  const [regionesLista, setRegionesLista] = useState<regionesInterface[]>([]);
  const [regionSelecionada, setRegionSelecionada] = useState("");
  const [anioSeleccionado, setAnioSeleccionado] = useState("");
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const { eventosAsignados, isPending, isError, error } = useEventosDisciplina();

  const aniosList = useMemo(() => {
    const anios = eventosAsignados.map((e) => e.fechaEvento.split("-")[0]);
    return Array.from(new Set(anios)).sort((a, b) => b.localeCompare(a));
  }, [eventosAsignados]);

  const eventosMostrados = useMemo(() => {
    let list = eventosAsignados;

    if (regionSelecionada) {
      list = list.filter((e) => e.idForaneaRegion === regionSelecionada);
    }
    if (mesSeleccionado) {
      list = list.filter(
        (e) => e.fechaEvento.split("-")[1] === mesSeleccionado.padStart(2, "0"),
      );
    }
    if (anioSeleccionado) {
      list = list.filter((e) => e.fechaEvento.split("-")[0] === String(anioSeleccionado));
    }
    const texto = busqueda.trim().toLowerCase();
    if (texto) {
      list = list.filter(
        (e) =>
          e.LugarEvento.toLowerCase().includes(texto) ||
          (e.regiones?.nombreRegion ?? "").toLowerCase().includes(texto),
      );
    }
    return list;
  }, [eventosAsignados, regionSelecionada, mesSeleccionado, anioSeleccionado, busqueda]);

  const eventosHoy = useMemo(
    () =>
      eventosMostrados.filter(
        (e) => normalizarFechaEvento(e.fechaEvento) === hoy,
      ),
    [eventosMostrados, hoy],
  );

  useEffect(() => {
    if (isError) console.error("❌ Error al obtener eventos (disciplina):", error);
  }, [isError, error]);

  useEffect(() => {
    const cargarRegiones = async () => {
      try {
        const regionService = new RegionService();
        const regionData = await regionService.get();
        setRegionesLista(regionData);
      } catch (e) {
        console.error("❌ Error al obtener regiones:", e);
      }
    };
    void cargarRegiones();
  }, []);

  const abrirInformacion = (evento: registroEventoDatosAmpleosInterface) => {
    setEventoActivo(evento);
    setOpenVer(true);
  };

  const cerrarModal = () => {
    setOpenVer(false);
    setEventoActivo(null);
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {eventoActivo ? (
        <ModalVerEvento open={openVer} onClose={cerrarModal} evento={eventoActivo} />
      ) : null}

      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Mis eventos</h1>
        <p className="text-sm text-slate-400">
          Eventos en los que estás asignado como comité de disciplina en el equipo evaluador.
        </p>
      </header>

      {eventosHoy.length > 0 ? (
        <section className="rounded-xl border border-[#00b4d8]/30 bg-[#00b4d8]/10 p-4">
          <p className="mb-3 text-sm font-medium text-[#00b4d8]">
            Hoy ({hoy}) tienes {eventosHoy.length} evento
            {eventosHoy.length === 1 ? "" : "s"} — puedes usar checkout
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/diciplina/checkout-llegada"
              className="rounded-lg bg-[#00b4d8] px-3 py-1.5 text-sm font-semibold text-[#0a1628] hover:bg-[#0096b8]"
            >
              Checkout llegada
            </Link>
            <Link
              href="/diciplina/checkout-entrada"
              className="rounded-lg border border-[#00b4d8]/50 px-3 py-1.5 text-sm text-white hover:bg-[#00b4d8]/20"
            >
              Checkout entrada
            </Link>
            <Link
              href="/diciplina/historial-chekout"
              className="rounded-lg border border-slate-500 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-600"
            >
              Historial checkout
            </Link>
          </div>
        </section>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <BuscadorRow
          filtrarBuscador={(e) => {
            setBusqueda(e.target.value);
            if (e.target.value.trim()) {
              setRegionSelecionada("");
              setMesSeleccionado("");
              setAnioSeleccionado("");
            }
          }}
        />
        <p className="text-sm text-slate-400">
          {eventosMostrados.length} de {eventosAsignados.length} eventos
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 sm:max-w-4xl">
        <div className="min-w-0">
          <label
            htmlFor="filtro-region-disciplina"
            className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
          >
            Región
          </label>
          <select
            id="filtro-region-disciplina"
            className={selectBaseClass}
            value={regionSelecionada}
            onChange={(e) => setRegionSelecionada(e.target.value)}
          >
            <option value="">Todas las regiones</option>
            {regionesLista.map((r) => (
              <option key={r.idRegion} value={r.idRegion}>
                {r.nombreRegion}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label
            htmlFor="filtro-anio-disciplina"
            className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
          >
            Año
          </label>
          <select
            id="filtro-anio-disciplina"
            className={selectBaseClass}
            value={anioSeleccionado}
            onChange={(e) => setAnioSeleccionado(e.target.value)}
          >
            <option value="">Todos los años</option>
            {aniosList.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <label
            htmlFor="filtro-mes-disciplina"
            className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
          >
            Mes
          </label>
          <select
            id="filtro-mes-disciplina"
            className={selectBaseClass}
            value={mesSeleccionado}
            onChange={(e) => setMesSeleccionado(e.target.value)}
          >
            <option value="">Todos los meses</option>
            {LISTA_MESES.map((mes) => (
              <option key={mes.idMes} value={mes.idMes}>
                {mes.nombreMes}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isPending ? (
        <SkeletonTabla />
      ) : eventosMostrados.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-slate-400">
          {eventosAsignados.length === 0
            ? "No tienes eventos asignados como comité de disciplina."
            : "No hay eventos que coincidan con los filtros."}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {eventosMostrados.map((evento, index) => (
            <CardRowEventos
              key={evento.idEvento}
              index={index + 1}
              evento={evento}
              abrirInformacion={abrirInformacion}
              modoSoloVer
              ocultarControles
            />
          ))}
        </div>
      )}
    </div>
  );
}
