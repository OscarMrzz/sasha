"use client";

import { bandaInterface } from "@/models";
import React from "react";

type Props = {
  bandas: bandaInterface[];
};

export default function ListaBandasColumna({ bandas }: Props) {
  if (bandas.length === 0) {
    return (
      <p className="px-2 py-6 text-center text-sm text-[var(--app-fg-muted)]">
        Sin bandas confirmadas
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2 p-2">
      {bandas.map((b) => (
        <li
          key={b.idBanda}
          className="flex items-center gap-2 rounded-lg border border-[var(--vz-border)] bg-white p-2.5 shadow-sm transition-colors hover:bg-[#fafafa]"
        >
          {b.urlLogoBanda ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.urlLogoBanda}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand)]/15 text-xs font-bold text-[var(--brand)]" />
          )}
          <div className="min-w-0 flex-1 overflow-hidden">
            <p
              className="text-sm font-medium leading-snug text-[var(--app-fg)] [overflow-wrap:anywhere]"
              title={b.nombreBanda}
            >
              {b.nombreBanda}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
