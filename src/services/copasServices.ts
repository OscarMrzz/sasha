import { dataBaseSupabase } from "@/lib/supabase";
import {
  copaInterface,
  perfilDatosAmpleosInterface,
  vistaCopasEventosInterface,
  vistaCopasGlobalInterface,
} from "@/models";
import { obtenerCopasPorEventoAccion } from "@/actions/copasAcciones";
import {
  eventoPermiteEdicionCopas,
  MENSAJE_COPAS_EVENTO_BLOQUEADO,
} from "@/helpers/copas/eventoPermiteEdicionCopas";
import PerfilesServices from "./perfilesServices";
import { fromDbMany, toDb } from "@/services/mappers/caseMapper";

type CopaInsert = Omit<copaInterface, "id_copas" | "created_at">;
type CopaUpdate = Partial<Omit<copaInterface, "id_copas" | "created_at">>;

const tabla = "copas";
const elId = "id_copas";
/** Nombre de la vista en Supabase (coincide con `supabase/snippets/vista_copas_eventos.sql`). */
const vistaCopasEventos = "vista_copas_eventos";
/** Vista agregada global de copas (debe existir en la base con este nombre). */
const vistaCopasGlobal = "vista_copas_global";

export default class CopasServices {
  perfil: perfilDatosAmpleosInterface | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      void this.initPerfil();
    }
  }

  setPerfil(perfil: perfilDatosAmpleosInterface) {
    this.perfil = perfil;
  }

  async initPerfil() {
    if (typeof window === "undefined") return;

    const perfilCookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith("perfilActivo="));
    const perfilBruto = perfilCookie
      ? decodeURIComponent(perfilCookie.split("=")[1])
      : null;
    if (perfilBruto) {
      this.perfil = JSON.parse(perfilBruto) as perfilDatosAmpleosInterface;
    } else {
      const perfilServices = new PerfilesServices();
      this.perfil =
        (await perfilServices.getUsuarioLogiado()) as perfilDatosAmpleosInterface;
    }
  }

  private federacionId(): string {
    const id = this.perfil?.idForaneaFederacion;
    if (!id) throw new Error("No hay federaci?n en el perfil del usuario.");
    return id;
  }

  /** IDs de eventos pertenecientes a la federaci?n del perfil. */
  private async idsEventosFederacion(): Promise<string[]> {
    const fed = this.federacionId();
    const { data, error } = await dataBaseSupabase
      .from("registro_eventos")
      .select("id_evento")
      .eq("id_foranea_federacion", fed);
    if (error) throw error;
    return (data ?? []).map((row: { id_evento: string }) => row.id_evento);
  }

  /** IDs de bandas de la federaci?n del perfil. */
  private async idsBandasFederacion(): Promise<string[]> {
    const fed = this.federacionId();
    const { data, error } = await dataBaseSupabase
      .from("bandas")
      .select("id_banda")
      .eq("id_foranea_federacion", fed);
    if (error) throw error;
    return (data ?? []).map((row: { id_banda: string }) => row.id_banda);
  }

  private async assertEventoEnFederacion(idEvento: string): Promise<void> {
    const ids = await this.idsEventosFederacion();
    if (!ids.includes(idEvento)) {
      throw new Error("El evento no pertenece a la federaci?n del usuario.");
    }
  }

  /** Comprueba que el evento sea de la federaci?n del perfil activo (uso desde UI). */
  async validarEventoEnFederacion(idEvento: string): Promise<void> {
    await this.initPerfil();
    await this.assertEventoEnFederacion(idEvento);
  }

  private async assertBandaEnFederacion(idBanda: string): Promise<void> {
    const ids = await this.idsBandasFederacion();
    if (!ids.includes(idBanda)) {
      throw new Error("La banda no pertenece a la federaci?n del usuario.");
    }
  }

  private async assertEventoEditable(idEvento: string): Promise<void> {
    const { data, error } = await dataBaseSupabase
      .from("registro_eventos")
      .select("estado_evento")
      .eq("id_evento", idEvento)
      .single();

    if (error) throw error;
    if (!eventoPermiteEdicionCopas(data?.estado_evento)) {
      throw new Error(MENSAJE_COPAS_EVENTO_BLOQUEADO);
    }
  }

  /** Todas las copas cuyo evento est? en la federaci?n del perfil. */
  async get(): Promise<copaInterface[]> {
    const ids = await this.idsEventosFederacion();
    if (ids.length === 0) return [];

    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .select("*")
      .in("id_foranea_evento", ids)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as copaInterface[];
  }

  /** Copas de un evento concreto (validando federaci?n). */
  async getPorEvento(idEvento: string): Promise<copaInterface[]> {
    await this.assertEventoEnFederacion(idEvento);
    return obtenerCopasPorEventoAccion(idEvento);
  }

  async getOne(id: string): Promise<copaInterface> {
    const ids = await this.idsEventosFederacion();
    if (ids.length === 0) {
      throw new Error("No se encontr? la copa.");
    }

    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .select("*")
      .eq(elId, id)
      .in("id_foranea_evento", ids)
      .single();

    if (error) throw error;
    return data as copaInterface;
  }

  async create(dataCreate: CopaInsert): Promise<copaInterface> {
    await this.assertEventoEnFederacion(dataCreate.id_foranea_evento);
    await this.assertEventoEditable(dataCreate.id_foranea_evento);
    await this.assertBandaEnFederacion(dataCreate.id_foranea_banda);

    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .insert(toDb(dataCreate as unknown as Record<string, unknown>))
      .select("*")
      .single();

    if (error) throw error;
    return data as copaInterface;
  }

  async update(id: string, dataUpdate: CopaUpdate): Promise<copaInterface> {
    const existente = await this.getOne(id);
    const idEvento =
      dataUpdate.id_foranea_evento ?? existente.id_foranea_evento;
    await this.assertEventoEditable(idEvento);

    if (dataUpdate.id_foranea_evento !== undefined) {
      await this.assertEventoEnFederacion(dataUpdate.id_foranea_evento);
    }
    if (dataUpdate.id_foranea_banda !== undefined) {
      await this.assertBandaEnFederacion(dataUpdate.id_foranea_banda);
    }

    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .update(toDb(dataUpdate as unknown as Record<string, unknown>))
      .eq(elId, id)
      .select("*")
      .single();

    if (error) throw error;
    return data as copaInterface;
  }

  async delete(id: string): Promise<boolean> {
    const existente = await this.getOne(id);
    await this.assertEventoEditable(existente.id_foranea_evento);

    const { error } = await dataBaseSupabase.from(tabla).delete().eq(elId, id);

    if (error) throw error;
    return true;
  }

  /**
   * Filas de la vista enriquecida evento + banda (a?o actual / reglas del SQL de la vista).
   * Restringido a eventos de la federaci?n del perfil.
   */
  async getVistaCopasEventos(): Promise<vistaCopasEventosInterface[]> {
    const ids = await this.idsEventosFederacion();
    if (ids.length === 0) return [];

    const { data, error } = await dataBaseSupabase
      .from(vistaCopasEventos)
      .select("*")
      .in("id_foranea_evento", ids);

    if (error) throw error;
    return data as vistaCopasEventosInterface[];
  }

  /** Vista global agregada, limitada a bandas de la federaci?n del perfil. */
  async getVistaCopasGlobal(): Promise<vistaCopasGlobalInterface[]> {
    const bandaIds = await this.idsBandasFederacion();
    if (bandaIds.length === 0) return [];

    const { data, error } = await dataBaseSupabase
      .from(vistaCopasGlobal)
      .select("*")
      .in("id_banda", bandaIds);

    if (error) throw error;
    return fromDbMany<vistaCopasGlobalInterface>(data ?? []);
  }
}
