"use client";

import CardRowSolicitudCopa from "@/component/CardRow/CardRowSolicitudCopa";
import FormularioCopa from "@/component/copas/FormularioCopa";
import InformacionSolicitudCopa from "@/component/informacionSolicitudCopa/Page";
import ApprovateMessage from "@/component/Message/ApprovateMessage";
import ErrorMessage from "@/component/Message/ErrorMessage";
import OverleyModalFormulario from "@/component/modales/OverleyModalFormulario/Page";
import SkeletonTabla from "@/component/skeleton/SkeletonTabla/Page";
import type {
  categoriaInterface,
  detalleSolicitudCopaInterface,
  registroEventoDatosAmpleosInterface,
} from "@/interfaces/interfaces";
import { obtenerIdPerfilActivo } from "@/lib/eventos/cargarEventosAsignadosAlPerfil";
import { getDetalleSolicitudesCopas } from "@/lib/services/solicitudCopasServices";
import CategoriasServices from "@/lib/services/categoriaServices";
import { PlusIcon } from "@heroicons/react/16/solid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useMemo, useRef, useState } from "react";

const selectBaseClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100 transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]";

export const FISCAL_SOLICITUDES_COPA_QUERY_KEY = [
  "fiscal",
  "solicitudes-copa",
] as const;

type Props = {
  eventosFuente: registroEventoDatosAmpleosInterface[];
  cargandoEventos?: boolean;
  titulo?: string;
};

