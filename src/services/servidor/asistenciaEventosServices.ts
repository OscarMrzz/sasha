import type {
  vistaAsistenciaEventosGlobalInterface,
  vistaAsistenciaEventosInterface,
} from "@/models";
import { fromDbMany } from "@/services/mappers/caseMapper";
import { getSupabaseAdmin } from "@/services/servidor/supabaseAdmin";
import { unstable_cache } from "next/cache";

/** Todas las filas de `vista_asistencia_eventos` (todas las bandas). */
export async function getVistaAsistenciaEventos(): Promise<
  vistaAsistenciaEventosInterface[]
> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_asistencia_eventos")
        .select("*");
      if (error) throw error;
      return fromDbMany<vistaAsistenciaEventosInterface>(data ?? []);
    },
    ["vista-asistencia-eventos-todas-las-filas"],
    {
      tags: ["eventos-banda-global"],
      revalidate: false,
    }
  );
  return fetcher();
}

/** Participación en eventos (vista por evaluaciones) para una banda. */
export async function getVistaAsistenciaEventosByIdBanda(
  idBanda: string
): Promise<vistaAsistenciaEventosInterface[]> {
  const fetcher = unstable_cache(
    async (id: string) => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_asistencia_eventos")
        .select("*")
        .eq("id_banda", id);
      if (error) throw error;
      return fromDbMany<vistaAsistenciaEventosInterface>(data ?? []);
    },
    [`vista-asistencia-eventos-por-banda-${idBanda}`],
    {
      tags: [
        "eventos-banda-global",
        `eventos-banda-${idBanda}`,
        `resultados-${idBanda}`,
      ],
      revalidate: false,
    }
  );
  return fetcher(idBanda);
}

/** Agregado global (nombre_banda + cantidad); sin `idBanda` en la vista. */
export async function getVistaAsistenciaEventosGlobal(): Promise<
  vistaAsistenciaEventosGlobalInterface[]
> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_asistencia_eventos_global")
        .select("*");
      if (error) throw error;
      return fromDbMany<vistaAsistenciaEventosGlobalInterface>(data ?? []);
    },
    ["vista-asistencia-eventos-global-agregada"],
    {
      tags: ["eventos-banda-global"],
      revalidate: false,
    }
  );
  return fetcher();
}
