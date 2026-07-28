import { getSupabaseAdmin } from "@/services/servidor/supabaseAdmin";
import { vistaAplicacionSancionInterface } from "@/models";
import { unstable_cache } from "next/cache";

const vistaAplicacion = "vista_aplicacion_sanciones";

/**
 * `vista_aplicacion_sanciones` devuelve id_banda/nombre_banda/id_categoria/
 * nombre_categoria/id_region/nombre_region en snake_case, pero la interfaz
 * conserva esos campos en camelCase por compatibilidad con la UI existente.
 */
function mapVistaAplicacionSancionRow(
  row: Record<string, unknown>,
): vistaAplicacionSancionInterface {
  const {
    id_banda,
    nombre_banda,
    id_categoria,
    nombre_categoria,
    id_region,
    nombre_region,
    ...rest
  } = row;
  return {
    ...rest,
    idBanda: (id_banda as string | null) ?? null,
    nombreBanda: (nombre_banda as string | null) ?? null,
    idCategoria: (id_categoria as string | null) ?? null,
    nombreCategoria: (nombre_categoria as string | null) ?? null,
    idRegion: (id_region as string | null) ?? null,
    nombreRegion: (nombre_region as string | null) ?? null,
  } as vistaAplicacionSancionInterface;
}

function mapVistaAplicacionSancionRows(
  rows: Record<string, unknown>[] | null,
): vistaAplicacionSancionInterface[] {
  return (rows ?? []).map(mapVistaAplicacionSancionRow);
}

export async function getAplicacionSancionesServidor(): Promise<
  vistaAplicacionSancionInterface[]
> {
  const fetcher = unstable_cache(async () => {
    const { data, error } = await getSupabaseAdmin()
      .from(vistaAplicacion)
      .select("*");
    if (error) throw error;
    return mapVistaAplicacionSancionRows(data);
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
        .eq("id_banda", id);
      if (error) throw error;
      return mapVistaAplicacionSancionRows(data);
    },
    [`vista-aplicacion-sanciones-por-banda-${idBanda}`],
    {
      tags: ["sanciones-global", `sanciones-${idBanda}`],
      revalidate: false,
    }
  );
  return fetcher(idBanda);
}