export default function GestorSolicitudesCopaFiscal({
  eventosFuente,
  cargandoEventos = false,
  titulo = "Solicitar copa",
}: Props) {
  const queryClient = useQueryClient();
  const categoriasServices = useRef(new CategoriasServices());

  const [idEvento, setIdEvento] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [categoriasList, setCategoriasList] = useState<categoriaInterface[]>([]);
  const [cargandoFiltros, setCargandoFiltros] = useState(false);

  const [formularioAgregarAbierto, setFormularioAgregarAbierto] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [seleccionada, setSeleccionada] =
    useState<detalleSolicitudCopaInterface | null>(null);

  const [openError, setOpenError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [openExito, setOpenExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const eventosValidos = useMemo(() => [...eventosFuente], [eventosFuente]);

  const idsEventosValidos = useMemo(
    () => new Set(eventosValidos.map((e) => e.idEvento)),
    [eventosValidos],
  );

  const { data: idPerfil } = useQuery({
    queryKey: ["fiscal", "perfil-activo-id"],
    queryFn: obtenerIdPerfilActivo,
    staleTime: 60_000,
  });

  const {
    data: solicitudes = [],
    isPending: cargandoSolicitudes,
    isError,
    error,
  } = useQuery({
    queryKey: FISCAL_SOLICITUDES_COPA_QUERY_KEY,
    queryFn: getDetalleSolicitudesCopas,
    enabled: Boolean(idPerfil),
  });

  useEffect(() => {
    let cancelado = false;
    async function cargarFiltros() {
      setCargandoFiltros(true);
      try {
        await categoriasServices.current.initPerfil();
        const categorias = await categoriasServices.current.get();
        if (!cancelado) setCategoriasList(categorias);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      } finally {
        if (!cancelado) setCargandoFiltros(false);
      }
    }
    void cargarFiltros();
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (isError) {
      const msg =
        error instanceof Error
          ? error.message
          : "Error al cargar solicitudes de copa.";
      setMensajeError(msg);
      setOpenError(true);
    }
  }, [isError, error]);

  const solicitudesFiltradas = useMemo(() => {
    if (!idPerfil) return [];
    return solicitudes.filter((s) => {
      if (s.id_foranea_solicitante !== idPerfil) return false;
      if (!s.idEvento || !idsEventosValidos.has(s.idEvento)) return false;
      if (idEvento && s.idEvento !== idEvento) return false;
      if (categoriaSeleccionada && s.idCategoria !== categoriaSeleccionada) {
        return false;
      }
      return true;
    });
  }, [
    solicitudes,
    idPerfil,
    idsEventosValidos,
    idEvento,
    categoriaSeleccionada,
  ]);

  const mostrarExito = (msg: string) => {
    setMensajeExito(msg);
    setOpenExito(true);
  };

  const refrescar = async () => {
    await queryClient.invalidateQueries({
      queryKey: FISCAL_SOLICITUDES_COPA_QUERY_KEY,
    });
    await queryClient.invalidateQueries({
      queryKey: ["solicitudes_copa_detalle"],
    });
    await queryClient.invalidateQueries({
      queryKey: ["dashboard", "responsable-mesa", "solicitudes-copa"],
    });
  };

  const seleccionarEvento = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    setIdEvento(ev.target.value);
    setCategoriaSeleccionada("");
  };

  const abrirVer = (s: detalleSolicitudCopaInterface) => {
    setSeleccionada(s);
    setOpenVer(true);
  };

  const onGuardadoFormulario = async (idEventoGuardado?: string) => {
    if (idEventoGuardado) setIdEvento(idEventoGuardado);
    await refrescar();
    mostrarExito("Solicitud de copa enviada correctamente.");
  };

  if (cargandoEventos) {
    return <p className="text-center text-slate-300">Cargando eventos…</p>;
  }

  if (!eventosValidos.length) {
    return (
      <div className="w-full pb-25">
        <h1 className="mb-4 text-2xl font-bold">{titulo}</h1>
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          No hay eventos activos hoy que puedas gestionar. Solo aparecen eventos del
          día en curso (iniciados) en los que participas como fiscal.
        </p>
      </div>
    );
  }

  return (
    <>
      <ErrorMessage
        titulo="Error"
        open={openError}
        onClose={() => setOpenError(false)}
        texto={mensajeError}
      />
      <ApprovateMessage
        titulo="Éxito"
        open={openExito}
        onClose={() => setOpenExito(false)}
        texto={mensajeExito}
      />

      <div className="w-full pb-25">
        <section className="mb-4 flex w-full flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <h1 className="text-2xl font-bold">{titulo}</h1>
            <div className="flex items-center">
              <button
                type="button"
                className="flex cursor-pointer gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-300"
                onClick={() => setFormularioAgregarAbierto(true)}
              >
                <PlusIcon className="h-5 w-5 rounded-2xl" />
                Agregar
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:max-w-2xl">
            <div className="min-w-0">
              <label
                htmlFor="filtro-evento-solicitud-copa"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Filtrar por evento
              </label>
              <select
                id="filtro-evento-solicitud-copa"
                className={selectBaseClass}
                value={idEvento}
                onChange={seleccionarEvento}
              >
                <option className="bg-slate-800 text-slate-100" value="">
                  Todos los eventos de hoy
                </option>
                {eventosValidos.map((e) => (
                  <option
                    className="bg-slate-800 text-slate-100"
                    key={e.idEvento}
                    value={e.idEvento}
                  >
                    {e.LugarEvento}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-w-0">
              <label
                htmlFor="filtro-categoria-solicitud-copa"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-white/70"
              >
                Categoría
              </label>
              <select
                id="filtro-categoria-solicitud-copa"
                className={selectBaseClass}
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                disabled={cargandoFiltros}
              >
                <option className="bg-slate-800 text-slate-100" value="">
                  Todas las categorías
                </option>
                {categoriasList.map((categoria) => (
                  <option
                    className="bg-slate-800 text-slate-100"
                    key={categoria.idCategoria}
                    value={categoria.idCategoria}
                  >
                    {categoria.nombreCategoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <OverleyModalFormulario
          open={formularioAgregarAbierto}
          onClose={() => setFormularioAgregarAbierto(false)}
        >
          {formularioAgregarAbierto && (
            <FormularioCopa
              modo="solicitar"
              idEvento={idEvento}
              eventosDisponibles={eventosValidos}
              idCategoriaInicial={categoriaSeleccionada}
              onClose={() => setFormularioAgregarAbierto(false)}
              onGuardado={(idEventoGuardado) =>
                void onGuardadoFormulario(idEventoGuardado)
              }
            />
          )}
        </OverleyModalFormulario>

        <OverleyModalFormulario open={openVer} onClose={() => setOpenVer(false)}>
          {seleccionada ? (
            <InformacionSolicitudCopa
              solicitud={seleccionada}
              onClose={() => setOpenVer(false)}
            />
          ) : null}
        </OverleyModalFormulario>

        {cargandoSolicitudes ? (
          <SkeletonTabla />
        ) : solicitudesFiltradas.length === 0 ? (
          <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
            {idEvento || categoriaSeleccionada
              ? "No hay solicitudes con los filtros seleccionados."
              : "Aún no has enviado solicitudes de copa para los eventos de hoy."}
          </p>
        ) : (
          <div className="flex w-full flex-col gap-4">
            {solicitudesFiltradas.map((solicitud) => (
              <CardRowSolicitudCopa
                key={solicitud.id_solicitud_copa ?? `${solicitud.idBanda}-${solicitud.idEvento}`}
                solicitud={solicitud}
                onView={() => abrirVer(solicitud)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
