import ResultadosPorEventoShell from "@/component/miBanda/ResultadosPorEventoShell";
import type {
  RegistroEventoInterface,
  rubricaInterface,
  vistaResultadosModel,
  vistaResultadosPorEventoInterface,
} from "@/interfaces/interfaces";
import {
  redirectPorErrorServidorMiBanda,
  redirectSiFaltanCredencialesServidorMiBanda,
} from "@/lib/mi-banda/servidorMiBandaHealth";
import {
  getAllBandasIds,
  getComentariosBandaEventoServidor,
  getPrecargaResultadosPorEvento,
  getVistaResultadosPorBanda,
} from "@/lib/services/servidor/resultadosServices";
import React from "react";

export const dynamicParams = true;

export async function generateStaticParams() {
  const bandas = await getAllBandasIds();
  return bandas.map((b) => ({ id: b.idBanda }));
}

type Props = {
  params: Promise<{ id: string }>;
};

function anioDesdeFecha(
  fecha: string | Date | null | undefined
): number {
  if (!fecha) return 0;
  const s =
    typeof fecha === "string"
      ? fecha
      : fecha.toISOString().slice(0, 10);
  const y = Number.parseInt(s.slice(0, 4), 10);
  return Number.isFinite(y) ? y : 0;
}

function fechaEventoAString(
  fecha: string | Date | null | undefined
): string {
  if (!fecha) return "";
  return typeof fecha === "string"
    ? fecha
    : fecha.toISOString().slice(0, 10);
}

function vistaPorEventoAVistaResultadosModel(
  row: vistaResultadosPorEventoInterface,
  idForaneaFederacion: string
): vistaResultadosModel {
  const fechaStr = fechaEventoAString(row.fechaEvento);
  return {
    idRegistroCumplimientoEvaluacion: String(
      row.idRegistroCumplimientoEvaluacion ?? ""
    ),
    idForaneaRegion: String(row.idForaneaRegion ?? ""),
    idForaneaCategoria: String(row.idForaneaCategoria ?? ""),
    idForaneaPerfil: String(row.idPerfil ?? ""),
    idForaneaFederacion,
    idForaneaEvento: String(row.idEvento ?? ""),
    idForaneaBanda: String(row.idBanda ?? ""),
    idForaneaRubrica: String(row.idRubrica ?? ""),
    idForaneaCumplimiento: String(row.idCumplimiento ?? ""),
    fechaEvento: fechaStr,
    anioEvento: anioDesdeFecha(row.fechaEvento),
    puntosObtenidos: Number(row.puntosObtenidos ?? 0),
    nombreCriterio: String(row.nombreCriterio ?? ""),
    detalleCumplimiento: String(row.detalleCumplimiento ?? ""),
    LugarEvento: String(row.LugarEvento ?? ""),
    nombreBanda: String(row.nombreBanda ?? ""),
    nombreRubrica: String(row.nombreRubrica ?? ""),
    nombreRegion: String(row.nombreRegion ?? ""),
    nombreCategoria: String(row.nombreCategoria ?? ""),
    nombre: String(row.nombre ?? ""),
    idForaneaCriterio: String(row.idCriterio ?? ""),
  };
}

function normalizarTipoEvento(
  raw: string | null | undefined
): RegistroEventoInterface["tipo_evento"] {
  const v = String(raw ?? "").trim().toLowerCase();
  if (v === "festival" || v === "regional" || v === "nacional") return v;
  return "festival";
}

function normalizarTipoLugar(
  raw: string | null | undefined
): RegistroEventoInterface["tipo_lugar"] {
  const v = String(raw ?? "").trim().toLowerCase();
  if (v === "abierto" || v === "semiabierto" || v === "cerrado") return v;
  return "abierto";
}

function primeraFilaEventoARegistroEvento(
  row: vistaResultadosPorEventoInterface,
  idForaneaFederacion: string
): RegistroEventoInterface {
  const fechaStr = fechaEventoAString(row.fechaEvento);
  return {
    idEvento: String(row.idEvento ?? ""),
    created_at: "",
    LugarEvento: String(row.LugarEvento ?? ""),
    fechaEvento: fechaStr,
    idForaneaRegion: String(row.idForaneaRegion ?? ""),
    idForaneaFederacion,
    estado_evento: "finalizado",
    tipo_evento: normalizarTipoEvento(row.tipo_evento),
    dimensiones_cancha: "",
    tipo_lugar: normalizarTipoLugar(row.tipo_lugar),
  };
}

