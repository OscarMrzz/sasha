"use client";

import type { CopaFilaDisplay } from "@/components/copas/CardRowCopa";

type Props = {
  copa: CopaFilaDisplay;
  onClose: () => void;
  onEditar: () => void;
};

function etiquetaLugar(lugar: number) {
  if (lugar === 1) return "1º lugar";
  if (lugar === 2) return "2º lugar";
  if (lugar === 3) return "3º lugar";
  return `${lugar}º lugar`;
}

export default function InformacionCopaComponent({
  copa,
  onClose,
  onEditar,
}: Props) {
  return (
    <div className="flex flex-col gap-6 text-white">
      <h2 className="text-2xl font-bold">Detalle de copa</h2>
      <dl className="flex flex-col gap-3 text-slate-200">
        <div>
          <dt className="text-xs uppercase text-slate-400">Lugar</dt>
          <dd className="text-lg font-semibold">
            {etiquetaLugar(Number(copa.lugar))}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-400">Banda</dt>
          <dd>{copa.nombreBanda}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-400">Categoría</dt>
          <dd>{copa.nombreCategoria}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-slate-400">Tipo</dt>
          <dd>{copa.tipo === "desempate" ? "Desempate" : "Directo"}</dd>
        </div>
      </dl>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-500 px-6 py-2.5 font-semibold text-slate-200"
        >
          Cerrar
        </button>
        <button
          type="button"
          onClick={onEditar}
          className="rounded-lg bg-sky-600 px-6 py-2.5 font-semibold text-white hover:bg-sky-500"
        >
          Editar
        </button>
      </div>
    </div>
  );
}
