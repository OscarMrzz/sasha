import CardRowAplicacionSancionLectura from "@/components/CardRow/lectura/CardRowAplicacionSancionLectura";
import {
  redirectPorErrorServidorMiBanda,
  redirectSiFaltanCredencialesServidorMiBanda,
} from "@/helpers/mi-banda/servidorMiBandaHealth";
import { getAllBandasIds } from "@/services/servidor/resultadosServices";
import { getAplicacionSancionesByIdBandaServidor } from "@/services/servidor/sancionesServidorServices";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import React from "react";

export const dynamicParams = true;
/** Evita servir caché de otra banda al cambiar de ruta o tras aplicar sanciones. */
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const bandas = await getAllBandasIds();
  return bandas.map((b) => ({ id: b.idBanda }));
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MiBandaSancionesPage({ params }: Props) {
  const { id } = await params;

  redirectSiFaltanCredencialesServidorMiBanda();

  let filas: Awaited<ReturnType<typeof getAplicacionSancionesByIdBandaServidor>>;
  try {
    filas = await getAplicacionSancionesByIdBandaServidor(id);
  } catch (err) {
    redirectPorErrorServidorMiBanda(err);
  }

  return (
    <div className="min-h-full w-full bg-slate-800 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/mi-banda-page/${id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver a mi banda
        </Link>

        <header className="mb-6 flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">Sanciones de mi banda</h1>
          <span className="text-sm text-slate-400">{filas.length}</span>
        </header>

        {filas.length === 0 ? (
          <p className="rounded-xl border border-slate-600/40 bg-slate-800/40 px-4 py-8 text-center text-slate-400">
            No hay sanciones aplicadas registradas para esta banda.
          </p>
        ) : (
          <section className="flex flex-col gap-3">
            {filas.map((registro) => (
              <CardRowAplicacionSancionLectura
                key={
                  registro.id_registro_sanciones ??
                  `${registro.id_sancion}-${registro.fecha_aplico_sancion}`
                }
                registro={registro}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
