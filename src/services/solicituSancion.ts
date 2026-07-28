import { dataBaseSupabase } from "@/lib/supabase";
import {
  solicitudSancionInterface,
  vistaDetalleSolicitudSancionInterface,
} from "@/models";
import { toDb } from "@/services/mappers/caseMapper";

/**
 * `vista_solicitud_sancion` devuelve id_banda/nombre_banda/id_categoria/
 * nombre_categoria/id_region/nombre_region en snake_case, pero la interfaz
 * conserva esos campos en camelCase por compatibilidad con la UI existente.
 */
function mapVistaDetalleSolicitudSancionRow(
  row: Record<string, unknown>,
): vistaDetalleSolicitudSancionInterface {
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
  } as vistaDetalleSolicitudSancionInterface;
}

function mapVistaDetalleSolicitudSancionRows(
  rows: Record<string, unknown>[] | null,
): vistaDetalleSolicitudSancionInterface[] {
  return (rows ?? []).map(mapVistaDetalleSolicitudSancionRow);
}

type SolicitudSancionInsert = Omit<
  solicitudSancionInterface,
  "id_solicitud_sancion" | "created_at_solicitud_sancion"
>;
type SolicitudSancionUpdate = Partial<SolicitudSancionInsert>;

const tabla = "solicitar_sancion";
const elId = "id_solicitud_sancion";
const vistaDetalle = "vista_solicitud_sancion";

export async function getSolicitudesSancion(): Promise<
  solicitudSancionInterface[]
> {
  const { data, error } = await dataBaseSupabase.from(tabla).select("*");

  if (error) throw error;
  return data as solicitudSancionInterface[];
}

export async function getDetalleSolicitudesSancion(): Promise<
  vistaDetalleSolicitudSancionInterface[]
> {
  const { data, error } = await dataBaseSupabase.from(vistaDetalle).select("*");

  if (error) throw error;
  return mapVistaDetalleSolicitudSancionRows(data);
}

export async function getSolicitudSancionById(
  id: string
): Promise<solicitudSancionInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .select("*")
    .eq(elId, id)
    .single();

  if (error) throw error;
  return data as solicitudSancionInterface;
}

export async function getDetalleSolicitudSancionById(
  id: string
): Promise<vistaDetalleSolicitudSancionInterface> {
  const { data, error } = await dataBaseSupabase
    .from(vistaDetalle)
    .select("*")
    .eq(elId, id)
    .single();

  if (error) throw error;
  return mapVistaDetalleSolicitudSancionRow(data);
}

export async function createSolicitudSancion(
  payload: SolicitudSancionInsert
): Promise<solicitudSancionInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .insert(toDb(payload as unknown as Record<string, unknown>))
    .select("*")
    .single();

  if (error) throw error;
  return data as solicitudSancionInterface;
}

export async function updateSolicitudSancion(
  id: string,
  payload: SolicitudSancionUpdate
): Promise<solicitudSancionInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .update(toDb(payload as unknown as Record<string, unknown>))
    .eq(elId, id)
    .select("*")
    .single();

  if (error) throw error;
  return data as solicitudSancionInterface;
}

export async function deleteSolicitudSancion(id: string): Promise<boolean> {
  const { error } = await dataBaseSupabase.from(tabla).delete().eq(elId, id);

  if (error) throw error;
  return true;
}
