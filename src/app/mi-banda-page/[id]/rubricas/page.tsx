import TablaRubricasConsulta from "@/components/rubricas/TablaRubricasConsulta";
import {
  redirectPorErrorServidorMiBanda,
  redirectSiFaltanCredencialesServidorMiBanda,
} from "@/helpers/mi-banda/servidorMiBandaHealth";
import {
  getAllBandasIds,
  getPrecargaResultadosPorEvento,
} from "@/services/servidor/resultadosServices";
import Link from "next/link";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const bandas = await getAllBandasIds();
  return bandas.map((b) => ({ id: b.idBanda }));
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RubricasMiBandaPage({ params }: Props) {
  const { id } = await params;

  redirectSiFaltanCredencialesServidorMiBanda();

  let precarga: Awaited<ReturnType<typeof getPrecargaResultadosPorEvento>>;
  try {
    precarga = await getPrecargaResultadosPorEvento(id);
  } catch (err) {
    redirectPorErrorServidorMiBanda(err);
  }

  const idCategoria = precarga?.categoria?.idCategoria?.trim() ?? "";
  const idFederacion = precarga?.banda?.idForaneaFederacion?.trim() ?? "";
  const nombreCategoria = precarga?.categoria?.nombreCategoria ?? "";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <Link
        href={`/mi-banda-page/${id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-sky-400 transition hover:text-sky-300"
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden />
        Volver a mi banda
      </Link>

      {!idCategoria || !idFederacion ? (
        <p className="rounded-xl border border-dashed border-slate-600 bg-slate-800/50 px-4 py-8 text-center text-sm text-slate-400">
          No se encontró la categoría de esta banda para mostrar las rúbricas.
        </p>
      ) : (
        <TablaRubricasConsulta
          titulo="Rúbricas de mi categoría"
          mostrarFiltroCategorias={false}
          idCategoriaFija={idCategoria}
          idForaneaFederacionFija={idFederacion}
          nombreCategoriaFija={nombreCategoria}
        />
      )}
    </div>
  );
}
