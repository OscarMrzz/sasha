import { dataBaseSupabase } from "@/lib/supabase";
import {
  checkoutBandaInterface,
  CheckoutDetalleInterface,
} from "@/models";
import BandasServices from "@/services/bandasServices";
import CategoriasServices from "@/services/categoriaServices";
import {
  esLlegadaConfirmadaPorDirigente,
  esPendienteRegistroIngreso,
} from "@/components/diciplina/checkoutUtils";

export type CheckoutLlegadaInsert = Pick<
  checkoutBandaInterface,
  | "id_foranea_banda"
  | "hora_llegada_banda"
  | "id_foranea_diciplina"
  | "time_envio_confirmacion_llegada"
  | "id_foranea_evento"
>;

export type CheckoutConfirmacionUpdate = Pick<
  checkoutBandaInterface,
  | "confirmacion_horallegada"
  | "time_confirmacion_hora_llegada"
  | "id_foranea_confirmador"
>;

export type CheckoutIngresoUpdate = Pick<
  checkoutBandaInterface,
  | "hora_ingreso"
  | "cantidad_integrantes"
  | "cantidad_palillonas"
  | "aportacion"
  | "observaciones"
  | "time_envio_confirmacion_ingreso"
>;

export type CheckoutConfirmacionIngresoUpdate = Pick<
  checkoutBandaInterface,
  | "confirmacion_hora_ingreso"
  | "time_confirmacion_hora_ingreso"
  | "id_foranea_confirmador"
>;

const vista = "vista_detalle_checkout";
const tabla = "checkout";

export async function getAllCheckout(): Promise<CheckoutDetalleInterface[]> {
  const { data, error } = await dataBaseSupabase.from(vista).select("*");
  if (error) throw error;
  return (data ?? []) as CheckoutDetalleInterface[];
}

export async function getCheckoutBandaById(
  id: string,
): Promise<CheckoutDetalleInterface> {
  const { data, error } = await dataBaseSupabase
    .from(vista)
    .select("*")
    .eq("id_foranea_banda", id)
    .single();
  if (error) throw error;
  return data as CheckoutDetalleInterface;
}

export async function getCheckoutBandaByIdByEvento(
  id: string,
  idEvento: string,
): Promise<CheckoutDetalleInterface> {
  const { data, error } = await dataBaseSupabase
    .from(vista)
    .select("*")
    .eq("id_foranea_banda", id)
    .eq("id_foranea_evento", idEvento)
    .single();
  if (error) throw error;
  return data as CheckoutDetalleInterface;
}

export async function getAllCheckoutByEvento(
  idEvento: string,
): Promise<CheckoutDetalleInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(vista)
    .select("*")
    .eq("id_foranea_evento", idEvento);
  if (error) throw error;
  return (data ?? []) as CheckoutDetalleInterface[];
}

export async function createCheckout(
  payload: checkoutBandaInterface,
): Promise<checkoutBandaInterface> {
  // Sin .select(): con solo permiso INSERT, PostgREST exige SELECT para devolver la fila.
  const { error } = await dataBaseSupabase.from(tabla).insert(payload);
  if (error) throw error;
  return {
    ...payload,
    id_checkout: payload.id_checkout ?? "",
    created_at_checkout: payload.created_at_checkout ?? new Date().toISOString(),
  } as checkoutBandaInterface;
}

export async function createCheckoutLlegada(
  payload: CheckoutLlegadaInsert,
): Promise<checkoutBandaInterface> {
  const { error } = await dataBaseSupabase.from(tabla).insert(payload);
  if (error) throw error;
  return {
    ...payload,
    id_checkout: "",
    created_at_checkout: new Date().toISOString(),
  } as checkoutBandaInterface;
}

export async function updateCheckout(
  idCheckout: string,
  payload: Partial<checkoutBandaInterface>,
): Promise<checkoutBandaInterface> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .update(payload)
    .eq("id_checkout", idCheckout)
    .select("id_checkout");

  if (error) throw error;

  if (!data?.length) {
    throw new Error(
      "No se actualizó el registro: sin permiso en checkout o el perfil no tiene idForaneaBanda vinculado a esta banda. Ejecuta supabase/snippets/politicas/politicas.sql en Supabase.",
    );
  }

  return {
    id_checkout: idCheckout,
    created_at_checkout: new Date().toISOString(),
    id_foranea_evento: payload.id_foranea_evento ?? "",
    ...payload,
  } as checkoutBandaInterface;
}

export async function deleteCheckout(idCheckout: string): Promise<boolean> {
  const { error } = await dataBaseSupabase
    .from(tabla)
    .delete()
    .eq("id_checkout", idCheckout);
  if (error) throw error;
  return true;
}

export async function getCheckoutNotificacionesLlegada(
  idBanda: string,
): Promise<CheckoutDetalleInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(vista)
    .select("*")
    .eq("id_foranea_banda", idBanda)
    .not("time_envio_confirmacion_llegada", "is", null)
    .is("confirmacion_horallegada", null);
  if (error) throw error;
  return (data ?? []) as CheckoutDetalleInterface[];
}

export async function getCheckoutNotificacionesIngreso(
  idBanda: string,
): Promise<CheckoutDetalleInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(vista)
    .select("*")
    .eq("id_foranea_banda", idBanda)
    .not("time_envio_confirmacion_ingreso", "is", null)
    .is("confirmacion_hora_ingreso", null);
  if (error) throw error;
  return (data ?? []) as CheckoutDetalleInterface[];
}

