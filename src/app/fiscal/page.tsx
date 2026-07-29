import Link from "next/link";
import { CalendarDaysIcon, ChartBarSquareIcon } from "@heroicons/react/24/solid";

export default function FiscalPageBienvenida() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-4 py-12">
      <div className="panel-outline w-full max-w-lg p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#00b4d8]">Panel del fiscal</p>
        <h1 className="mt-3 text-3xl font-bold">Bienvenido</h1>
        <p className="mt-4 text-[var(--app-fg-muted)]">
          Elige si quieres fiscalizar resultados en un evento del día o consultar todos tus eventos asignados.
        </p>
        <nav className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/fiscal/fiscalizar"
            className="btn-surface inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold"
          >
            <ChartBarSquareIcon className="h-5 w-5" aria-hidden />
            Ir a fiscalizar
          </Link>
          <Link
            href="/fiscal/mis-eventos-asignados"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#00b4d8]/40 bg-[#00b4d8]/10 px-6 py-3 text-sm font-bold text-[#00b4d8] transition hover:bg-[#00b4d8]/20"
          >
            <CalendarDaysIcon className="h-5 w-5" aria-hidden />
            Mis eventos asignados
          </Link>
        </nav>
      </div>
    </div>
  );
}
