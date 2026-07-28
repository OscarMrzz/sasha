import { dataBaseSupabase } from "@/lib/supabase";
import {
  registroSancionInterface,
  vistaAplicacionSancionInterface,
} from "@/models";

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
  return data as vistaAplicacionSancionInterface[];
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
  return data as vistaAplicacionSancionInterface[];
}

export async function getAllAplicacionSancionByIdBanda(
  idBanda: string
): Promise<vistaAplicacionSancionInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(vistaAplicacion)
    .select("*")
    .eq("idBanda", idBanda);

  if (error) throw error;
  return data as vistaAplicacionSancionInterface[];
}

export async function getAllAplicacionSancionByIdSancion(
  idSancion: string
): Promise<vistaAplicacionSancionInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(vistaAplicacion)
    .select("*")
    .eq("id_sancion", idSancion);

  if (error) throw error;
  return data as vistaAplicacionSancionInterface[];
}

export async function getAllAplicacionSancionByIdCategoria(
  idCategoria: string
): Promise<vistaAplicacionSancionInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(vistaAplicacion)
    .select("*")
    .eq("idCategoria", idCategoria);

  if (error) throw error;
  return data as vistaAplicacionSancionInterface[];
}

export async function getAllAplicacionSancionByIdRegion(
  idRegion: string
): Promise<vistaAplicacionSancionInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(vistaAplicacion)
    .select("*")
    .eq("idRegion", idRegion);

  if (error) throw error;
  return data as vistaAplicacionSancionInterface[];
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
  return data as vistaAplicacionSancionInterface;
}

export async function createAplicacionSancion(
  payload: RegistroInsert
): Promise<registroSancionInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tablaRegistro)
    .insert(payload)
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
    .update(payload)
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
