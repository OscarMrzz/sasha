import Link from "next/link";
import React, { Suspense } from "react";

import { MiBandaServidorErrorConsole } from "./MiBandaServidorErrorConsole";

export default function ServicioMiBandaNoDisponiblePage() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <Suspense fallback={null}>
        <MiBandaServidorErrorConsole />
      </Suspense>
      <div className="max-w-md space-y-4">
        <h1 className="text-xl font-semibold text-sky-200 md:text-2xl">
          Estamos experimentando problemas con el servidor
        </h1>
        <p className="text-sm leading-relaxed text-slate-400">
          Por favor comuníquese con el administrador o con el desarrollador. Intente de nuevo
          más tarde.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
