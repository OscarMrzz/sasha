import Link from "next/link";
import { CalendarDaysIcon, ChartBarSquareIcon } from "@heroicons/react/24/solid";

export default function FiscalPageBienvenida() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-600/40 bg-slate-900/50 p-8 text-center shadow-xl shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">Panel del fiscal</p>
        <h1 className="mt-3 text-3xl font-bold text-white">Bienvenido</h1>
        <p className="mt-4 text-slate-300">
          Elige si quieres fiscalizar resultados en un evento del día o consultar todos tus eventos asignados.
        </p>
        <nav className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/fiscal/fiscalizar"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
          >
            <ChartBarSquareIcon className="h-5 w-5" aria-hidden />
            Ir a fiscalizar
          </Link>
          <Link
            href="/fiscal/mis-eventos-asignados"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-300/40 bg-sky-400/15 px-6 py-3 text-sm font-bold text-sky-100 transition hover:bg-sky-400/25"
          >
            <CalendarDaysIcon className="h-5 w-5" aria-hidden />
            Mis eventos asignados
          </Link>
        </nav>
      </div>
    </div>
  );
}
