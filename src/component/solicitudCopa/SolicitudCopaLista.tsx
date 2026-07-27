"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "@heroicons/react/16/solid";
import {
  bandaInterface,
  categoriaDatosAmpleosInterface,
  detalleSolicitudCopaInterface,
  regionesDatosAmpleosInterface,
} from "@/interfaces/interfaces";
import { getDetalleSolicitudesCopas } from "@/lib/services/solicitudCopasServices";
import BandasServices from "@/lib/services/bandasServices";
import CategoriasServices from "@/lib/services/categoriaServices";
import RegionesServices from "@/lib/services/regionesServices";
import BuscadorRow from "@/component/buscadores/BuscadorRow";
import SkeletonTabla from "@/component/skeleton/SkeletonTabla/Page";
import CardRowSolicitudCopa from "@/component/CardRow/CardRowSolicitudCopa";
import OverleyModalFormulario from "@/component/modales/OverleyModalFormulario/Page";
import ErrorMessage from "@/component/Message/ErrorMessage";
import ApprovateMessage from "@/component/Message/ApprovateMessage";
import InformacionSolicitudCopa from "@/component/informacionSolicitudCopa/Page";
import FormularioAgregarSolicitudCopa from "@/component/formularios/formularioAgregarSolicitudCopa/Page";
import ResponderSolicitudCopa from "@/component/responderSolicitudCopa/Page";
import { getEstadoSolicitudKey } from "@/component/solicitudSancion/estadoSolicitudPill";
import { ComboBoxBandas } from "@/component/ComboBox/ComboBoxBandas";
import {
  etiquetaLugarSolicitudCopa,
  etiquetaTipoSolicitudCopa,
} from "@/lib/solicitudCopa/lugarSolicitudCopa";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100";

type Props = {
  titulo: string;
  mostrarAgregar?: boolean;
  permitirResponder?: boolean;
};

