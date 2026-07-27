"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import SkeletonTabla from "@/component/skeleton/SkeletonTabla/Page";
import OverleyModalFormulario from "@/component/modales/OverleyModalFormulario/Page";
import { PlusIcon } from "@heroicons/react/16/solid";
import type { regionesInterface, registroEventoDatosAmpleosInterface } from "@/interfaces/interfaces";

import { RootState } from "@/app/store";
import {
  activarOverleyFormularioAgregarEventos,
  activarOverleyFormularioEditarEventos,
  activarOverleyInformacionEventos,
  desactivarOverleyFormularioAgregarEventos,
  desactivarOverleyFormularioEditarEventos,
  desactivarOverleyInformacionEventos,
} from "@/feacture/Eventos/overleysEventosSlice";
import { setEventoSelecionado } from "@/feacture/Eventos/eventosSlice";
import InformacionEventoComponent from "@/component/informacion/ifnromacionEventoComponent/InformacionEventoComponet";
import ConfirmDeleteModal from "@/component/modales/ConfirmDeleteModal/ConfirmDeleteModal";
import FormularioEditarEventoComponet from "@/component/formularios/FormularioEventos/Editar";
import FormularioAgregarEventoComponet from "@/component/formularios/FormularioEventos/Agregar";
import RegionService from "@/lib/services/regionesServices";
import useAtajoPagina from "@/hooks/useAtajoPagina";
import RegistroEquipoEvaluadorServices from "@/lib/services/registroEquipoEvaluadorServices";
import RegistroEventossServices from "@/lib/services/registroEventosServices";
import OverleyModal from "@/component/modales/OverleyModal/Page";

import BuscadorRow from "@/component/buscadores/BuscadorRow";
import CardRowEventos from "@/component/CardRow/CardRowEventos";
import {
  EVENTOS_RESPONSABLE_EVENTOS_QUERY_KEY,
  useEventosResponsableEventos,
} from "@/hooks/responsableEventos/useEventosResponsableEventos";
import { useEventosResponsableEventosFiltrosStore } from "@/Store/responsableEventos/useEventosResponsableEventosFiltrosStore";

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

type EventosCrudProps = {
  titulo?: string;
  queryKey?: readonly unknown[];
};

