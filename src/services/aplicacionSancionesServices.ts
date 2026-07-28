import { dataBaseSupabase } from "@/lib/supabase";
import {
  registroSancionInterface,
  vistaAplicacionSancionInterface,
} from "@/models";
import { toDb } from "@/services/mappers/caseMapper";

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

type RegistroInsert = Omit<
  registroSancionInterface,
  "id_registro_sanciones" | "created_at"
>;
type RegistroUpdate = Partial<RegistroInsert>;

const tablaRegistro = "registro_sanciones";
const elId = "id_registro_sanciones";
const vistaAplicacion = "vista_aplicacion_sanciones";

export async function getAllAplicacionSanciones(): Promise<
  vistaAplicacionSancionInterface[]
> {
  const { data, error } = await dataBaseSupabase.from(vistaAplicacion).select("*");

  if (error) throw error;
  return mapVistaAplicacionSancionRows(data);
}

export async function getAplicacionSancionesPorAnio(
  anio: number
): Promise<vistaAplicacionSancionInterface[]> {
  const desde = `${anio}-01-01`;
  const hasta = `${anio}-12-31`;
  const { data, error } = await dataBaseSupabase
    .from(vistaAplicacion)
    .select("*")
    .gte("fecha_aplico_sancion", desde)
    .lte("fecha_aplico_sancion", hasta);

  if (error) throw error;
  return mapVistaAplicacionSancionRows(data);
}

export async function getAllAplicacionSancionByIdBanda(
  idBanda: string
): Promise<vistaAplicacionSancionInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(vistaAplicacion)
    .select("*")
    .eq("id_banda", idBanda);

  if (error) throw error;
  return mapVistaAplicacionSancionRows(data);
}

export async function getAllAplicacionSancionByIdSancion(
  idSancion: string
): Promise<vistaAplicacionSancionInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(vistaAplicacion)
    .select("*")
    .eq("id_sancion", idSancion);

  if (error) throw error;
  return mapVistaAplicacionSancionRows(data);
}

export async function getAllAplicacionSancionByIdCategoria(
  idCategoria: string
): Promise<vistaAplicacionSancionInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(vistaAplicacion)
    .select("*")
    .eq("id_categoria", idCategoria);

  if (error) throw error;
  return mapVistaAplicacionSancionRows(data);
}

export async function getAllAplicacionSancionByIdRegion(
  idRegion: string
): Promise<vistaAplicacionSancionInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(vistaAplicacion)
    .select("*")
    .eq("id_region", idRegion);

  if (error) throw error;
  return mapVistaAplicacionSancionRows(data);
}

export async function getAplicacionSancionById(
  idRegistro: string
): Promise<vistaAplicacionSancionInterface> {
  const { data, error } = await dataBaseSupabase
    .from(vistaAplicacion)
    .select("*")
    .eq(elId, idRegistro)
    .single();

  if (error) throw error;
  return mapVistaAplicacionSancionRow(data);
}

export async function createAplicacionSancion(
  payload: RegistroInsert
): Promise<registroSancionInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tablaRegistro)
    .insert(toDb(payload as unknown as Record<string, unknown>))
    .select("*")
    .single();

  if (error) throw error;
  return data as registroSancionInterface;
}

export async function updateAplicacionSancion(
  id: string,
  payload: RegistroUpdate
): Promise<registroSancionInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tablaRegistro)
    .update(toDb(payload as unknown as Record<string, unknown>))
    .eq(elId, id)
    .select("*")
    .single();

  if (error) throw error;
  return data as registroSancionInterface;
}

export async function deleteAplicacionSancion(id: string): Promise<boolean> {
  const { error } = await dataBaseSupabase
    .from(tablaRegistro)
    .delete()
    .eq(elId, id);

  if (error) throw error;
  return true;
}
