"use client";

import BuscadorRow from "@/component/buscadores/BuscadorRow";
import CardRowEventos from "@/component/CardRow/CardRowEventos";
import ModalVerEvento from "@/component/informacion/ifnromacionEventoComponent/ModalVerEvento";
import ModalJurados from "@/component/informacion/ifnromacionEventoComponent/ModalJurados";
import ModalFiscal from "@/component/informacion/ifnromacionEventoComponent/ModalFiscal";
import SkeletonTabla from "@/component/skeleton/SkeletonTabla/Page";
import { useEventosResponsableMesa } from "@/hooks/responsableMesa/useEventosResponsableMesa";
import type { regionesInterface, registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";
import RegionService from "@/lib/services/regionesServices";
import { useEventosResponsableMesaFiltrosStore } from "@/Store/responsableMesa/useEventosResponsableMesaFiltrosStore";
import React, { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

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

type ModalTipo = "ver" | "jurados" | "fiscal" | null;

export default function ResponsableMesaEventosPage() {
  const queryClient = useQueryClient();

  const [eventoActivo, setEventoActivo] = useState<registroEventoDatosAmpleosInterface | null>(null);
  const [modalAbierto, setModalAbierto] = useState<ModalTipo>(null);
  const [regionesLista, setRegionLista] = useState<regionesInterface[]>([]);
  const [cargandoRegiones, setCargandoRegiones] = useState(false);

  const regionSelecionada = useEventosResponsableMesaFiltrosStore((s) => s.regionSelecionada);
  const anioSeleccionado = useEventosResponsableMesaFiltrosStore((s) => s.anioSeleccionado);
  const fechaSeleccionada = useEventosResponsableMesaFiltrosStore((s) => s.fechaSeleccionada);
  const searchText = useEventosResponsableMesaFiltrosStore((s) => s.searchText);
  const setRegion = useEventosResponsableMesaFiltrosStore((s) => s.setRegion);
  const setAnio = useEventosResponsableMesaFiltrosStore((s) => s.setAnio);
  const setMes = useEventosResponsableMesaFiltrosStore((s) => s.setMes);
  const setSearch = useEventosResponsableMesaFiltrosStore((s) => s.setSearch);

  const { eventosAsignados, isPending, isError, error, fusionarEstadoEvento, refrescar } =
    useEventosResponsableMesa();

  const aniosList = useMemo(() => {
    const anios = eventosAsignados.map((e) => e.fechaEvento.split("-")[0]);
    return Array.from(new Set(anios));
  }, [eventosAsignados]);

  const eventosMostrados = useMemo(() => {
    let list = eventosAsignados;

    if (regionSelecionada) {
      list = list.filter((e) => e.idForaneaRegion === regionSelecionada);
    }
    if (fechaSeleccionada) {
      list = list.filter((e) => e.fechaEvento.split("-")[1] === fechaSeleccionada.padStart(2, "0"));
    }
    if (anioSeleccionado) {
      list = list.filter((e) => e.fechaEvento.split("-")[0] === String(anioSeleccionado));
    }
    const texto = searchText.trim().toLowerCase();
    if (texto) {
      list = list.filter((e) => e.LugarEvento.toLowerCase().includes(texto));
    }
    return list;
  }, [eventosAsignados, regionSelecionada, fechaSeleccionada, anioSeleccionado, searchText]);

  useEffect(() => {
    if (isError) console.error("❌ Error al obtener eventos (responsable mesa):", error);
  }, [isError, error]);

  useEffect(() => {
    const cargarRegiones = async () => {
      setCargandoRegiones(true);
      try {
        const regionService = new RegionService();
        const regionData = await regionService.get();
        setRegionLista(regionData);
      } catch (e) {
        console.error("❌ Error al obtener regiones:", e);
      } finally {
        setCargandoRegiones(false);
      }
    };
    cargarRegiones();
  }, []);

  const refrescarDatosEvento = async () => {
    await refrescar();
    if (eventoActivo?.idEvento) {
      await queryClient.invalidateQueries({ queryKey: ["equipoEvaluador-lectura", eventoActivo.idEvento] });
    }
  };

  const abrirModal = (tipo: ModalTipo, evento: registroEventoDatosAmpleosInterface) => {
    setEventoActivo(evento);
    setModalAbierto(tipo);
  };

  const cerrarModal = () => {
    setModalAbierto(null);
    setEventoActivo(null);
  };

  const abrirInformacionEvento = (evento: registroEventoDatosAmpleosInterface) => {
    abrirModal("ver", evento);
  };

  const filtrarBuscador = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const texto = ev.target.value;
    setSearch(texto);
    if (texto.trim() === "") return;
    setRegion("");
    setMes("");
    setAnio("");
  };

  const seleccionarRegion = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRegion(event.target.value);
  };

  const seleccionarMes = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMes(event.target.value);
  };

  const seleccionarAnio = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAnio(event.target.value);
  };

  return (
    <>
      <div className="w-full pb-25">
        <section id="modales-responsable-mesa-eventos">
          {eventoActivo ? (
            <>
              <ModalVerEvento
                open={modalAbierto === "ver"}
                onClose={cerrarModal}
                evento={eventoActivo}
              />

              <ModalJurados
                open={modalAbierto === "jurados"}
                onClose={cerrarModal}
                evento={eventoActivo}
                onRefresh={refrescarDatosEvento}
              />

              <ModalFiscal
                open={modalAbierto === "fiscal"}
                onClose={cerrarModal}
                evento={eventoActivo}
                onRefresh={refrescarDatosEvento}
              />
            </>
          ) : null}
        </section>

        <section className="mb-4 flex w-full flex-col gap-4">
          <h1 className="mb-4 text-2xl font-bold">Eventos · Responsable de mesa</h1>
          <p className="text-sm text-white/60">
            Solo ves eventos en los que estás en el equipo evaluador. Puedes consultar la información, asignar
            jurados y fiscales, e iniciar o finalizar el evento.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <BuscadorRow filtrarBuscador={filtrarBuscador} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3 sm:max-w-4xl">
            <div className="min-w-0">
              <label
                htmlFor="filtro-region-rm"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Región
              </label>
              <select
                id="filtro-region-rm"
                className={selectBaseClass}
                value={regionSelecionada}
                onChange={seleccionarRegion}
                disabled={cargandoRegiones}
              >
                <option className="bg-slate-800 text-slate-100" value="">
                  Todas las regiones
                </option>
                {regionesLista.map((Region) => (
                  <option className="bg-slate-800 text-slate-100" key={Region.idRegion} value={Region.idRegion}>
                    {Region.nombreRegion}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="filtro-anio-rm"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Año
              </label>
              <select id="filtro-anio-rm" className={selectBaseClass} value={anioSeleccionado} onChange={seleccionarAnio}>
                <option className="bg-slate-800 text-slate-100" value="">
                  Todos los años
                </option>
                {aniosList.map((anio) => (
                  <option className="bg-slate-800 text-slate-100" key={anio} value={anio}>
                    {anio}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-0">
              <label
                htmlFor="filtro-mes-rm"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Mes
              </label>
              <select id="filtro-mes-rm" className={selectBaseClass} value={fechaSeleccionada} onChange={seleccionarMes}>
                <option className="bg-slate-800 text-slate-100" value="">
                  Todos los meses
                </option>
                {LISTA_MESES.map((mes) => (
                  <option className="bg-slate-800 text-slate-100" key={mes.idMes} value={mes.idMes}>
                    {mes.nombreMes}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {isPending ? (
          <SkeletonTabla />
        ) : (
          <div className="flex w-full flex-col gap-4">
            {eventosMostrados.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-white/60">
                No hay eventos que coincidan con los filtros o no tienes asignaciones en el equipo evaluador.
              </p>
            ) : (
              eventosMostrados.map((evento) => (
                <CardRowEventos
                  key={evento.idEvento}
                  evento={evento}
                  abrirInformacion={abrirInformacionEvento}
                  onFusionarEstadoEvento={fusionarEstadoEvento}
                  onJurados={(ev) => abrirModal("jurados", ev)}
                  onFiscal={(ev) => abrirModal("fiscal", ev)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
