import MiBandaNavMovil from '@/components/miBanda/MiBandaNavMovil'
import {
  redirectPorErrorServidorMiBanda,
  redirectSiFaltanCredencialesServidorMiBanda,
} from '@/helpers/mi-banda/servidorMiBandaHealth'
import { getAllBandasIds, getResultadosByIdBanda } from '@/services/servidor/resultadosServices'
import React from 'react'

/** Permite entrar al servidor y redirigir a aviso si falla Supabase (p. ej. sin env en build). */
export const dynamicParams = true
/** Evita servir HTML/cache de build cuando cambian resultados en Supabase. */
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const bandas = await getAllBandasIds()
  return bandas.map((b) => ({ id: b.idBanda }))
}

type Props = {
  params: Promise<{
    id: string
  }>
}

export default async function page({ params }: Props) {
    const {id} = await params;

    function esPodio(rank: unknown): boolean {
  const n = Number(rank);
  return n === 1 || n === 2 || n === 3;
}

  redirectSiFaltanCredencialesServidorMiBanda()

  let resultadosMiBanda: Awaited<ReturnType<typeof getResultadosByIdBanda>>
  try {
    resultadosMiBanda = await getResultadosByIdBanda(id)
  } catch (err) {
    redirectPorErrorServidorMiBanda(err)
  }

  if (!resultadosMiBanda) {
    return (
      <div className="flex min-h-full w-full justify-center bg-slate-800 px-4 py-8">
        <div className="flex w-full max-w-md flex-col items-center gap-8">
          <header className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-sky-300">Mi banda</h1>
            <p className="text-sm text-slate-400">
              Aún no hay resultados de temporada para esta banda.
            </p>
          </header>
          <MiBandaNavMovil id={id} />
        </div>
      </div>
    );
  }

  const isPodium = esPodio(resultadosMiBanda.rankin);

  const accentTitle = isPodium ? "text-amber-300" : "text-sky-300";
  const accentBright = isPodium ? "text-amber-200" : "text-sky-200";
  const ringBorder = isPodium ? "border-amber-400/90" : "border-sky-400/85";
  const pulseClass = isPodium ? "pulse-golden" : "pulse-blue";
return (
    <div className="flex min-h-full w-full justify-center    py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-8 ">
        <header className="flex flex-col items-center gap-4 text-center animate-slide-in-top ">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${accentTitle}`}>{resultadosMiBanda.nombreBanda}</h1>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Temporada actual</p>
          </div>
        </header>

        <div className="w-fit shrink-0 animate-zoom-in duration-500">
          <div
            className={`flex aspect-square size-60 flex-col items-center justify-center gap-1 overflow-hidden rounded-full border-[6px] bg-slate-900 ${ringBorder} text-center shadow-lg ${pulseClass}`}
          >
            <span className={`tabular-nums text-7xl font-black leading-none sm:text-8xl ${accentBright}`}>
              {resultadosMiBanda.rankin != null && !Number.isNaN(Number(resultadosMiBanda.rankin))
                ? String(resultadosMiBanda.rankin)
                : "?"}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${accentBright} opacity-90`}>
              Posición
            </span>
          </div>
        </div>

        <div className="flex w-full max-w-md items-stretch justify-center gap-4 sm:gap-6">
          <div className="flex min-h-[5.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-slate-600/80 bg-slate-900/50 px-4 py-3 text-center">
            {resultadosMiBanda.promedio != null && !Number.isNaN(Number(resultadosMiBanda.promedio)) ? (
              <>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Promedio</span>
                <span className={`text-2xl font-bold tabular-nums leading-tight ${accentBright} opacity-85`}>
                {Number(resultadosMiBanda.promedio).toFixed(2)}
                </span>
              </>
            ) : (
              <span className={`text-xl font-medium uppercase tracking-wide ${accentBright} opacity-85`}>Promedio</span>
            )}
          </div>
          <div className="flex min-h-[5.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-slate-600/80 bg-slate-900/50 px-4 py-3 text-center">
            {resultadosMiBanda.total_despues_sanciones != null &&
            !Number.isNaN(Number(resultadosMiBanda.total_despues_sanciones)) ? (
              <>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total</span>
                <span className={`text-2xl font-bold tabular-nums leading-tight ${accentBright} opacity-85`}>
                  {resultadosMiBanda.total_despues_sanciones}
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total</span>
                <span className={`text-4xl font-black tabular-nums leading-none ${accentBright}`}>?</span>
              </>
            )}
          </div>
        </div>

        <div className="animate-fade-in-up w-full">
          <MiBandaNavMovil id={id} isPodium={isPodium} />
        </div>
      </div>
    </div>
  );
}