export async function getCheckoutConfirmadosLlegada(
  idEvento: string,
): Promise<CheckoutDetalleInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(vista)
    .select("*")
    .eq("id_foranea_evento", idEvento)
    .eq("confirmacion_horallegada", true);
  if (error) throw error;
  return (data ?? []) as CheckoutDetalleInterface[];
}

function filtrarPendientesEntrada(
  filas: CheckoutDetalleInterface[],
): CheckoutDetalleInterface[] {
  return filas
    .filter(
      (r) =>
        Boolean(r.id_checkout) &&
        esLlegadaConfirmadaPorDirigente(r.confirmacion_horallegada) &&
        esPendienteRegistroIngreso(r.time_envio_confirmacion_ingreso),
    )
    .sort((a, b) =>
      String(a.hora_llegada_banda ?? "").localeCompare(
        String(b.hora_llegada_banda ?? ""),
      ),
    );
}

/** Respaldo: lee `checkout` y enriquece nombres si la vista no devuelve filas (p. ej. RLS/joins). */
async function getCheckoutPendientesEntradaDesdeTabla(
  idEvento: string,
): Promise<CheckoutDetalleInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(tabla)
    .select("*")
    .eq("id_foranea_evento", idEvento)
    .eq("confirmacion_horallegada", true)
    .is("time_envio_confirmacion_ingreso", null);
  if (error) throw error;
  const filas = (data ?? []) as checkoutBandaInterface[];
  const pendientes = filas.filter(
    (r) =>
      esLlegadaConfirmadaPorDirigente(r.confirmacion_horallegada) &&
      esPendienteRegistroIngreso(r.time_envio_confirmacion_ingreso),
  );
  if (pendientes.length === 0) return [];

  const bandasSvc = new BandasServices();
  await bandasSvc.initPerfil();
  const catSvc = new CategoriasServices();
  await catSvc.initPerfil();
  const [bandas, categorias] = await Promise.all([
    bandasSvc.getDatosAmpleos(),
    catSvc.get(),
  ]);
  const bandaPorId = new Map(bandas.map((b) => [b.idBanda, b]));
  const catPorId = new Map(
    (categorias ?? []).map((c) => [c.idCategoria, c.nombreCategoria]),
  );

  return pendientes.map((row) => {
    const banda = bandaPorId.get(row.id_foranea_banda ?? "");
    return {
      ...row,
      id_foranea_evento: row.id_foranea_evento ?? idEvento,
      nombreBanda: banda?.nombreBanda ?? "—",
      nombreCategoria: catPorId.get(banda?.idForaneaCategoria ?? "") ?? "—",
      nombreRegion: banda?.regiones?.nombreRegion ?? "—",
      LugarEvento: "",
    } as CheckoutDetalleInterface;
  });
}

/** Llegada confirmada por el dirigente y pendiente de registrar ingreso (checkout entrada). */
export async function getCheckoutPendientesEntrada(
  idEvento: string,
): Promise<CheckoutDetalleInterface[]> {
  if (!idEvento?.trim()) return [];

  const { data, error } = await dataBaseSupabase
    .from(vista)
    .select("*")
    .eq("id_foranea_evento", idEvento)
    .eq("confirmacion_horallegada", true)
    .is("time_envio_confirmacion_ingreso", null);
  if (error) throw error;

  const desdeVista = filtrarPendientesEntrada(
    (data ?? []) as CheckoutDetalleInterface[],
  );
  if (desdeVista.length > 0) return desdeVista;

  return filtrarPendientesEntrada(
    await getCheckoutPendientesEntradaDesdeTabla(idEvento),
  );
}

/** Todos los eventos del día (evita perder bandas si el selector apunta a otro evento). */
export async function getCheckoutPendientesEntradaVariosEventos(
  idEventos: string[],
): Promise<CheckoutDetalleInterface[]> {
  const ids = [...new Set(idEventos.filter(Boolean))];
  if (ids.length === 0) return [];
  const listas = await Promise.all(ids.map((id) => getCheckoutPendientesEntrada(id)));
  const porCheckout = new Map<string, CheckoutDetalleInterface>();
  for (const r of listas.flat()) {
    if (r.id_checkout) porCheckout.set(r.id_checkout, r);
  }
  return [...porCheckout.values()];
}

export async function updateCheckoutConfirmacionLlegada(
  idCheckout: string,
  payload: CheckoutConfirmacionUpdate,
): Promise<checkoutBandaInterface> {
  return updateCheckout(idCheckout, payload);
}

export async function updateCheckoutIngreso(
  idCheckout: string,
  payload: CheckoutIngresoUpdate,
): Promise<checkoutBandaInterface> {
  return updateCheckout(idCheckout, payload);
}

export async function updateCheckoutConfirmacionIngreso(
  idCheckout: string,
  payload: CheckoutConfirmacionIngresoUpdate,
): Promise<checkoutBandaInterface> {
  return updateCheckout(idCheckout, payload);
}

export async function getHistorialCheckout(
  idEvento: string,
): Promise<CheckoutDetalleInterface[]> {
  const { data, error } = await dataBaseSupabase
    .from(vista)
    .select("*")
    .eq("id_foranea_evento", idEvento)
    .eq("confirmacion_horallegada", true)
    .eq("confirmacion_hora_ingreso", true)
    .order("hora_llegada_banda", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CheckoutDetalleInterface[];
}
