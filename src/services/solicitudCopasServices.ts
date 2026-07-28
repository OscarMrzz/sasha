import { dataBaseSupabase } from "@/lib/supabase";
import {
  solicitudCopaInterface,
  detalleSolicitudCopaInterface,
} from "@/models";
import { toDb } from "@/services/mappers/caseMapper";

/**
 * `vista_solicitud_copas` devuelve sus columnas en snake_case, pero
 * `detalleSolicitudCopaInterface` conserva varios campos en camelCase por
 * compatibilidad con la UI existente. Se remapean solo esos alias.
 */
function mapDetalleSolicitudCopaRow(
  row: Record<string, unknown>,
): detalleSolicitudCopaInterface {
  const {
    id_evento,
    lugar_evento,
    fecha_evento,
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
    idEvento: (id_evento as string | null) ?? null,
    LugarEvento: (lugar_evento as string | null) ?? null,
    fechaEvento: (fecha_evento as string | null) ?? null,
    idBanda: (id_banda as string | null) ?? null,
    nombreBanda: (nombre_banda as string | null) ?? null,
    idCategoria: (id_categoria as string | null) ?? null,
    nombreCategoria: (nombre_categoria as string | null) ?? null,
    idRegion: (id_region as string | null) ?? null,
    nombreRegion: (nombre_region as string | null) ?? null,
  } as detalleSolicitudCopaInterface;
}

function mapDetalleSolicitudCopaRows(
  rows: Record<string, unknown>[] | null,
): detalleSolicitudCopaInterface[] {
  return (rows ?? []).map(mapDetalleSolicitudCopaRow);
}

type SolicitudCopaInsert = Omit<
  solicitudCopaInterface,
  "id_solicitud_copa" | "created_at_solicitud_copa"
>;
type SolicitudCopaUpdate = Partial<SolicitudCopaInsert>;

const tabla = "solicitud_copas";
const elId = "id_solicitud_copa";
const vistaDetalle = "vista_solicitud_copas";

export async function getSolicitudesCopas(): Promise<
  solicitudCopaInterface[]
> {
  const { data, error } = await dataBaseSupabase.from(tabla).select("*");

  if (error) throw error;
  return data as solicitudCopaInterface[];
}

export async function getDetalleSolicitudesCopas(): Promise<
  detalleSolicitudCopaInterface[]
> {
  const { data, error } = await dataBaseSupabase.from(vistaDetalle).select("*");

  if (error) throw error;
  return mapDetalleSolicitudCopaRows(data);
}

export async function getSolicitudCopaById(
  id: string
): Promise<solicitudCopaInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .select("*")
    .eq(elId, id)
    .single();

  if (error) throw error;
  return data as solicitudCopaInterface;
}

export async function getDetalleSolicitudCopaById(
  id: string
): Promise<detalleSolicitudCopaInterface> {
  const { data, error } = await dataBaseSupabase
    .from(vistaDetalle)
    .select("*")
    .eq(elId, id)
    .single();

  if (error) throw error;
  return mapDetalleSolicitudCopaRow(data);
}

export async function createSolicitudCopa(
  payload: SolicitudCopaInsert
): Promise<solicitudCopaInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .insert(toDb(payload as unknown as Record<string, unknown>))
    .select("*")
    .single();

  if (error) throw error;
  return data as solicitudCopaInterface;
}

export async function updateSolicitudCopa(
  id: string,
  payload: SolicitudCopaUpdate
): Promise<solicitudCopaInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .update(toDb(payload as unknown as Record<string, unknown>))
    .eq(elId, id)
    .select("*")
    .single();

  if (error) throw error;
  return data as solicitudCopaInterface;
}

export async function deleteSolicitudCopa(id: string): Promise<boolean> {
  const { error } = await dataBaseSupabase.from(tabla).delete().eq(elId, id);

  if (error) throw error;
  return true;
}
