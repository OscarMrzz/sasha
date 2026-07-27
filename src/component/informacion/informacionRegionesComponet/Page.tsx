import { regionesDatosAmpleosInterface } from "@/interfaces/interfaces";
import React from "react";

type Props = {
  region: regionesDatosAmpleosInterface;
  onClose?: () => void;
  onRefresh?: () => void;
  openFormEditar?: () => void;
  onEliminar?: (region: regionesDatosAmpleosInterface) => void;
};

const InformacionRegionesComponent = ({ region, onClose, openFormEditar, onEliminar }: Props) => {
  const onclickEditar = () => {
    openFormEditar?.();
    onClose?.();
  };

  return (
    <div className="h-full w-full min-w-0 max-w-xl overflow-y-auto text-slate-100 scrollbar-estetica">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Información de la región</h2>

      <header className="mt-4 border-b border-slate-500/45 pb-6">
        <div className="min-w-0">
          <h3
            className="text-balance text-xl font-bold leading-tight text-white sm:text-2xl"
            data-testid="informacion-region-nombre"
          >
            {region.nombreRegion || "—"}
          </h3>

        </div>
      </header>


    </div>
  );
};

export default InformacionRegionesComponent;
