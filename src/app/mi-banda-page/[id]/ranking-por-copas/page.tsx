import {
  redirectPorErrorServidorMiBanda,
  redirectSiFaltanCredencialesServidorMiBanda,
} from "@/lib/mi-banda/servidorMiBandaHealth";
import { getVistaCopasGlobal } from "@/lib/services/servidor/copasServices";
import { getAllBandasIds } from "@/lib/services/servidor/resultadosServices";
import { getSupabaseAdmin } from "@/lib/services/servidor/supabaseAdmin";
import type { vistaCopasGlobalInterface } from "@/interfaces/interfaces";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { ReactNode } from "react";

export const dynamicParams = true;

export async function generateStaticParams() {
  const bandas = await getAllBandasIds();
  return bandas.map((b) => ({ id: b.idBanda }));
}

type Props = {
  params: Promise<{ id: string }>;
};

type FilaCopasRanking = {
  idBanda: string;
  nombreBanda: string;
  posicion: number;
  copas_1: number;
  copas_2: number;
  copas_3: number;
  totalCopas: number;
};

function StatBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <div className="mt-1.5 text-base font-semibold leading-snug text-white sm:text-lg">
        {children}
      </div>
    </div>
  );
}

function CardRowCopasRanking({
  fila,
  esMiBanda,
  index,
}: {
  fila: FilaCopasRanking;
  esMiBanda: boolean;
  index?: number;
}) {
  return (
    <div
      data-testid="card-row-copas-ranking"
      data-codigo={fila.idBanda}
      className={cn(
        "flex w-full flex-col gap-5 rounded-xl bg-slate-700 p-5 shadow-md sm:p-6 animate-blurred-fade-in",
        esMiBanda
          ? "ring-2 ring-amber-400/55 ring-offset-2 ring-offset-slate-950"
          : "hover:bg-slate-600/95",
      )}
      style={
        index != null && index > 0
          ? { animationDelay: `${index * 0.1}s` }
          : undefined
      }
    >
      <div className="flex flex-row items-start gap-4">
        <span
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-black tabular-nums sm:h-16 sm:w-16 sm:text-2xl",
            fila.posicion <= 3
              ? "bg-amber-500/25 text-amber-100"
              : "bg-slate-600 text-slate-100",
          )}
          aria-label={`Posición ${fila.posicion}`}
        >
          {fila.posicion}
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <h2 className="break-words text-xl font-bold leading-snug text-white sm:text-2xl">
            {fila.nombreBanda}
            {esMiBanda && (
              <span className="ml-2 inline-block text-base font-normal text-amber-300 sm:text-lg">
                (tu banda)
              </span>
            )}
          </h2>
        </div>
      </div>

      <div className="flex flex-row flex-wrap justify-between gap-2">
        <StatBlock label="Total copas">
          <span className="tabular-nums text-sky-100">{fila.totalCopas}</span>
        </StatBlock>
        <StatBlock label="1º · 2º · 3º">
          <span className="tabular-nums">
            {fila.copas_1} · {fila.copas_2} · {fila.copas_3}
          </span>
        </StatBlock>
      </div>
    </div>
  );
}

function agruparYOrdenarCopas(
  rows: vistaCopasGlobalInterface[],
  idRegion: string,
  idCategoria: string,
): FilaCopasRanking[] {
  const enZona = rows.filter(
    (row) =>
      row.idForaneaCategoria === idCategoria &&
      row.idForaneaRionBanda === idRegion,
  );

  const porBanda = new Map<
    string,
    { nombreBanda: string; copas: Record<number, number> }
  >();

  for (const row of enZona) {
    const actual = porBanda.get(row.idBanda) ?? {
      nombreBanda: row.nombreBanda,
      copas: {},
    };
    actual.copas[Number(row.lugar)] = Number(row.cantidad) || 0;
    porBanda.set(row.idBanda, actual);
  }

  const filas = [...porBanda.entries()].map(([idBanda, { nombreBanda, copas }]) => {
    const copas_1 = copas[1] ?? 0;
    const copas_2 = copas[2] ?? 0;
    const copas_3 = copas[3] ?? 0;
    return {
      idBanda,
      nombreBanda,
      posicion: 0,
      copas_1,
      copas_2,
      copas_3,
      totalCopas: copas_1 + copas_2 + copas_3,
    };
  });

  filas.sort((a, b) => {
    if (b.copas_1 !== a.copas_1) return b.copas_1 - a.copas_1;
    if (b.copas_2 !== a.copas_2) return b.copas_2 - a.copas_2;
    if (b.copas_3 !== a.copas_3) return b.copas_3 - a.copas_3;
    return a.nombreBanda.localeCompare(b.nombreBanda, "es");
  });

  return filas.map((fila, index) => ({ ...fila, posicion: index + 1 }));
}

export default async function RankingPorCopasPage({ params }: Props) {
  const { id } = await params;
  redirectSiFaltanCredencialesServidorMiBanda();

  let filas: FilaCopasRanking[] = [];
  let nombreRegion = "";
  let nombreCategoria = "";
  const anio = new Date().getFullYear();

  try {
    const db = getSupabaseAdmin();
    const bandRes = await db
      .from("bandas")
      .select("idBanda, idForaneaCategoria, idForaneaRegion")
      .eq("idBanda", id)
      .maybeSingle();

    if (bandRes.error) throw bandRes.error;

    const idCat = bandRes.data?.idForaneaCategoria;
    const idReg = bandRes.data?.idForaneaRegion;

    const [regionRes, categoriaRes, copasGlobal] = await Promise.all([
      idReg
        ? db
            .from("regiones")
            .select("nombreRegion")
            .eq("idRegion", idReg)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      idCat
        ? db
            .from("categorias")
            .select("nombreCategoria")
            .eq("idCategoria", idCat)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      getVistaCopasGlobal(),
    ]);

    if (regionRes.error) throw regionRes.error;
    if (categoriaRes.error) throw categoriaRes.error;

    nombreRegion = regionRes.data?.nombreRegion ?? "";
    nombreCategoria = categoriaRes.data?.nombreCategoria ?? "";

    if (idCat && idReg) {
      filas = agruparYOrdenarCopas(copasGlobal, idReg, idCat);
    }
  } catch (err) {
    redirectPorErrorServidorMiBanda(err);
  }

  const tituloContexto = {
    categoria: nombreCategoria || "tu categoría",
    region: nombreRegion || "tu región",
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-8">
      <Link
        href={`/mi-banda-page/${id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-sky-400 transition hover:text-sky-300"
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden />
        Volver inicio
      </Link>
      <header className="rounded-2xl p-5 backdrop-blur-sm">
        <h1 className="text-xl font-bold text-white md:text-2xl">
          Ranking por copas
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          <span className="text-slate-200">{tituloContexto.region}</span>
          {" · "}
          <span className="text-slate-200">{tituloContexto.categoria}</span>
          {" · Temporada "}
          {anio}
        </p>
      </header>

      {!filas.length ? (
        <p className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
          No hay copas registradas para esta región y categoría.
        </p>
      ) : (
        <section className="flex flex-col gap-5 sm:gap-6">
          {filas.map((fila, index) => (
            <div key={fila.idBanda}>
              <CardRowCopasRanking
                fila={fila}
                esMiBanda={fila.idBanda === id}
                index={index}
              />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
