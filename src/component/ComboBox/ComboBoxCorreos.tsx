"use client";

import type { CorreoUsuario } from "@/lib/services/passwordServices";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useMemo, useState } from "react";

export type ComboBoxCorreosProps = {
  correos: CorreoUsuario[];
  value?: string;
  onChange: (userId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  emptyLabel?: string;
  className?: string;
  popoverClassName?: string;
  id?: string;
};

export function ComboBoxCorreos({
  correos,
  value,
  onChange,
  placeholder = "Seleccionar correo",
  disabled = false,
  emptyLabel = "No hay correos disponibles",
  className,
  popoverClassName,
  id,
}: ComboBoxCorreosProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null);
  const portalContainer =
    portalHost?.closest("dialog") ?? portalHost ?? undefined;

  const selected = correos.find((c) => c.id === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return correos;
    return correos.filter((c) => c.email.toLowerCase().includes(q));
  }, [correos, query]);

  const handlePick = (userId: string) => {
    onChange(userId);
    setOpen(false);
    setQuery("");
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  const triggerClasses = cn(
    "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-slate-600 bg-slate-700/50 px-3 text-left text-sm text-slate-100 transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)] disabled:cursor-not-allowed disabled:opacity-50",
    !selected?.email && "text-slate-400",
    className
  );

  const itemBase =
    "flex w-full cursor-pointer rounded-md px-2 py-2 text-left text-sm text-slate-100 hover:bg-slate-600 hover:text-slate-50 focus:bg-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primario)]/45";

  const itemSelected =
    "border border-[var(--color-primario)]/35 bg-[var(--color-primario)]/25 text-slate-50";

  return (
    <div ref={setPortalHost} className="relative w-full">
      <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange} modal={false}>
        <PopoverPrimitive.Trigger
          id={id}
          type="button"
          disabled={disabled}
          className={triggerClasses}
        >
          <span className="min-w-0 flex-1 truncate">
            {selected?.email ?? placeholder}
          </span>
          <ChevronDownIcon className="h-5 w-5 shrink-0 text-slate-300" />
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal container={portalContainer}>
          <PopoverPrimitive.Content
            sideOffset={4}
            align="start"
            className={cn(
              "z-[250] max-h-72 min-w-[var(--radix-popper-anchor-width)] overflow-hidden rounded-lg border border-slate-600 bg-slate-800 p-1 text-slate-100 shadow-xl shadow-black/35 outline-none ring-1 ring-slate-500/25 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=closed]:animate-out",
              popoverClassName
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="border-b border-slate-600 bg-slate-900/40 p-1 pb-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por correo…"
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

            <div className="max-h-48 overflow-y-auto bg-slate-800 p-0.5">
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
                  {emptyLabel}
                </p>
              ) : (
                filtered.map((correo) => (
                  <button
                    key={correo.id}
                    type="button"
                    role="menuitem"
                    className={cn(
                      itemBase,
                      correo.id === value && itemSelected
                    )}
                    onClick={() => handlePick(correo.id)}
                  >
                    <span className="min-w-0 truncate font-medium">
                      {correo.email}
                    </span>
                  </button>
                ))
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}
