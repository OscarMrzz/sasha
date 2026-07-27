import { dataBaseSupabase } from "../supabase";
import { sancionInterface } from "@/interfaces/interfaces";

type SancionInsert = Omit<sancionInterface, "id_sancion" | "created_at">;
type SancionUpdate = Partial<SancionInsert>;

const tabla = "sanciones";
const elId = "id_sancion";

export async function getSanciones(): Promise<sancionInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .select("*")
  

  if (error) throw error;
  return data as sancionInterface[];
}

export async function getSancionById(id: string): Promise<sancionInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .select("*")
    .eq(elId, id)
    .single();

  if (error) throw error;
  return data as sancionInterface;
}

export async function createSancion(
  payload: SancionInsert
): Promise<sancionInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data as sancionInterface;
}

export async function updateSancion(
  id: string,
  payload: SancionUpdate
): Promise<sancionInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .update(payload)
    .eq(elId, id)
    .select("*")
    .single();

  if (error) throw error;
  return data as sancionInterface;
}

export async function deleteSancion(id: string): Promise<boolean> {
  const { error } = await dataBaseSupabase.from(tabla).delete().eq(elId, id);

  if (error) throw error;
  return true;
}
