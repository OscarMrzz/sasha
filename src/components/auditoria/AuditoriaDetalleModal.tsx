"use client";

import OverleyModal from "@/components/modales/OverleyModal/Page";
import type { AuditoriaDetalleEnriquecido } from "@/models";
import { formatearHoraLocal } from "@/services/auditoriaServices";

type Props = {
  open: boolean;
  onClose: () => void;
  detalle: AuditoriaDetalleEnriquecido | null;
};

export default function AuditoriaDetalleModal({ open, onClose, detalle }: Props) {
  if (!detalle) {
    return <OverleyModal open={open} onClose={onClose} />;
  }

  const { row, nombreUsuario, campos } = detalle;

  return (
    <OverleyModal open={open} onClose={onClose}>
      <div className="min-w-[280px] max-w-lg space-y-5 text-white">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Detalle de auditoría
          </p>
          <h2 className="mt-1 text-lg font-semibold">{row.accion}</h2>
          <p className="font-mono text-xs text-slate-400">{row.tabla}</p>
        </div>

        <dl className="grid grid-cols-1 gap-3 rounded-xl bg-slate-800/80 p-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-400">Fecha</dt>
            <dd className="mt-0.5 text-slate-100">{formatearHoraLocal(row.fecha)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Usuario</dt>
            <dd className="mt-0.5 text-slate-100">{nombreUsuario}</dd>
          </div>
        </dl>

        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-200">Metadata</h3>
          {campos.length === 0 ? (
            <p className="text-sm text-slate-400">Sin metadata</p>
          ) : (
            <ul className="scrollbar-estetica max-h-64 space-y-2 overflow-y-auto pr-1">
              {campos.map((c, idx) => (
                <li
                  key={`${c.label}-${idx}`}
                  className="rounded-xl border border-slate-600/40 bg-slate-900/50 px-3 py-2.5 text-sm"
                >
                  <span className="block text-xs text-slate-400">{c.label}</span>
                  <span className="mt-0.5 block break-words text-slate-100">{c.valor}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </OverleyModal>
  );
}
