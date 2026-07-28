"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import BuscadorRow from "@/components/buscadores/BuscadorRow";
import { ComboBoxCategorias } from "@/components/ComboBox/ComboBoxCategorias";
import { ComboBoxEventos } from "@/components/ComboBox/ComboBoxEventos";
import { ComboBoxMeses } from "@/components/ComboBox/ComboBoxMeses";
import { ComboBoxRegiones } from "@/components/ComboBox/ComboBoxRegiones";
import CardRowCheckoutConsulta from "@/components/CardRow/CardRowCheckoutConsulta";
import ModalVerCheckout from "@/components/diciplina/ModalVerCheckout";
import { obtenerMesAnioCheckout } from "@/components/diciplina/checkoutUtils";
import OverleyModal from "@/components/modales/OverleyModal/Page";
import SkeletonTabla from "@/components/skeleton/SkeletonTabla/Page";
import {
  CheckoutDetalleInterface,
  categoriaDatosAmpleosInterface,
  RegistroEventoInterface,
  regionesDatosAmpleosInterface,
} from "@/models";
import { formatearFechaEvento } from "@/helpers/fechas/formatearFechaEvento";
import { getAllCheckoutByEvento } from "@/services/chekoutServices";
import CategoriasServices from "@/services/categoriaServices";
import RegistroEventossServices from "@/services/registroEventosServices";
import RegionesServices from "@/services/regionesServices";

type Props = {
  titulo?: string;
};

const labelClassName =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400";

export default function ListaCheckoutFiltrable({
  titulo = "Consulta checkout",
}: Props) {
  const eventosServices = useRef(new RegistroEventossServices());
  const categoriasServices = useRef(new CategoriasServices());
  const regionesServices = useRef(new RegionesServices());

  const [eventoSeleccionado, setEventoSeleccionado] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [idRegion, setIdRegion] = useState("");
  const [mesFiltro, setMesFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [openVer, setOpenVer] = useState(false);
  const [seleccionado, setSeleccionado] = useState<CheckoutDetalleInterface | null>(
    null,
  );

  const { data: eventos = [], isPending: cargandoEventos } = useQuery({
    queryKey: ["checkout-consulta", "eventos"],
    queryFn: async () => {
      await eventosServices.current.initPerfil();
      return eventosServices.current.getDatosAmpleos();
    },
  });

  const { data: categoriasList = [] as categoriaDatosAmpleosInterface[] } =
    useQuery({
      queryKey: ["checkout-consulta", "categorias"],
      queryFn: () => categoriasServices.current.getDatosAmpleos(),
    });

  const { data: regionesList = [] as regionesDatosAmpleosInterface[] } = useQuery(
    {
      queryKey: ["checkout-consulta", "regiones"],
      queryFn: () => regionesServices.current.getDatosAmpleos(),
    },
  );

  const {
    data: checkouts = [],
    isFetching: cargandoCheckouts,
  } = useQuery({
    queryKey: ["checkout-consulta", "filas", eventoSeleccionado],
    queryFn: () => getAllCheckoutByEvento(eventoSeleccionado),
    enabled: Boolean(eventoSeleccionado.trim()),
  });

  const eventosOrdenados = useMemo((): RegistroEventoInterface[] => {
    return [...eventos].sort(
      (a, b) =>
        new Date(b.fechaEvento).getTime() - new Date(a.fechaEvento).getTime(),
    );
  }, [eventos]);

  const eventoActual = eventosOrdenados.find(
    (e) => e.idEvento === eventoSeleccionado,
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return checkouts.filter((r) => {
      if (idCategoria && r.id_foranea_categoria !== idCategoria) return false;
      if (idRegion && r.id_foranea_region !== idRegion) return false;
      if (mesFiltro) {
        const clave = obtenerMesAnioCheckout(
          r.created_at_checkout,
          eventoActual?.fechaEvento,
        );
        const mesRegistro = clave?.split("-")[1] ?? "";
        if (mesRegistro !== mesFiltro) return false;
      }
      if (q && !(r.nombreBanda ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [
    checkouts,
    idCategoria,
    idRegion,
    mesFiltro,
    busqueda,
    eventoActual?.fechaEvento,
  ]);

  const filtrosListos = Boolean(eventoSeleccionado.trim());

  const handleEvento = (id: string) => {
    setEventoSeleccionado(id);
    setIdCategoria("");
    setIdRegion("");
    setMesFiltro("");
    setBusqueda("");
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-8">
      <section className="mb-2 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-100">{titulo}</h1>
          <span
            className="inline-flex min-w-[2rem] items-center justify-center rounded-full bg-slate-700 px-2.5 py-0.5 text-sm font-semibold text-slate-200"
            aria-label="Total de registros"
          >
            {filtrosListos ? filtrados.length : "—"}
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
            </>
          ) : (
            <>
              Selecciona un <span className="text-slate-200">evento</span> para
              consultar los registros de checkout de las bandas.
            </>
          )}
          {cargandoCheckouts ? (
            <span className="ml-2 text-slate-500">Cargando…</span>
          ) : null}
        </p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="min-w-0 md:col-span-2 lg:col-span-1">
            <label htmlFor="combo-evento-checkout" className={labelClassName}>
              Evento
            </label>
            <ComboBoxEventos
              id="combo-evento-checkout"
              eventos={eventosOrdenados}
              value={eventoSeleccionado}
              onChange={handleEvento}
              disabled={cargandoEventos}
              placeholder="Seleccionar evento"
              emptyLabel="No hay eventos"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="combo-categoria-checkout" className={labelClassName}>
              Categoría
            </label>
            <ComboBoxCategorias
              id="combo-categoria-checkout"
              categorias={categoriasList}
              value={idCategoria}
              onChange={setIdCategoria}
              disabled={!filtrosListos}
              placeholder="Todas las categorías"
              emptyLabel="No hay categorías"
            />
          </div>
          <div className="min-w-0">
            <label htmlFor="combo-region-checkout" className={labelClassName}>
              Región
            </label>
            <ComboBoxRegiones
              id="combo-region-checkout"
              regiones={regionesList}
              value={idRegion}
              onChange={setIdRegion}
              disabled={!filtrosListos}
              placeholder="Todas las regiones"
              emptyLabel="No hay regiones"
            />
          </div>

        </div>

        <BuscadorRow filtrarBuscador={(e) => setBusqueda(e.target.value)} />
      </section>

      {!filtrosListos ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          Elige un evento para consultar los checkouts registrados.
        </p>
      ) : cargandoCheckouts ? (
        <SkeletonTabla />
      ) : filtrados.length === 0 ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          No hay registros de checkout para este evento con los filtros
          seleccionados.
        </p>
      ) : (
        <section className="flex flex-col gap-3">
          {filtrados.map((r) => (
            <CardRowCheckoutConsulta
              key={r.id_checkout ?? `${r.id_foranea_banda}-${r.id_foranea_evento}`}
              registro={r}
              onView={() => {
                setSeleccionado(r);
                setOpenVer(true);
              }}
            />
          ))}
        </section>
      )}

      <OverleyModal open={openVer} onClose={() => setOpenVer(false)}>
        {seleccionado ? <ModalVerCheckout registro={seleccionado} /> : null}
      </OverleyModal>
    </div>
  );
}
