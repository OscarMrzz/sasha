import { dataBaseSupabase } from "../supabase";
import BandasServices from "./bandasServices";
import {
  bandaInterface,
  confirmacionAsistenciaEstadoUpdate,
  confirmacionAsistenciaInsert,
  confirmacionAsistenciaInterface,
  confirmacionConBandaInterface,
  vistaBandasConfirmadasParaEventoInterface,
} from "@/interfaces/interfaces";

const tabla = "confirmacion_asistencia";

export default class ConfirmacionAsistenciaServices {
  private async rowPorBandaEvento(
    idBanda: string,
    idEvento: string,
  ): Promise<confirmacionAsistenciaInterface | null> {
    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .select("*")
      .eq("id_foranea_banda", idBanda)
      .eq("id_foranea_evento", idEvento)
      .maybeSingle();

    if (error) throw error;
    return data as confirmacionAsistenciaInterface | null;
  }

  /** Una confirmación concreta: banda + evento */
  async getConfirmacion(
    idBanda: string,
    idEvento: string,
  ): Promise<confirmacionAsistenciaInterface | null> {
    if (!idBanda?.trim() || !idEvento?.trim()) {
      throw new Error("idBanda e idEvento son obligatorios.");
    }
    return this.rowPorBandaEvento(idBanda, idEvento);
  }

  /** Confirmaciones con asistencia positiva para un evento (participaron) */
  async getConfirmacionesPorEvento(
    idEvento: string,
  ): Promise<confirmacionAsistenciaInterface[]> {
    if (!idEvento?.trim()) {
      throw new Error("idEvento es obligatorio.");
    }
    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .select("*")
      .eq("id_foranea_evento", idEvento)
      .eq("estado_asistencia", true)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as confirmacionAsistenciaInterface[];
  }

  /**
   * Bandas con asistencia confirmada para el evento (`confirmacion_asistencia`).
   * Excluye solo filas con `estado_asistencia === false` (incluye true y null).
   *
   * Resuelve filas de `bandas` vía la misma fuente que el panel (`BandasServices.get()`):
   * federación del perfil activo. Una query directa `.from("bandas").in(...)` suele devolver
   * vacío con las políticas RLS actuales.
   *
   * @param todasBandasFederacion opcional: resultado de un único `BandasServices.get()` para no repetir llamadas.
   */
  async getBandasConfirmadasParaEvento(
    idEvento: string,
    todasBandasFederacion?: bandaInterface[],
  ): Promise<bandaInterface[]> {
    if (!idEvento?.trim()) {
      throw new Error("idEvento es obligatorio.");
    }

    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .select("id_foranea_banda, estado_asistencia")
      .eq("id_foranea_evento", idEvento);

    if (error) throw error;

    const ids = [
      ...new Set(
        (data ?? [])
          .filter(
            (row: { estado_asistencia: boolean | null }) => row.estado_asistencia !== false,
          )
          .map((row: { id_foranea_banda: string | null }) => row.id_foranea_banda)
          .filter((id): id is string => Boolean(id?.trim())),
      ),
    ];

    if (ids.length === 0) return [];

    let todas = todasBandasFederacion;
    if (!todas) {
      const bandasSvc = new BandasServices();
      await bandasSvc.initPerfil();
      todas = (await bandasSvc.get()) as bandaInterface[];
    }

    const idSet = new Set(ids);
    const out = todas.filter((b) => idSet.has(b.idBanda));
    out.sort((a, b) =>
      (a.nombreBanda || "").localeCompare(b.nombreBanda || "", "es", { sensitivity: "base" }),
    );
    return out;
  }

