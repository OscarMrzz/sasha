import { getSupabaseAdmin } from "@/lib/services/servidor/supabaseAdmin";
import { vistaAplicacionSancionInterface } from "@/interfaces/interfaces";
import { unstable_cache } from "next/cache";

const vistaAplicacion = "vista_aplicacion_sanciones";

export async function getAplicacionSancionesServidor(): Promise<
  vistaAplicacionSancionInterface[]
> {
  const fetcher = unstable_cache(async () => {
    const { data, error } = await getSupabaseAdmin()
      .from(vistaAplicacion)
      .select("*");
    if (error) throw error;
    return data as vistaAplicacionSancionInterface[];
  });
  return fetcher();
}

export async function getAplicacionSancionesByIdBandaServidor(
  idBanda: string
): Promise<vistaAplicacionSancionInterface[]> {
  const fetcher = unstable_cache(
    async (id: string) => {
      const { data, error } = await getSupabaseAdmin()
        .from(vistaAplicacion)
        .select("*")
        .eq("idBanda", id);
      if (error) throw error;
      return (data ?? []) as vistaAplicacionSancionInterface[];
    },
    [`vista-aplicacion-sanciones-por-banda-${idBanda}`],
    {
      tags: ["sanciones-global", `sanciones-${idBanda}`],
      revalidate: false,
    }
  );
  return fetcher(idBanda);
}
