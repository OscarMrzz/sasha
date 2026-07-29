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
      className="flex h-11 w-full cursor-text items-center gap-2 rounded-lg border buscador-row px-3"
    >
      <MagnifyingGlassIcon className="buscador-row-icon h-5 w-5 shrink-0" aria-hidden />
      <input
        id="buscador"
        type="search"
        enterKeyHint="search"
        placeholder={placeholder}
        className="buscador-row-input min-w-0 flex-1 border-0 bg-transparent py-2 text-sm focus:outline-none focus:ring-0"
        onChange={filtrarBuscador}
      />
    </label>
  </search>
  )
}
