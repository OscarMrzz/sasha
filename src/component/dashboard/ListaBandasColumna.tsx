"use client";

import { bandaInterface } from "@/interfaces/interfaces";
import React from "react";

type Props = {
  bandas: bandaInterface[];
};

export default function ListaBandasColumna({ bandas }: Props) {
  if (bandas.length === 0) {
    return (
      <p className="px-2 py-6 text-center text-sm text-slate-400">Sin bandas confirmadas</p>
    );
  }
  return (
    <ul className="flex flex-col gap-2 p-2">
      {bandas.map((b) => (
        <li
          key={b.idBanda}
          className="flex items-center gap-2 rounded-lg bg-slate-700/90 p-2.5 shadow-sm transition-colors hover:bg-slate-600"
        >
          {b.urlLogoBanda ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.urlLogoBanda}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-600 text-xs font-bold text-slate-300" />
          )}
          <div className="min-w-0 flex-1 overflow-hidden">
            <p
              className="text-sm font-medium leading-snug text-white [overflow-wrap:anywhere]"
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