export default function SolicitudCopaLista({
  titulo,
  mostrarAgregar = false,
  permitirResponder = false,
}: Props) {
  const queryClient = useQueryClient();
  const bandasServices = useRef(new BandasServices());
  const categoriasServices = useRef(new CategoriasServices());
  const regionesServices = useRef(new RegionesServices());

  const [busqueda, setBusqueda] = useState("");
  const [idBanda, setIdBanda] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [idRegion, setIdRegion] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  const [openAgregar, setOpenAgregar] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openResponder, setOpenResponder] = useState(false);
  const [seleccionada, setSeleccionada] =
    useState<detalleSolicitudCopaInterface | null>(null);

  const [openError, setOpenError] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [openExito, setOpenExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const { data: solicitudes = [], isPending, isError, error } = useQuery({
    queryKey: ["solicitudes_copa_detalle"],
    queryFn: getDetalleSolicitudesCopas,
  });

  const { data: bandas = [] as bandaInterface[] } = useQuery({
    queryKey: ["bandas-filtro-solicitud-copa"],
    queryFn: async () => {
      await bandasServices.current.initPerfil();
      return (await bandasServices.current.get()) as bandaInterface[];
    },
  });

  const { data: categoriasList = [] as categoriaDatosAmpleosInterface[] } =
    useQuery({
      queryKey: ["categorias"],
      queryFn: () => categoriasServices.current.getDatosAmpleos(),
    });

  const { data: regionesList = [] as regionesDatosAmpleosInterface[] } =
    useQuery({
      queryKey: ["regiones"],
      queryFn: () => regionesServices.current.getDatosAmpleos(),
    });

  const mostrarError = (msg: string) => {
    setMensajeError(msg);
    setOpenError(true);
  };

  const mostrarExito = (msg: string) => {
    setMensajeExito(msg);
    setOpenExito(true);
  };

  const refrescar = async () => {
    await queryClient.invalidateQueries({ queryKey: ["solicitudes_copa_detalle"] });
    await queryClient.invalidateQueries({ queryKey: ["dashboard", "solicitudes-copa"] });
    await queryClient.invalidateQueries({
      queryKey: ["dashboard", "responsable-mesa", "solicitudes-copa"],
    });
  };

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return solicitudes.filter((s) => {
      if (idBanda && s.idBanda !== idBanda) return false;
      if (idCategoria && s.idCategoria !== idCategoria) return false;
      if (idRegion && s.idRegion !== idRegion) return false;
      if (filtroEstado && getEstadoSolicitudKey(s.estado) !== filtroEstado) {
        return false;
      }
      if (!q) return true;
      return (
        (s.nombreBanda ?? "").toLowerCase().includes(q) ||
        (s.nombreCategoria ?? "").toLowerCase().includes(q) ||
        (s.nombreRegion ?? "").toLowerCase().includes(q) ||
        (s.LugarEvento ?? "").toLowerCase().includes(q) ||
        (s.justificacion_solicitud_copa ?? "").toLowerCase().includes(q) ||
        etiquetaLugarSolicitudCopa(s.lugar_solicitud_copas)
          .toLowerCase()
          .includes(q) ||
        etiquetaTipoSolicitudCopa(s.tipo_solicitud_copa)
          .toLowerCase()
          .includes(q)
      );
    });
  }, [solicitudes, busqueda, idBanda, idCategoria, idRegion, filtroEstado]);

  const abrirVer = (s: detalleSolicitudCopaInterface) => {
    setSeleccionada(s);
    setOpenVer(true);
  };

  const abrirResponder = (s: detalleSolicitudCopaInterface) => {
    setSeleccionada(s);
    setOpenResponder(true);
  };

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

  return (
    <div>
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

      <OverleyModalFormulario open={openVer} onClose={() => setOpenVer(false)}>
        {seleccionada ? (
          <InformacionSolicitudCopa
            solicitud={seleccionada}
            onClose={() => setOpenVer(false)}
          />
        ) : null}
      </OverleyModalFormulario>

      <OverleyModalFormulario open={openAgregar} onClose={() => setOpenAgregar(false)}>
        <FormularioAgregarSolicitudCopa
          onClose={() => setOpenAgregar(false)}
          onError={mostrarError}
          onSuccess={async () => {
            mostrarExito("Solicitud de copa creada correctamente.");
            await refrescar();
          }}
        />
      </OverleyModalFormulario>

      <OverleyModalFormulario
        open={openResponder}
        onClose={() => setOpenResponder(false)}
      >
        {seleccionada ? (
          <ResponderSolicitudCopa
            solicitud={seleccionada}
            onClose={() => setOpenResponder(false)}
            onError={mostrarError}
            onSuccess={async (msg) => {
              mostrarExito(msg);
              await refrescar();
            }}
          />
        ) : null}
      </OverleyModalFormulario>

      <section className="mb-4 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <BuscadorRow filtrarBuscador={(e) => setBusqueda(e.target.value)} />
          {mostrarAgregar ? (
            <button
              type="button"
              onClick={() => setOpenAgregar(true)}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 hover:bg-slate-300"
            >
              <PlusIcon className="h-5 w-5" />
              Agregar
            </button>
          ) : null}
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ComboBoxBandas
          bandas={bandas}
          value={idBanda}
          onChange={setIdBanda}
          placeholder="Todas las bandas"
        />
        <select
          value={idCategoria}
          onChange={(e) => setIdCategoria(e.target.value)}
          className={selectClass}
        >
          <option value="">Todas las categorías</option>
          {categoriasList.map((c) => (
            <option key={c.idCategoria} value={c.idCategoria}>
              {c.nombreCategoria}
            </option>
          ))}
        </select>
        <select
          value={idRegion}
          onChange={(e) => setIdRegion(e.target.value)}
          className={selectClass}
        >
          <option value="">Todas las regiones</option>
          {regionesList.map((r) => (
            <option key={r.idRegion} value={r.idRegion}>
              {r.nombreRegion}
            </option>
          ))}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className={selectClass}
        >
          <option value="">Todos los estados</option>
          <option value="null">Pendiente</option>
          <option value="true">Aprobada</option>
          <option value="false">Denegada</option>
        </select>
      </section>

      {isPending ? (
        <SkeletonTabla />
      ) : filtradas.length === 0 ? (
        <p className="rounded-xl border border-slate-600/40 bg-slate-800/40 px-4 py-8 text-center text-slate-400">
          No hay solicitudes con los filtros seleccionados.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtradas.map((s) => (
            <CardRowSolicitudCopa
              key={s.id_solicitud_copa ?? `${s.idBanda}-${s.idEvento}`}
              solicitud={s}
              onView={() => abrirVer(s)}
              onResponder={
                permitirResponder && s.estado === null
                  ? () => abrirResponder(s)
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
