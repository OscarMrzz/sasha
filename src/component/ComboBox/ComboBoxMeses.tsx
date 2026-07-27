"use client";

import {
  etiquetaMesSolo,
  MESES_CALENDARIO_NUMERO,
} from "@/component/diciplina/checkoutUtils";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useMemo, useState } from "react";

export type ComboBoxMesesProps = {
  /** Número de mes 01–12, o vacío para “todos”. */
  value?: string;
  onChange: (mes: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export function ComboBoxMeses({
  value,
  onChange,
  placeholder = "Todos los meses",
  disabled = false,
  className,
  id,
}: ComboBoxMesesProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MESES_CALENDARIO_NUMERO;
    return MESES_CALENDARIO_NUMERO.filter((m) =>
      etiquetaMesSolo(m).toLowerCase().includes(q),
    );
  }, [query]);

  const etiquetaSeleccion = value ? etiquetaMesSolo(value) : null;

  const handlePick = (mes: string) => {
    onChange(mes);
    setOpen(false);
    setQuery("");
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  const triggerClasses = cn(
    "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-left text-sm text-slate-100 transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)] disabled:cursor-not-allowed disabled:opacity-50",
    !etiquetaSeleccion && "text-slate-400",
    className,
  );

  const itemBase =
    "flex w-full cursor-pointer rounded-md px-2 py-2 text-left text-sm text-slate-100 hover:bg-slate-600 hover:text-slate-50 focus:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primario)]/45";

  const itemSelected =
    "border border-[var(--color-primario)]/35 bg-[var(--color-primario)]/25 text-slate-50";

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger
        id={id}
        type="button"
        disabled={disabled}
        className={triggerClasses}
      >
        <span className="min-w-0 flex-1 truncate">
          {etiquetaSeleccion ?? placeholder}
        </span>
        <ChevronDownIcon className="h-5 w-5 shrink-0 text-slate-300" />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          sideOffset={4}
          align="start"
          className={cn(
            "z-50 max-h-72 min-w-[var(--radix-popper-anchor-width)] overflow-hidden rounded-lg border border-slate-600 bg-slate-800 p-1 text-slate-100 shadow-xl shadow-black/35 outline-none ring-1 ring-slate-500/25 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=closed]:animate-out",
          )}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="border-b border-slate-600 bg-slate-900/40 p-1 pb-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar mes…"
              className="h-9 w-full rounded-md border border-slate-500 bg-slate-700 px-2 text-sm text-slate-100 outline-none placeholder:text-slate-400 focus:border-[var(--color-primario)] focus:ring-1 focus:ring-[var(--color-primario)]/35"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setOpen(false);
                  e.preventDefault();
                }
              }}
            />
          </div>

          <div className="max-h-48 overflow-y-auto bg-slate-800/80 p-0.5">
            <button
              type="button"
              role="menuitem"
              className={cn(itemBase, "text-slate-300")}
              onClick={() => handlePick("")}
            >
              {placeholder}
            </button>

            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-center text-sm text-slate-400">
                No se encontró el mes
              </p>
            ) : (
              filtered.map((mes) => (
                <button
                  key={mes}
                  type="button"
                  role="menuitem"
                  className={cn(itemBase, mes === value && itemSelected)}
                  onClick={() => handlePick(mes)}
                >
                  <span className="min-w-0 truncate font-medium">
                    {etiquetaMesSolo(mes)}
                  </span>
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
