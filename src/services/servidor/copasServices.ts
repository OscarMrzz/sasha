
import { getSupabaseAdmin } from "@/services/servidor/supabaseAdmin";
import {
  vistaCopasEventosInterface,
  vistaCopasGlobalInterface,
  vistaCopasTemporadaInterface,
} from "@/models";
import { unstable_cache } from "next/cache";
import { fromDbMany } from "@/services/mappers/caseMapper";

export async function getVistaCopasEventos(): Promise<vistaCopasEventosInterface[]> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_copas_eventos")
        .select("*");
      if (error) throw error;
      return data as vistaCopasEventosInterface[];
    },
    ["vista-copas-eventos"],
    { tags: ["resultados-global"], revalidate: false },
  );
  return fetcher();
}

export async function getVistaCopasGlobal(): Promise<vistaCopasGlobalInterface[]> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_copas_global")
        .select("*");
      if (error) throw error;
      return fromDbMany<vistaCopasGlobalInterface>(data ?? []);
    },
    ["vista-copas-global"],
    { tags: ["resultados-global"], revalidate: false },
  );
  return fetcher();
}

export async function getVistaCopasGlobalByIdBanda(
  idBanda: string,
): Promise<vistaCopasGlobalInterface[]> {
  const fetcher = unstable_cache(
    async (id: string) => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_copas_global")
        .select("*")
        .eq("id_banda", id);
      if (error) throw error;
      return fromDbMany<vistaCopasGlobalInterface>(data ?? []);
    },
    [`vista-copas-global-banda-${idBanda}`],
    {
      tags: ["resultados-global", `resultados-${idBanda}`],
      revalidate: false,
    },
  );
  return fetcher(idBanda);
}

export async function getVistaCopasTemporada(): Promise<
  vistaCopasTemporadaInterface[]
> {
  const fetcher = unstable_cache(
    async () => {
      const { data, error } = await getSupabaseAdmin()
        .from("vista_copas_temporada")
        .select("*");
      if (error) throw error;
      return fromDbMany<vistaCopasTemporadaInterface>(data ?? []);
    },
    ["vista-copas-temporada"],
    { tags: ["copas-temporada", "resultados-global"], revalidate: false },
  );
  return fetcher();
}
