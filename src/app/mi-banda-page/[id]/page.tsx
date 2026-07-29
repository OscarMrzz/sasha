import MiBandaNavMovil from "@/components/miBanda/MiBandaNavMovil";
import {
  redirectPorErrorServidorMiBanda,
  redirectSiFaltanCredencialesServidorMiBanda,
} from "@/helpers/mi-banda/servidorMiBandaHealth";
import { getAllBandasIds, getResultadosByIdBanda } from "@/services/servidor/resultadosServices";
import React from "react";

/** Permite entrar al servidor y redirigir a aviso si falla Supabase (p. ej. sin env en build). */
export const dynamicParams = true;
/** Evita servir HTML/cache de build cuando cambian resultados en Supabase. */
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const bandas = await getAllBandasIds();
  return bandas.map((b) => ({ id: b.idBanda }));
}

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function esPodio(rank: unknown): boolean {
  const n = Number(rank);
  return n === 1 || n === 2 || n === 3;
}

function formatoNumero(valor: unknown, decimals?: number): string | null {
  if (valor == null || Number.isNaN(Number(valor))) return null;
  const n = Number(valor);
  return decimals != null ? n.toFixed(decimals) : String(n);
}

export default async function page({ params }: Props) {
  const { id } = await params;

  redirectSiFaltanCredencialesServidorMiBanda();

  let resultadosMiBanda: Awaited<ReturnType<typeof getResultadosByIdBanda>>;
  try {
    resultadosMiBanda = await getResultadosByIdBanda(id);
  } catch (err) {
    redirectPorErrorServidorMiBanda(err);
  }

  if (!resultadosMiBanda) {
    return (
      <div className="flex min-h-[70vh] w-full justify-center px-2 py-10 sm:px-4">
        <div className="flex w-full max-w-lg flex-col items-center gap-8">
          <header className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
              Mi banda
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--app-fg)]">
              Sin resultados aún
            </h1>
            <p className="mt-3 text-sm text-[var(--app-fg-muted)]">
              Aún no hay resultados de temporada para esta banda.
            </p>
          </header>
          <MiBandaNavMovil id={id} />
        </div>
      </div>
    );
  }

  const isPodium = esPodio(resultadosMiBanda.rankin);
  const posicion = formatoNumero(resultadosMiBanda.rankin) ?? "?";
  const promedio = formatoNumero(resultadosMiBanda.promedio, 2);
  const total = formatoNumero(resultadosMiBanda.total_despues_sanciones);

  const ringClass = isPodium
    ? "border-amber-400 text-amber-700"
    : "border-[var(--brand)] text-[var(--brand)]";
  const ringBg = isPodium ? "bg-amber-50" : "bg-[#e8f8fb]";
  const badgeClass = isPodium
    ? "bg-amber-50 text-amber-800 border-amber-200"
    : "bg-[#e8f8fb] text-[var(--brand)] border-[var(--brand)]/30";

  return (
    <div className="flex min-h-[70vh] w-full justify-center px-2 py-8 sm:px-4 sm:py-12">
      <div className="flex w-full max-w-lg flex-col items-center gap-8">
        <header className="animate-slide-in-top w-full text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand)]">
            Temporada actual
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--app-fg)] sm:text-4xl">
            {resultadosMiBanda.nombreBanda}
          </h1>
          {resultadosMiBanda.nombreCategoria ? (
            <p className="mt-2 text-sm text-[var(--app-fg-muted)]">
              Categoría {resultadosMiBanda.nombreCategoria}
            </p>
          ) : null}
          {isPodium ? (
            <span
              className={`mt-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}
            >
              En el podio
            </span>
          ) : null}
        </header>

        <div className="animate-zoom-in">
          <div
            className={`flex size-52 flex-col items-center justify-center rounded-full border-[5px] ${ringClass} ${ringBg} text-center shadow-sm sm:size-56`}
          >
            <span className="tabular-nums text-7xl font-black leading-none sm:text-8xl">
              {posicion}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">
              Posición
            </span>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
          <div className="card-row-bg flex min-h-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl px-4 py-4 text-center shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-fg-muted)]">
              Promedio
            </span>
            <span className="text-2xl font-bold tabular-nums text-[var(--app-fg)]">
              {promedio ?? "—"}
            </span>
          </div>
          <div className="card-row-bg flex min-h-[5.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl px-4 py-4 text-center shadow-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--app-fg-muted)]">
              Total
            </span>
            <span className="text-2xl font-bold tabular-nums text-[var(--app-fg)]">
              {total ?? "—"}
            </span>
          </div>
        </div>

        <div className="animate-fade-in-up w-full">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--app-fg-muted)] lg:hidden">
            Accesos
          </p>
          <MiBandaNavMovil id={id} isPodium={isPodium} />
        </div>
      </div>
    </div>
  );
}
