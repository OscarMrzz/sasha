import { dataBaseSupabase } from "../supabase";
import {
  registroEquipoEvaluadorDatosAmpleosInterface,
  registroEquipoEvaluadorInterface,
  perfilDatosAmpleosInterface,
} from "@/interfaces/interfaces";

type Interface = registroEquipoEvaluadorInterface;

const tabla = "registroEquipoEvaluador";
const elId = "idRegistroEvaluador";
const RUBRICA_DUPLICADA_MSG = "Esta rúbrica ya está asignada a otro jurado en este evento.";

export default class RegistroEquipoEvaluadorServices {
  perfil: perfilDatosAmpleosInterface | null = null;
  private perfilInitialized = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initPerfil();
    }
  }

  async initPerfil() {
    if (typeof window === "undefined") return;

    const perfilCookie = document.cookie.split(";").find((c) => c.trim().startsWith("perfilActivo="));
    const perfilBruto = perfilCookie ? decodeURIComponent(perfilCookie.split("=")[1]) : null;
    if (perfilBruto) {
      this.perfil = JSON.parse(perfilBruto) as perfilDatosAmpleosInterface;
    }
    this.perfilInitialized = true;
  }

  private throwIfRubricaDuplicada(error: unknown): never {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      throw new Error(RUBRICA_DUPLICADA_MSG);
    }
    throw error;
  }

  private async assertRubricaDisponibleEnEvento(
    idEvento: string,
    idRubrica: string,
    idRegistroExcluir?: string,
  ): Promise<void> {
    let query = dataBaseSupabase
      .from(tabla)
      .select(elId)
      .eq("idForaneaEvento", idEvento)
      .eq("id_foranea_rubrica", idRubrica);

    if (idRegistroExcluir) {
      query = query.neq(elId, idRegistroExcluir);
    }

    const { data, error } = await query.limit(1);
    if (error) throw error;
    if (data && data.length > 0) {
      throw new Error(RUBRICA_DUPLICADA_MSG);
    }
  }

  async getDatosAmpleos(idEvento: string): Promise<registroEquipoEvaluadorDatosAmpleosInterface[]> {
    try {
      const { data, error } = await dataBaseSupabase
        .from(tabla)
        .select(
          ` 
                    *,
                    registroEventos(*),
                    perfiles(*, roles(*))
              
                `,
        )
        .eq("idForaneaEvento", idEvento);

      if (error) {
        console.error("❌ Error obteniendo regiones con equipoEvaluador:", error);
        throw error;
      }

      return data as registroEquipoEvaluadorDatosAmpleosInterface[];
    } catch (error) {
      console.error("❌ Error general en getDatosAmpleos:", error);
      throw error;
    }
  }

  async get() {
    const { data, error } = await dataBaseSupabase.from(tabla).select("*");
    if (error) throw error;
    return data;
  }

  async getporPerfil(idUsuario: string) {
    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .select(
        `
               *,
                     registroEventos(*),
                     perfiles(*, roles(*))
            
            `,
      )
      .eq("idForaneaPerfil", idUsuario);
    if (error) throw error;

    return data as registroEquipoEvaluadorDatosAmpleosInterface[];
  }

  async getOne(id: string) {
    const { data, error } = await dataBaseSupabase.from(tabla).select("*").eq(elId, id).single();

    if (error) throw error;
    return data;
  }

  async create(dataCreate: Interface) {
    if (dataCreate.id_foranea_rubrica) {
      await this.assertRubricaDisponibleEnEvento(
        dataCreate.idForaneaEvento,
        dataCreate.id_foranea_rubrica,
      );
    }

    try {
      const { data, error } = await dataBaseSupabase
        .from(tabla)
        .insert(dataCreate)
        .select("*")
        .single();

      if (error) this.throwIfRubricaDuplicada(error);
      return data;
    } catch (error) {
      this.throwIfRubricaDuplicada(error);
    }
  }

  async update(id: string, dataUpdate: Interface) {
    if (dataUpdate.id_foranea_rubrica) {
      await this.assertRubricaDisponibleEnEvento(
        dataUpdate.idForaneaEvento,
        dataUpdate.id_foranea_rubrica,
        id,
      );
    }

    try {
      const { data, error } = await dataBaseSupabase
        .from(tabla)
        .update(dataUpdate)
        .eq(elId, id)
        .select("*")
        .single();

      if (error) this.throwIfRubricaDuplicada(error);
      return data;
    } catch (error) {
      this.throwIfRubricaDuplicada(error);
    }
  }

  async delete(id: string) {
    const { error } = await dataBaseSupabase.from(tabla).delete().eq(elId, id);

    if (error) throw error;
    return true;
  }

  async deletePorEvento(idEvento: string) {
    const { error } = await dataBaseSupabase.from(tabla).delete().eq("idForaneaEvento", idEvento);

    if (error) throw error;
    return true;
  }

  async updateRubrica(id: string, idRubrica: string): Promise<registroEquipoEvaluadorInterface> {
    const registro = (await this.getOne(id)) as registroEquipoEvaluadorInterface;
    await this.assertRubricaDisponibleEnEvento(registro.idForaneaEvento, idRubrica, id);

    try {
      const { data, error } = await dataBaseSupabase
        .from(tabla)
        .update({ id_foranea_rubrica: idRubrica })
        .eq(elId, id)
        .select("*")
        .single();

      if (error) this.throwIfRubricaDuplicada(error);
      return data as registroEquipoEvaluadorInterface;
    } catch (error) {
      this.throwIfRubricaDuplicada(error);
    }
  }
}