  /** Todas las confirmaciones de una banda */
  async getAllConfirmaciones(
    idBanda: string,
  ): Promise<confirmacionAsistenciaInterface[]> {
    if (!idBanda?.trim()) {
      throw new Error("idBanda es obligatorio.");
    }
    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .select("*")
      .eq("id_foranea_banda", idBanda)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? []) as confirmacionAsistenciaInterface[];
  }

  /**
   * Marca asistencia en true. Si no hay registro, lo crea.
   * Si ya está en true, no hace nada. Si está en false, lo pasa a true.
   */
  async confirmacionAsistencia(
    idBanda: string,
    idEvento: string,
  ): Promise<confirmacionAsistenciaInterface> {
    if (!idBanda?.trim() || !idEvento?.trim()) {
      throw new Error("idBanda e idEvento son obligatorios.");
    }

    const actual = await this.rowPorBandaEvento(idBanda, idEvento);
    if (!actual) {
      const insertRow: confirmacionAsistenciaInsert = {
        id_foranea_banda: idBanda,
        id_foranea_evento: idEvento,
        estado_asistencia: true,
      };
      const { data, error } = await dataBaseSupabase
        .from(tabla)
        .insert(insertRow)
        .select("*")
        .single();
      if (error) throw error;
      return data as confirmacionAsistenciaInterface;
    }

    if (actual.estado_asistencia === true) {
      return actual;
    }

    const cambioEstado: confirmacionAsistenciaEstadoUpdate = {
      estado_asistencia: true,
    };
    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .update(cambioEstado)
      .eq("id_confirmacion_asistencia", actual.id_confirmacion_asistencia)
      .select("*")
      .single();
    if (error) throw error;
    return data as confirmacionAsistenciaInterface;
  }

  /**
   * Marca asistencia en false. Si no hay registro, lo crea.
   * Si ya está en false, no hace nada. Si está en true, lo pasa a false.
   */
  async denegarAsistencia(
    idBanda: string,
    idEvento: string,
  ): Promise<confirmacionAsistenciaInterface> {
    if (!idBanda?.trim() || !idEvento?.trim()) {
      throw new Error("idBanda e idEvento son obligatorios.");
    }

    const actual = await this.rowPorBandaEvento(idBanda, idEvento);
    if (!actual) {
      const insertRow: confirmacionAsistenciaInsert = {
        id_foranea_banda: idBanda,
        id_foranea_evento: idEvento,
        estado_asistencia: false,
      };
      const { data, error } = await dataBaseSupabase
        .from(tabla)
        .insert(insertRow)
        .select("*")
        .single();
      if (error) throw error;
      return data as confirmacionAsistenciaInterface;
    }

    if (actual.estado_asistencia === false) {
      return actual;
    }

    const cambioEstado: confirmacionAsistenciaEstadoUpdate = {
      estado_asistencia: false,
    };
    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .update(cambioEstado)
      .eq("id_confirmacion_asistencia", actual.id_confirmacion_asistencia)
      .select("*")
      .single();
    if (error) throw error;
    return data as confirmacionAsistenciaInterface;
  }

  async getBandasConfirmadasByEvento(idEvento: string): Promise<vistaBandasConfirmadasParaEventoInterface[]> {
    if (!idEvento?.trim()) {
      throw new Error("idEvento es obligatorio.");
    }
    const { data, error } = await dataBaseSupabase
      .from("vista_bandas_confirmadas")
      .select("*")
      .eq("id_foranea_evento", idEvento);
    if (error) throw error;
    return (data ?? []) as vistaBandasConfirmadasParaEventoInterface[];
  }

  async marcarParticipacion(
    idConfirmacion: string,
    estadoCancha: confirmacionAsistenciaInterface["estado_cancha"],
  ): Promise<confirmacionAsistenciaInterface> {
    if (!idConfirmacion?.trim()) {
      throw new Error("idConfirmacion es obligatorio.");
    }
    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .update({ estado_cancha: estadoCancha })
      .eq("id_confirmacion_asistencia", idConfirmacion)
      .select("*")
      .single();
    if (error) throw error;
    return data as confirmacionAsistenciaInterface;
  }

  async getConfirmacionesConBandaParaEvento(
    idEvento: string,
  ): Promise<confirmacionConBandaInterface[]> {
    if (!idEvento?.trim()) {
      throw new Error("idEvento es obligatorio.");
    }

    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .select(`
        *,
        bandas(
          *,
          categorias(*)
        )
      `)
      .eq("id_foranea_evento", idEvento)
      .eq("estado_asistencia", true)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row: Record<string, unknown>) => {
      const banda = row.bandas as Record<string, unknown> | null;
      const categoria = banda?.categorias as Record<string, unknown> | null;
      return {
        id_confirmacion_asistencia: row.id_confirmacion_asistencia as string,
        created_at: row.created_at as string,
        id_foranea_evento: row.id_foranea_evento as string,
        id_foranea_banda: row.id_foranea_banda as string,
        estado_asistencia: row.estado_asistencia as boolean,
        estado_cancha:
          (row.estado_cancha as confirmacionAsistenciaInterface["estado_cancha"]) ?? "pendiente",
        nombreBanda: (banda?.nombreBanda as string) ?? "—",
        AliasBanda: (banda?.AliasBanda as string | null) ?? null,
        urlLogoBanda: (banda?.urlLogoBanda as string | null) ?? null,
        idForaneaCategoria: (banda?.idForaneaCategoria as string) ?? "",
        nombreCategoria: (categoria?.nombreCategoria as string) ?? "—",
      } satisfies confirmacionConBandaInterface;
    });
  }
}