export default function EventosCrud({
  titulo = "Eventos",
  queryKey = EVENTOS_RESPONSABLE_EVENTOS_QUERY_KEY,
}: EventosCrudProps) {
  const dispatch = useDispatch();

  const activadorOverleyFormularioAgregarEventos = useSelector(
    (state: RootState) => state.overleyEventos.activadorOverleyFormularioAgregarEventos,
  );
  const activadorInformacionEventos = useSelector(
    (state: RootState) => state.overleyEventos.activadorOverleyInformacionEventos,
  );
  const activadorOverleyFormularioEditarEventos = useSelector(
    (state: RootState) => state.overleyEventos.activadorOverleyFormularioEditarEventos,
  );
  const EventoSeleccionado = useSelector((state: RootState) => state.eventos.EventoSeleccionado);

  const [regionesLista, setRegionLista] = useState<regionesInterface[]>([]);
  const [cargandoRegiones, setCargandoRegiones] = useState(false);
  const [openConfirmEliminarEvento, setOpenConfirmEliminarEvento] = useState(false);

  const regionSelecionada = useEventosResponsableEventosFiltrosStore((s) => s.regionSelecionada);
  const anioSeleccionado = useEventosResponsableEventosFiltrosStore((s) => s.anioSeleccionado);
  const fechaSeleccionada = useEventosResponsableEventosFiltrosStore((s) => s.fechaSeleccionada);
  const searchText = useEventosResponsableEventosFiltrosStore((s) => s.searchText);
  const setRegion = useEventosResponsableEventosFiltrosStore((s) => s.setRegion);
  const setAnio = useEventosResponsableEventosFiltrosStore((s) => s.setAnio);
  const setMes = useEventosResponsableEventosFiltrosStore((s) => s.setMes);
  const setSearch = useEventosResponsableEventosFiltrosStore((s) => s.setSearch);

  const { eventos: eventosCargados, isPending, isError, error, refrescar } =
    useEventosResponsableEventos(queryKey);

  const aniosList = useMemo(() => {
    const anios = eventosCargados.map((e) => e.fechaEvento.split("-")[0]);
    return Array.from(new Set(anios));
  }, [eventosCargados]);

  const eventosMostrados = useMemo(() => {
    let list = eventosCargados;

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
  }, [eventosCargados, regionSelecionada, fechaSeleccionada, anioSeleccionado, searchText]);

  useEffect(() => {
    if (isError) console.error("❌ Error al obtener los eventos:", error);
  }, [isError, error]);

  useEffect(() => {
    const cargarRegiones = async () => {
      setCargandoRegiones(true);
      try {
        const regionService = new RegionService();
        const regionData = await regionService.get();
        setRegionLista(regionData);
      } catch (e) {
        console.error("❌ Error al obtener las regiones:", e);
      } finally {
        setCargandoRegiones(false);
      }
    };
    cargarRegiones();
  }, []);

  const abrirFormularioAgregar = () => {
    dispatch(activarOverleyFormularioAgregarEventos());
  };

  useAtajoPagina("agregar", abrirFormularioAgregar);

  const cerrarFormularioAgregarEvento = () => dispatch(desactivarOverleyFormularioAgregarEventos());
  const cerrarInformacionEvento = () => dispatch(desactivarOverleyInformacionEventos());
  const cerrarFormularioEditarEvento = () => {
    dispatch(desactivarOverleyFormularioEditarEventos());
    void refrescar();
  };
  const activarFormularioEditarEvento = () => dispatch(activarOverleyFormularioEditarEventos());

  const abrirInformacionEvento = (evento: registroEventoDatosAmpleosInterface) => {
    dispatch(setEventoSelecionado(evento));
    dispatch(activarOverleyInformacionEventos());
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
        <section id="modales-eventos-crud">
          <ConfirmDeleteModal
            open={openConfirmEliminarEvento}
            onClose={() => setOpenConfirmEliminarEvento(false)}
            onConfirm={async () => {
              if (!EventoSeleccionado?.idEvento) return;
              const registroEquipoEvaluadorServices = new RegistroEquipoEvaluadorServices();
              const registroEventossServices = new RegistroEventossServices();
              await registroEquipoEvaluadorServices.deletePorEvento(EventoSeleccionado.idEvento);
              await registroEventossServices.delete(EventoSeleccionado.idEvento);
              await refrescar();
            }}
            nombreElemento={EventoSeleccionado?.LugarEvento ?? "este evento"}
            titulo="Confirmar eliminación"
          />

          <OverleyModal open={activadorInformacionEventos} onClose={cerrarInformacionEvento}>
            {EventoSeleccionado ? (
              <InformacionEventoComponent
                Evento={EventoSeleccionado}
                onClose={cerrarInformacionEvento}
                onRefresh={refrescar}
                openFormEditar={activarFormularioEditarEvento}
                mostrarCambioEstadoEvento={false}
                mostrarEquipoEvaluador={false}
              />
            ) : null}
          </OverleyModal>

          <OverleyModalFormulario
            open={activadorOverleyFormularioAgregarEventos}
            onClose={cerrarFormularioAgregarEvento}
          >
            <FormularioAgregarEventoComponet onClose={cerrarFormularioAgregarEvento} onCreated={refrescar} />
          </OverleyModalFormulario>

          <OverleyModalFormulario
            open={activadorOverleyFormularioEditarEventos}
            onClose={cerrarFormularioEditarEvento}
          >
            {EventoSeleccionado ? (
              <FormularioEditarEventoComponet
                EventoAEditar={EventoSeleccionado}
                onClose={cerrarFormularioEditarEvento}
              />
            ) : null}
          </OverleyModalFormulario>
        </section>

        <section className="mb-4 flex w-full flex-col gap-4">
          <h1 className="mb-4 text-2xl font-bold">{titulo}</h1>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <BuscadorRow filtrarBuscador={filtrarBuscador} />
            <div className="flex items-center">
              <button
                type="button"
                className="flex cursor-pointer gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-300"
                onClick={abrirFormularioAgregar}
              >
                <PlusIcon className="h-5 w-5 rounded-2xl" />
                Agregar
              </button>
            </div>
          </div>

          <div className="grid max-w-4xl gap-3 sm:grid-cols-3">
            <div className="min-w-0">
              <label
                htmlFor="filtro-region-eventos-crud"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Región
              </label>
              <select
                id="filtro-region-eventos-crud"
                className={selectBaseClass}
                value={regionSelecionada}
                onChange={seleccionarRegion}
                disabled={cargandoRegiones || eventosCargados.length === 0}
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
                htmlFor="filtro-anio-eventos-crud"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Año
              </label>
              <select
                id="filtro-anio-eventos-crud"
                className={selectBaseClass}
                value={anioSeleccionado}
                onChange={seleccionarAnio}
              >
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
                htmlFor="filtro-mes-eventos-crud"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Mes
              </label>
              <select
                id="filtro-mes-eventos-crud"
                className={selectBaseClass}
                value={fechaSeleccionada}
                onChange={seleccionarMes}
              >
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
            {eventosMostrados.map((evento) => (
              <CardRowEventos
                key={evento.idEvento}
                evento={evento}
                abrirInformacion={abrirInformacionEvento}
                ocultarControles
                abrirEditar={() => {
                  dispatch(setEventoSelecionado(evento));
                  dispatch(activarOverleyFormularioEditarEventos());
                }}
                abrirEliminar={() => {
                  dispatch(setEventoSelecionado(evento));
                  setOpenConfirmEliminarEvento(true);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
