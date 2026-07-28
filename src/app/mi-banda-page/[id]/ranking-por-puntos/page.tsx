import CardRowPosicionRegional from "@/components/CardRow/CardRowPosicionRegional";
import {
  redirectPorErrorServidorMiBanda,
  redirectSiFaltanCredencialesServidorMiBanda,
} from "@/helpers/mi-banda/servidorMiBandaHealth";
import {
  getAllBandasIds,
  getTablaPosicionesByIdBanda,
} from "@/services/servidor/resultadosServices";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export const dynamicParams = true;

export async function generateStaticParams() {
  const bandas = await getAllBandasIds();
  return bandas.map((b) => ({ id: b.idBanda }));
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TablaDePosicionPage({ params }: Props) {
  const { id } = await params;
  redirectSiFaltanCredencialesServidorMiBanda();

  let payload: Awaited<ReturnType<typeof getTablaPosicionesByIdBanda>>;
  try {
    payload = await getTablaPosicionesByIdBanda(id);
  } catch (err) {
    redirectPorErrorServidorMiBanda(err);
  }
  const { nombreRegion, filas, idMiBanda } = payload;

  const tituloContexto = {
    categoria: filas[0]?.nombreCategoria ?? "tu categoría",
    region: nombreRegion || "tu región",
  };

  const anio = new Date().getFullYear();

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
          Ranking por puntos
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
          No hay resultados de temporada para esta región y categoría.
        </p>
      ) : (
        <section className="flex flex-col gap-5 sm:gap-6">
          {filas.map((fila) => (
            <div key={fila.idBanda}>
              <CardRowPosicionRegional
                fila={fila}
                esMiBanda={fila.idBanda === idMiBanda}
              />
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
