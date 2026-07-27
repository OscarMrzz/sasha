import { dataBaseSupabase } from "../supabase";
import {
  solicitudCopaInterface,
  detalleSolicitudCopaInterface,
} from "@/interfaces/interfaces";

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
  return data as detalleSolicitudCopaInterface[];
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
  return data as detalleSolicitudCopaInterface;
}

export async function createSolicitudCopa(
  payload: SolicitudCopaInsert
): Promise<solicitudCopaInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .insert(payload)
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
    .update(payload)
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
