import { EstadisticasDescriptivas } from "@/component/miBanda/EstadisticasDescriptivas";
import EventosParticipados from "@/component/miBanda/EventosParticipados";
import { HeroPosicion } from "@/component/miBanda/HeroPosicion";
import NumeroPenalizaciones from "@/component/miBanda/NumeroPenalizaciones";
import { Podios } from "@/component/miBanda/Podios";
import RendimientoPorRubricagrup from "@/component/miBanda/RendimientoPorRubricagrup";
import TotalTemporada from "@/component/miBanda/TotalTemporada";
import {
  redirectPorErrorServidorMiBanda,
  redirectSiFaltanCredencialesServidorMiBanda,
} from "@/lib/mi-banda/servidorMiBandaHealth";
import { getVistaCopasGlobalByIdBanda } from "@/lib/services/servidor/copasServices";
import {
  getAllBandasIds,
  getEstadisticasByIdBanda,
  getResultadosByIdBanda,
  getVistaRendimientoPorRubricaTemporadaActualByIdBanda,
} from "@/lib/services/servidor/resultadosServices";
import { cn } from "@/lib/utils";
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

export default async function EstadisticasPage({ params }: Props) {
  const { id } = await params;
  redirectSiFaltanCredencialesServidorMiBanda();

  let precarga: Awaited<ReturnType<typeof getEstadisticasByIdBanda>>;
  let resultadosTemporada: Awaited<ReturnType<typeof getResultadosByIdBanda>>;
  let rendimientoPorRubricaTemporadaActual: Awaited<
    ReturnType<typeof getVistaRendimientoPorRubricaTemporadaActualByIdBanda>
  >;
  let copastemporadaActual: Awaited<ReturnType<typeof getVistaCopasGlobalByIdBanda>>;

  try {
    precarga = await getEstadisticasByIdBanda(id);
    resultadosTemporada = await getResultadosByIdBanda(id);
    rendimientoPorRubricaTemporadaActual =
      await getVistaRendimientoPorRubricaTemporadaActualByIdBanda(id);
    copastemporadaActual = await getVistaCopasGlobalByIdBanda(id);
  } catch (err) {
    redirectPorErrorServidorMiBanda(err);
  }

  if (!precarga) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-4">
        <p className="text-center text-slate-400">
          No se encontró la banda o faltan datos de federación/categoría.
        </p>
      </div>
    );
  }

  const podios = {
    primeros: 0,
    segundos: 0,
    terceros: 0,
  };

  copastemporadaActual.forEach((copa) => {
    if (copa.lugar === 1) {
      podios.primeros = Number(copa.cantidad);
    } else if (copa.lugar === 2) {
      podios.segundos = Number(copa.cantidad);
    } else if (copa.lugar === 3) {
      podios.terceros = Number(copa.cantidad);
    }
  });

  const eventosParticipados = new Set(
    precarga.eventosRankings.map((e) => e.idForaneaEvento),
  ).size;

  return (
    <div className="w-full pt-6 pb-8">
      <div
        className={cn(
          "mx-auto flex max-w-5xl flex-col gap-6 px-4 md:px-6",
          "xl:grid xl:max-w-[1600px] xl:grid-cols-12 xl:grid-rows-[auto_auto_auto] xl:items-stretch xl:gap-6",
          "2xl:max-w-[1760px]",
        )}
      >
        <Link
        href={`/mi-banda-page/${id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-sky-400 transition hover:text-sky-300"
      >
        <ChevronLeftIcon className="h-4 w-4" aria-hidden />
        Volver inicio
      </Link>
        <HeroPosicion
          className="min-h-0 xl:col-span-6 xl:col-start-4 xl:row-start-1"
          resultado={resultadosTemporada ?? undefined}
          nombreBanda={resultadosTemporada?.nombreBanda ?? ""}
          promedioTemporada={resultadosTemporada?.promedio ?? 0}
        />

        <EstadisticasDescriptivas
          className="min-h-0 xl:col-span-3 xl:col-start-10 xl:row-start-1"
          promedio={resultadosTemporada?.promedio ?? 0}
        />

        <TotalTemporada
          className="min-h-0 xl:col-span-3 xl:col-start-4 xl:row-start-2"
          total={resultadosTemporada?.total_despues_sanciones ?? 0}
        />
        <NumeroPenalizaciones
          className="min-h-0 xl:col-span-3 xl:col-start-7 xl:row-start-2"
          cantidad={precarga.penalizacionesCount}
        />
        <EventosParticipados
          className="min-h-0 xl:col-span-3 xl:col-start-10 xl:row-start-2"
          cantidad={eventosParticipados}
        />

        <Podios
          variant="sidebar"
          className="min-h-0 xl:col-span-3 xl:col-start-1 xl:row-span-3 xl:row-start-1"
          primeros={podios.primeros}
          segundos={podios.segundos}
          terceros={podios.terceros}
        />

        <RendimientoPorRubricagrup
          className="min-h-0 xl:col-span-9 xl:col-start-4 xl:row-start-3"
          rendimientoPorRubricaList={rendimientoPorRubricaTemporadaActual}
        />
      </div>
    </div>
  );
}
