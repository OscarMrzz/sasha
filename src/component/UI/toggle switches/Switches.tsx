import { rolInterface } from "@/interfaces/interfaces";
import React from "react";

type Props = {
  rol: rolInterface;
  cambioEstado: () => void;
};

export default function Switches({ rol, cambioEstado }: Props) {
  const activo = rol.estadoRol === true;

  return (
    <label className="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-600/50 bg-slate-900/40 p-5 shadow-md transition hover:border-slate-500/70 hover:bg-slate-900/60">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={activo}
        onChange={cambioEstado}
      />
      <div className="min-w-0 flex-1 space-y-1">
        <span className="block truncate text-base font-semibold tracking-tight text-white">
          {rol.nombreRol}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            activo
              ? "bg-[var(--color-primario)]/20 text-[var(--color-primario)]"
              : "bg-slate-700/80 text-slate-300"
          }`}
        >
          {activo ? "Activo" : "Inactivo"}
        </span>
      </div>
      <div
        className="relative h-9 w-[3.25rem] shrink-0 rounded-full bg-slate-600 transition-colors duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-primario)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-950 peer-checked:bg-[var(--color-primario)]"
        aria-hidden
      >
        <span
          className={`absolute top-1 left-1 h-7 w-7 rounded-full bg-white shadow-md transition-transform duration-300 ease-out ${
            activo ? "translate-x-[1.35rem]" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
}
