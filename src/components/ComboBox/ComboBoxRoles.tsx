"use client";

import type { rolInterface } from "@/models";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useMemo, useState } from "react";

export type ComboBoxRolesProps = {
  roles: rolInterface[];
  value?: string;
  onChange: (idRol: string) => void;
  placeholder?: string;
  disabled?: boolean;
  emptyLabel?: string;
  className?: string;
  popoverClassName?: string;
  id?: string;
};

export function ComboBoxRoles({
  roles,
  value,
  onChange,
  placeholder = "Seleccionar rol",
  disabled = false,
  emptyLabel = "No hay roles disponibles",
  className,
  popoverClassName,
  id,
}: ComboBoxRolesProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [portalHost, setPortalHost] = useState<HTMLDivElement | null>(null);
  const portalContainer =
    portalHost?.closest("dialog") ?? portalHost ?? undefined;

  const selected = roles.find((r) => r.idRol === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => r.nombreRol.toLowerCase().includes(q));
  }, [roles, query]);

  const handlePick = (idRol: string) => {
    onChange(idRol);
    setOpen(false);
    setQuery("");
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery("");
  };

  const triggerClasses = cn(
    "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-[var(--vz-border-strong)] bg-white px-3 text-left text-sm text-[var(--app-fg)] transition-[border-color,box-shadow] focus:border-[var(--color-primario)] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,180,216,0.18)] disabled:cursor-not-allowed disabled:opacity-50",
    !selected?.nombreRol && "text-slate-400",
    className
  );

  const itemBase =
    "flex w-full cursor-pointer rounded-md px-2 py-2 text-left text-sm text-[var(--app-fg)] hover:bg-[#f5f5f5] hover:text-[var(--app-fg)] focus:bg-[#f5f5f5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primario)]/45";

  const itemSelected =
    "border border-[var(--color-primario)]/35 bg-[var(--color-primario)]/15 text-[var(--app-fg)]";

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
            {selected?.nombreRol ?? placeholder}
          </span>
          <ChevronDownIcon className="h-5 w-5 shrink-0 text-[var(--app-fg-muted)]" />
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal container={portalContainer}>
          <PopoverPrimitive.Content
            sideOffset={4}
            align="start"
            className={cn(
              "z-[250] max-h-72 min-w-[var(--radix-popper-anchor-width)] overflow-hidden rounded-lg border border-[var(--vz-border-strong)] bg-white p-1 text-[var(--app-fg)] shadow-xl shadow-black/10 outline-none ring-1 ring-black/5 duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=closed]:animate-out",
              popoverClassName
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <div className="border-b border-[var(--vz-border)] bg-[#fafafa] p-1 pb-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por rol…"
                className="h-9 w-full rounded-md border border-[var(--vz-border-strong)] bg-white px-2 text-sm text-[var(--app-fg)] outline-none placeholder:text-[var(--app-fg-muted)] focus:border-[var(--color-primario)] focus:ring-1 focus:ring-[var(--color-primario)]/35"
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

            <div className="max-h-48 overflow-y-auto bg-white p-0.5">
              <button
                type="button"
                role="menuitem"
                className={cn(itemBase, "text-[var(--app-fg-muted)]")}
                onClick={() => handlePick("")}
              >
                {placeholder}
              </button>

              {filtered.length === 0 ? (
                <p className="px-2 py-3 text-center text-sm text-slate-400">
                  {emptyLabel}
                </p>
              ) : (
                filtered.map((rol) => (
                  <button
                    key={rol.idRol}
                    type="button"
                    role="menuitem"
                    className={cn(
                      itemBase,
                      rol.idRol === value && itemSelected
                    )}
                    onClick={() => handlePick(rol.idRol)}
                  >
                    <span className="min-w-0 truncate font-medium">
                      {rol.nombreRol}
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
