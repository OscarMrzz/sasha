import { bandaDatosAmpleosInterface, resultadosTemporadaInterface } from "@/interfaces/interfaces";
import BandasServices from "@/lib/services/bandasServices";
import React from "react";
import Image from "next/image";
import ConfirmDeleteModal from "@/component/modales/ConfirmDeleteModal/ConfirmDeleteModal";

type Props = {
  Banda: bandaDatosAmpleosInterface;
  onClose?: () => void;
  onRefresh?: () => void;
  openFormEditar?: () => void;
  urlLogoBanda: string;
  resultadosTemporada: resultadosTemporadaInterface | null;
};

const InformacionBandaComponent = ({
  Banda,
  onClose,
  onRefresh,
  openFormEditar,
  urlLogoBanda,
  resultadosTemporada,
}: Props) => {
  const [openConfirmDelete, setOpenConfirmDelete] = React.useState(false);

  const eliminarBanda = async () => {
    try {
      const bandasServices = new BandasServices();
      await bandasServices.delete(Banda.idBanda);
      onRefresh?.();
      onClose?.();
    } catch (error: unknown) {
      console.error("❌ Error al eliminar la banda:", error);
      alert("Error al eliminar la banda");
    }
  };

  const onclickEditar = () => {
    openFormEditar?.();
    onClose?.();
  };

  return (
    <div className="h-full w-full min-w-0 max-w-xl overflow-y-auto text-slate-100 scrollbar-estetica">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Información de la banda</h2>

      <header className="mt-4 border-b border-slate-500/45 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {urlLogoBanda ? (
                <Image fill src={urlLogoBanda} alt="Logo Banda" className="object-contain p-2" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-wider text-white/50">
                  Sin logo
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3
                className="text-balance text-xl font-bold leading-tight text-white sm:text-2xl"
                data-testid="informacion-banda-nombre"
              >
                {Banda.nombreBanda || "—"}
              </h3>
              <p className="mt-2 text-sm text-white/70" data-testid="informacion-banda-alias">
                {Banda.AliasBanda || "—"}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <button
              type="button"
              onClick={onclickEditar}
              className="rounded-xl bg-primario px-6 py-3 text-sm font-semibold text-[#0a1628] shadow-lg shadow-primario/25 transition hover:brightness-110"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => setOpenConfirmDelete(true)}
              className="rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/30 hover:bg-white/5"
            >
              Eliminar
            </button>
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Categoría</p>
          <p className="mt-1 text-sm text-white/85" data-testid="informacion-banda-categoria">
            {Banda.categorias?.nombreCategoria ?? "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Región</p>
          <p className="mt-1 text-sm text-white/85" data-testid="informacion-banda-region">
            {Banda.regiones?.nombreRegion ?? "—"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" data-testid="informacion-banda-posicion">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Posición</p>
          <p className="mt-1 text-sm text-white/85">{resultadosTemporada ? resultadosTemporada.rankin : "Pendientes"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" data-testid="informacion-banda-puntos">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Puntos</p>
          <p className="mt-1 text-sm text-white/85">
            {resultadosTemporada
              ? resultadosTemporada.total_despues_sanciones
              : "Pendientes"}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" data-testid="informacion-banda-promedio">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">Promedio</p>
          <p className="mt-1 text-sm text-white/85">{resultadosTemporada ? resultadosTemporada.promedio : "Pendientes"}</p>
        </div>
      </div>

      <ConfirmDeleteModal
        open={openConfirmDelete}
        onClose={() => setOpenConfirmDelete(false)}
        onConfirm={eliminarBanda}
        nombreElemento={Banda.nombreBanda}
        titulo="Confirmar eliminación"
      />
    </div>
  );
};

export default InformacionBandaComponent;
