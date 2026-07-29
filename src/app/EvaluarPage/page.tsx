import Link from "next/link";
import { CalendarDaysIcon, HomeIcon } from "@heroicons/react/24/solid";

export default function EvaluarPageBienvenida() {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-4 py-12">
      <div className="panel-outline w-full max-w-lg p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#00b4d8]">Panel del jurado</p>
        <h1 className="mt-3 text-3xl font-bold">Bienvenido</h1>
        <p className="mt-4 text-[var(--app-fg-muted)]">
          Elige si quieres evaluar bandas en un evento del día o consultar todos tus eventos asignados.
        </p>
        <nav className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/EvaluarPage/evaluar"
            className="btn-surface inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-bold"
          >
            <HomeIcon className="h-5 w-5" aria-hidden />
            Ir a evaluar
          </Link>
          <Link
            href="/EvaluarPage/mis-eventos-asignados"
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