function rubricasDesdeFilas(
  rows: vistaResultadosPorEventoInterface[],
  idForaneaFederacion: string
): rubricaInterface[] {
  const map = new Map<string, rubricaInterface>();
  for (const row of rows) {
    const id = String(row.idRubrica ?? "").trim();
    if (!id || map.has(id)) continue;
    map.set(id, {
      idRubrica: id,
      created_at: "",
      nombreRubrica: String(row.nombreRubrica ?? ""),
      datalleRubrica: String(row.datalleRubrica ?? ""),
      puntosRubrica: Number(row.puntosRubrica ?? 0),
      idForaneaCategoria: String(row.idForaneaCategoria ?? ""),
      idForaneaFederacion,
      versionRubrica: "",
    });
  }
  return [...map.values()];
}

function puntosPorRubricasYTotal(
  rubricasList: rubricaInterface[],
  resultados: vistaResultadosModel[]
): {
  puntosRubricas: Record<string, number>;
  totalGeneral: number;
} {
  const puntosRubricas: Record<string, number> = {};
  for (const rubrica of rubricasList) {
    const suma = resultados
      .filter((r) => r.idForaneaRubrica === rubrica.idRubrica)
      .reduce((acc, r) => acc + r.puntosObtenidos, 0);
    puntosRubricas[rubrica.idRubrica] = suma;
  }
  const totalGeneral = resultados.reduce((s, r) => s + r.puntosObtenidos, 0);
  return { puntosRubricas, totalGeneral };
}

export default async function ResultadosPorBandaPage({ params }: Props) {
  const { id } = await params;
  redirectSiFaltanCredencialesServidorMiBanda();

  let precarga: Awaited<ReturnType<typeof getPrecargaResultadosPorEvento>>;
  try {
    precarga = await getPrecargaResultadosPorEvento(id);
  } catch (err) {
    redirectPorErrorServidorMiBanda(err);
  }

  if (!precarga) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-4">
        <p className="text-center text-slate-400">
          No se encontró la banda o faltan datos de federación.
        </p>
      </div>
    );
  }

  let vistaFilas: vistaResultadosPorEventoInterface[] = [];
  try {
    vistaFilas = await getVistaResultadosPorBanda(id);
  } catch (err) {
    redirectPorErrorServidorMiBanda(err);
  }

  const idFed = precarga.banda.idForaneaFederacion;

  const porEvento = new Map<string, vistaResultadosPorEventoInterface[]>();
  for (const fila of vistaFilas) {
    const eid = String(fila.idEvento ?? "").trim();
    if (!eid) continue;
    const list = porEvento.get(eid) ?? [];
    list.push(fila);
    porEvento.set(eid, list);
  }

  const rubricasList = rubricasDesdeFilas(vistaFilas, idFed);

  const eventosOrdenados: RegistroEventoInterface[] = [...porEvento.entries()]
    .map(([, filas]) => {
      const primera = filas[0];
      if (!primera) return null;
      return primeraFilaEventoARegistroEvento(primera, idFed);
    })
    .filter((e): e is RegistroEventoInterface => Boolean(e))
    .sort((a, b) =>
      String(b.fechaEvento).localeCompare(String(a.fechaEvento))
    );

  const detallePorEvento: Record<
    string,
    {
      resultados: vistaResultadosModel[];
      comentariosList: Awaited<
        ReturnType<typeof getComentariosBandaEventoServidor>
      >;
      puntosRubricas: Record<string, number>;
      totalGeneral: number;
    }
  > = {};

  try {
    await Promise.all(
      eventosOrdenados.map(async (ev) => {
        const filasEv = porEvento.get(ev.idEvento) ?? [];
        const resultados = filasEv.map((row) =>
          vistaPorEventoAVistaResultadosModel(row, idFed)
        );
        const comentariosList = await getComentariosBandaEventoServidor(
          id,
          ev.idEvento,
          idFed
        );
        const { puntosRubricas, totalGeneral } = puntosPorRubricasYTotal(
          rubricasList,
          resultados
        );
        detallePorEvento[ev.idEvento] = {
          resultados,
          comentariosList,
          puntosRubricas,
          totalGeneral,
        };
      })
    );
  } catch (err) {
    redirectPorErrorServidorMiBanda(err);
  }

  const perfil = {
    federaciones: precarga.federacion ?? undefined,
  };

  return (
    <ResultadosPorEventoShell
      perfil={perfil}
      banda={precarga.banda}
      categoria={precarga.categoria}
      rubricasList={rubricasList}
      eventosOrdenados={eventosOrdenados}
      detallePorEvento={detallePorEvento}
    />
  );
}
