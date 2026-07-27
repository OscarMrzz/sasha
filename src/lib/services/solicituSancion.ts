import { dataBaseSupabase } from "../supabase";
import {
  solicitudSancionInterface,
  vistaDetalleSolicitudSancionInterface,
} from "@/interfaces/interfaces";

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
  return data as vistaDetalleSolicitudSancionInterface[];
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
  return data as vistaDetalleSolicitudSancionInterface;
}

export async function createSolicitudSancion(
  payload: SolicitudSancionInsert
): Promise<solicitudSancionInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .insert(payload)
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
    .update(payload)
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
