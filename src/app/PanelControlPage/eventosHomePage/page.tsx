"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";
import React from "react";
import OverleyModalFormulario from "@/components/modales/OverleyModalFormulario/Page";
import { PlusIcon } from "@heroicons/react/16/solid";
import { regionesInterface, registroEventoDatosAmpleosInterface } from "@/models";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/store";
import {
  activarOverleyFormularioAgregarEventos,
  activarOverleyFormularioEditarEventos,
  desactivarOverleyFormularioAgregarEventos,
  desactivarOverleyFormularioEditarEventos,
} from "@/features/Eventos/overleysEventosSlice";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import RegistroEventossServices from "@/services/registroEventosServices";
import RegistroEquipoEvaluadorServices from "@/services/registroEquipoEvaluadorServices";
import ConfirmDeleteModal from "@/components/modales/ConfirmDeleteModal/ConfirmDeleteModal";

import FormularioEditarEventoComponet from "@/components/formularios/FormularioEventos/Editar";
import FormularioAgregarEventoComponet from "@/components/formularios/FormularioEventos/Agregar";
import RegionService from "@/services/regionesServices";
import ModalVerEvento from "@/components/informacion/ifnromacionEventoComponent/ModalVerEvento";
import ModalJurados from "@/components/informacion/ifnromacionEventoComponent/ModalJurados";
import ModalFiscal from "@/components/informacion/ifnromacionEventoComponent/ModalFiscal";
import ModalDisciplina from "@/components/informacion/ifnromacionEventoComponent/ModalDisciplina";
import ModalMesa from "@/components/informacion/ifnromacionEventoComponent/ModalMesa";

import { setEventoSelecionado } from "@/features/Eventos/eventosSlice";
import BuscadorRow from "@/components/buscadores/BuscadorRow";
import CardRowEventos from "@/components/CardRow/CardRowEventos";
import { revalidarBandasDeEvento } from "@/actions/revalidarResultadosEvento";
import useAtajoPagina from "@/hooks/useAtajoPagina";

const selectBaseClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100 transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]";

type ModalTipo = "ver" | "jurados" | "fiscal" | "disciplina" | "mesa" | null;

