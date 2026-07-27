"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getHistorialCheckout } from "@/lib/services/chekoutServices";
import CategoriasServices from "@/lib/services/categoriaServices";
import { useEventosDisciplinaHoy } from "@/hooks/diciplina/useEventosDisciplinaHoy";
import { useCheckoutRealtime } from "@/hooks/checkout";
import BuscadorRow from "@/component/buscadores/BuscadorRow";
import SkeletonTabla from "@/component/skeleton/SkeletonTabla/Page";
import CardRowHistorialCheckout from "@/component/CardRow/CardRowHistorialCheckout";
import OverleyModal from "@/component/modales/OverleyModal/Page";
import ModalVerCheckout from "@/component/diciplina/ModalVerCheckout";
import { CheckoutDetalleInterface } from "@/interfaces/interfaces";

const selectClass =
  "h-11 w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-sm text-slate-100";

export default function HistorialChekoutPage() {
  const queryClient = useQueryClient();
  const { hoy, eventoActivo, cargando, sinEventos } = useEventosDisciplinaHoy();
  const [busqueda, setBusqueda] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [openVer, setOpenVer] = useState(false);
  const [seleccionado, setSeleccionado] = useState<CheckoutDetalleInterface | null>(null);

  const idEvento = eventoActivo?.idEvento ?? "";

  useCheckoutRealtime({
    queryClient,
    idEvento: idEvento || undefined,
  });

  const { data: registros = [], isPending: cargandoRegistros } = useQuery({
    queryKey: ["checkout-historial", idEvento],
    queryFn: () => getHistorialCheckout(idEvento),
    enabled: Boolean(idEvento),
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias-historial-checkout"],
    queryFn: async () => {
      const svc = new CategoriasServices();
      return svc.getDatosAmpleos();
    },
  });

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return registros.filter((r) => {
      if (idCategoria && r.id_foranea_categoria !== idCategoria) return false;
      if (!q) return true;
      return (r.nombreBanda ?? "").toLowerCase().includes(q);
    });
  }, [registros, busqueda, idCategoria]);

  if (cargando) return <SkeletonTabla />;

  if (sinEventos) {
    return (
      <div className="py-12 text-center text-slate-400">
        <h1 className="mb-2 text-2xl font-bold text-white">Historial checkout</h1>
        <p>No hay eventos hoy ({hoy}) en los que formes parte del equipo evaluador.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Historial checkout</h1>
        <p className="text-sm text-slate-400">
          Bandas con llegada e ingreso confirmados · {eventoActivo?.LugarEvento}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-2">
        <BuscadorRow filtrarBuscador={(e) => setBusqueda(e.target.value)} />
          <label className="mb-1 block text-xs uppercase text-slate-400">Categoría</label>
          <select
            className={selectClass}
            value={idCategoria}
            onChange={(e) => setIdCategoria(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.idCategoria} value={c.idCategoria}>
                {c.nombreCategoria}
              </option>
            ))}
          </select>
        </div>
 
      </div>

      {cargandoRegistros ? (
        <SkeletonTabla />
      ) : filtrados.length === 0 ? (
        <p className="py-8 text-center text-slate-400">Sin registros completos en el historial.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map((r) => (
            <CardRowHistorialCheckout
              key={r.id_checkout}
              registro={r}
              onView={() => {
                setSeleccionado(r);
                setOpenVer(true);
              }}
            />
          ))}
        </div>
      )}

      <OverleyModal open={openVer} onClose={() => setOpenVer(false)}>
        {seleccionado ? <ModalVerCheckout registro={seleccionado} /> : null}
      </OverleyModal>
    </div>
  );
}
