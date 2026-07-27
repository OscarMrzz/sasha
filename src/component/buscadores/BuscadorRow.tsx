import React from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';

type Props = {
    filtrarBuscador: (event: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

export default function BuscadorRow({ filtrarBuscador, placeholder = "Buscar..." }: Props) {
  return (
    <search className="min-w-0 w-full sm:max-w-md">
    <label
      htmlFor="buscador"
      className="flex h-11 w-full cursor-text items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/50 px-3 transition-[border-color,box-shadow] focus-within:border-[var(--color-primario)] focus-within:shadow-[0_0_0_3px_rgba(0,180,216,0.18)]"
    >
      <MagnifyingGlassIcon className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
      <input
        id="buscador"
        type="search"
        enterKeyHint="search"
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        onChange={filtrarBuscador}
      />
    </label>
  </search>
  )
}