export default function EventosHomePage() {
  const dispatch = useDispatch();

  const activadorOverleyFormularioAgregarEventos = useSelector(
    (state: RootState) => state.overleyEventos.activadorOverleyFormularioAgregarEventos
  );

  const activadorOverleyFormularioEditarEventos = useSelector(
    (state: RootState) => state.overleyEventos.activadorOverleyFormularioEditarEventos
  );

  const EventoSeleccionado = useSelector((state: RootState) => state.eventos.EventoSeleccionado);

  const [aniosList, setAniosList] = useState<string[]>([]);
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>(new Date().getFullYear().toString());

  const [eventos, setEventos] = useState<registroEventoDatosAmpleosInterface[]>([]);
  const [EventosOriginales, setEventosOriginales] = useState<registroEventoDatosAmpleosInterface[]>([]);
  const [cargandoFiltros, setCargadoFiltros] = useState(false);
  const [regionesLista, setRegionLista] = useState<regionesInterface[]>([]);
  const [regionSelecionada, setRegionSeleccionada] = useState<string>("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const [openConfirmEliminarEvento, setOpenConfirmEliminarEvento] = useState(false);

  const [eventoActivo, setEventoActivo] = useState<registroEventoDatosAmpleosInterface | null>(null);
  const [modalAbierto, setModalAbierto] = useState<ModalTipo>(null);

  const eventosServices = useRef(new RegistroEventossServices());
  const queryClient = useQueryClient();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["eventos"],
    queryFn: async () => {
      const svc = eventosServices.current;
      await svc.initPerfil();
      return await svc.getDatosAmpleos();
    },
  });

  const omitirSyncDesdeQueryEventosRef = useRef(false);

  useEffect(() => {
    if (data !== undefined) {
      if (omitirSyncDesdeQueryEventosRef.current) {
        omitirSyncDesdeQueryEventosRef.current = false;
        return;
      }
      setEventos(data);
      setEventosOriginales(data);
      setCargadoFiltros(true);
    }
  }, [data]);

  const fusionarEstadoEventoLista = useCallback(
    async (idEvento: string, estado_evento: "iniciado" | "finalizado") => {
      omitirSyncDesdeQueryEventosRef.current = true;
      queryClient.setQueryData<registroEventoDatosAmpleosInterface[]>(["eventos"], (prev) =>
        (prev ?? []).map((e) => (e.idEvento === idEvento ? { ...e, estado_evento } : e)),
      );
      setEventosOriginales((prev) =>
        prev.map((e) => (e.idEvento === idEvento ? { ...e, estado_evento } : e)),
      );
      setEventos((prev) => prev.map((e) => (e.idEvento === idEvento ? { ...e, estado_evento } : e)));
      setEventoActivo((prev) =>
        prev?.idEvento === idEvento ? { ...prev, estado_evento } : prev,
      );

      if (estado_evento === "finalizado") {
        try {
          await revalidarBandasDeEvento(idEvento);
        } catch (e) {
          console.error(
            "Error al revalidar páginas mi-banda tras finalizar evento:",
            e,
          );
        }
      }
    },
    [queryClient],
  );

  useEffect(() => {
    if (isError) {
      console.error("❌ Error al obtener los eventos:", error);
      setCargadoFiltros(true);
    }
  }, [isError, error]);

  const refrescarEventos = async () => {
    await queryClient.invalidateQueries({ queryKey: ["eventos"] });
  };

  const refrescarDatosEvento = async () => {
    await refrescarEventos();
    if (eventoActivo?.idEvento) {
      await queryClient.invalidateQueries({ queryKey: ["equipoEvaluador-lectura", eventoActivo.idEvento] });
    }
  };

  const abrirFormularioAgregar = () => {
    dispatch(activarOverleyFormularioAgregarEventos());
  };

  useAtajoPagina("agregar", abrirFormularioAgregar);

  const [ListaMeses, setListaMeses] = useState<{ idMes: string; nombreMes: string }[]>([]);

  useEffect(() => {
    const anios = eventos.map((evento) => evento.fechaEvento.split("-")[0]);
    const aniosUnicos = Array.from(new Set(anios));
    setAniosList(aniosUnicos);
  }, [eventos]);

  useEffect(() => {
    const ListaMeses = [
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
    setListaMeses(ListaMeses);
  }, []);

  const cargarFiltros = async () => {
    const regionService = new RegionService();
    try {
      const regionData = await regionService.get();
      setRegionLista(regionData);
    } catch (error) {
      console.error("❌ Error al obtener las Categorias:", error);
    }
  };

  useEffect(() => {
    cargarFiltros();
  }, []);

  const seleccionarRegion = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = event.target.value;
    setRegionSeleccionada(regionId);
    filtrarEventosPorRegionyFecha(regionId, fechaSeleccionada, anioSeleccionado);
  };
  const seleccionarMes = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const mesId = event.target.value;
    setFechaSeleccionada(mesId);
    filtrarEventosPorRegionyFecha(regionSelecionada, mesId, anioSeleccionado);
  };

  const filtrarEventosPorRegionyFecha = (regionId: string, mesId: string, anio: string) => {
    let eventosFiltrados = EventosOriginales;
    if (regionId) {
      eventosFiltrados = eventosFiltrados.filter((evento) => evento.idForaneaRegion === regionId);
    }
    if (mesId) {
      eventosFiltrados = eventosFiltrados.filter((evento) => {
        const mesEvento = evento.fechaEvento.split("-")[1];
        return mesEvento === mesId.padStart(2, "0");
      });
    }
    if (anio) {
      eventosFiltrados = eventosFiltrados.filter((evento) => {
        const anioEvento = evento.fechaEvento.split("-")[0];
        return anioEvento === String(anio);
      });
    }
    setEventos(eventosFiltrados);
  };

  const cerrarFormularioAgregarEvento = () => {
    dispatch(desactivarOverleyFormularioAgregarEventos());
  };
  const cerrarFormularioEditarEvento = () => {
    dispatch(desactivarOverleyFormularioEditarEventos());
  };

  const abrirModal = (tipo: ModalTipo, evento: registroEventoDatosAmpleosInterface) => {
    setEventoActivo(evento);
    setModalAbierto(tipo);
  };

  const cerrarModal = () => {
    setModalAbierto(null);
    setEventoActivo(null);
  };

  const onDoubleClickEvento = (evento: registroEventoDatosAmpleosInterface) => {
    abrirModal("ver", evento);
  };

  const seleccionarAnio = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const anio = event.target.value;
    setAnioSeleccionado(anio);
    filtrarEventosPorRegionyFecha(regionSelecionada, fechaSeleccionada, anio);
  };

  const filtrarBuscador = (evento: React.ChangeEvent<HTMLInputElement>) => {
    setRegionSeleccionada("");
    setFechaSeleccionada("");
    setAnioSeleccionado("");
    const texto = evento.target.value.toLowerCase();
    if (!texto) {
      setEventos(EventosOriginales || []);
      return;
    }
    if (EventosOriginales && EventosOriginales.length) {
      const eventosFiltrados = EventosOriginales.filter((evento) =>
        evento.LugarEvento.toLowerCase().includes(texto)
      );
      setEventos(eventosFiltrados);
    }
  };

  return (
    <>
      <div className="w-full pb-25">
        <section id="modales-ocultos">
          <ConfirmDeleteModal
            open={openConfirmEliminarEvento}
            onClose={() => setOpenConfirmEliminarEvento(false)}
            onConfirm={async () => {
              if (!EventoSeleccionado?.idEvento) return;
              const registroEquipoEvaluadorServices = new RegistroEquipoEvaluadorServices();
              const registroEventossServices = new RegistroEventossServices();
              await registroEquipoEvaluadorServices.deletePorEvento(EventoSeleccionado.idEvento);
              await registroEventossServices.delete(EventoSeleccionado.idEvento);
              await refrescarEventos();
            }}
            nombreElemento={EventoSeleccionado?.LugarEvento ?? "este evento"}
            titulo="Confirmar eliminación"
          />

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

              <ModalDisciplina
                open={modalAbierto === "disciplina"}
                onClose={cerrarModal}
                evento={eventoActivo}
                onRefresh={refrescarDatosEvento}
              />

              <ModalMesa
                open={modalAbierto === "mesa"}
                onClose={cerrarModal}
                evento={eventoActivo}
                onRefresh={refrescarDatosEvento}
              />
            </>
          ) : null}

          <OverleyModalFormulario open={activadorOverleyFormularioAgregarEventos} onClose={cerrarFormularioAgregarEvento}>
            <FormularioAgregarEventoComponet onClose={cerrarFormularioAgregarEvento} onCreated={refrescarEventos} />
          </OverleyModalFormulario>

          <OverleyModalFormulario open={activadorOverleyFormularioEditarEventos} onClose={cerrarFormularioEditarEvento}>
            {EventoSeleccionado && (
              <FormularioEditarEventoComponet EventoAEditar={EventoSeleccionado!} onClose={cerrarFormularioEditarEvento} />
            )}
          </OverleyModalFormulario>
        </section>

        <section className="flex w-full flex-col gap-4 mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Eventos</h1>
            <span className="text-sm text-slate-400">{eventos.length}</span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <BuscadorRow filtrarBuscador={filtrarBuscador} />
            <div className="flex items-center">
              <button
                className="bg-slate-100 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-300 cursor-pointer flex gap-2"
                onClick={abrirFormularioAgregar}
              >
                <PlusIcon className="w-5 h-5 rounded-2xl" />
                Agregar
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 sm:max-w-4xl">
            <div className="min-w-0">
              <label htmlFor="filtro-region" className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70">
                Región
              </label>
              <select
                id="filtro-region"
                className={selectBaseClass}
                value={regionSelecionada}
                onChange={seleccionarRegion}
                disabled={!cargandoFiltros}
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
              <label htmlFor="filtro-anio" className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70">
                Año
              </label>
              <select id="filtro-anio" className={selectBaseClass} value={anioSeleccionado} onChange={seleccionarAnio}>
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
              <label htmlFor="filtro-mes" className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70">
                Mes
              </label>
              <select id="filtro-mes" className={selectBaseClass} value={fechaSeleccionada} onChange={seleccionarMes}>
                <option className="bg-slate-800 text-slate-100" value="">
                  Todos los meses
                </option>
                {ListaMeses.map((mes) => (
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
          <>
            <div className="flex flex-col gap-4 w-full">
              {eventos.map((evento, index) => {
                return (
                  <CardRowEventos
                    key={evento.idEvento}
                    index={index + 1}
                    evento={evento}
                    abrirInformacion={onDoubleClickEvento}
                    onFusionarEstadoEvento={fusionarEstadoEventoLista}
                    onJurados={(ev) => abrirModal("jurados", ev)}
                    onFiscal={(ev) => abrirModal("fiscal", ev)}
                    onDisciplina={(ev) => abrirModal("disciplina", ev)}
                    onMesa={(ev) => abrirModal("mesa", ev)}
                    abrirEditar={() => {
                      dispatch(setEventoSelecionado(evento));
                      dispatch(activarOverleyFormularioEditarEventos());
                    }}
                    abrirEliminar={() => {
                      dispatch(setEventoSelecionado(evento));
                      setOpenConfirmEliminarEvento(true);
                    }}
                  />
                );
              })}{" "}
            </div>{" "}
          </>
        )}
      </div>
    </>
  );
}
