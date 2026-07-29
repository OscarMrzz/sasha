import { dataBaseSupabase } from "@/lib/supabase";
import {
  registroEquipoEvaluadorDatosAmpleosInterface,
  registroEquipoEvaluadorInterface,
  perfilDatosAmpleosInterface,
} from "@/models";
import {
  registroEquipoEvaluadorInsertSchema,
  registroEquipoEvaluadorUpdateSchema,
} from "@/models/equipoEvaluador/registroEquipoEvaluadorSchema";
import { fromDb, toDb } from "@/services/mappers/caseMapper";
import { parseCamel } from "@/services/mappers/parseCamel";

type Interface = registroEquipoEvaluadorInterface;

const tabla = "registro_equipo_evaluador";
const elId = "id_registro_evaluador";
const RUBRICA_DUPLICADA_MSG = "Esta rúbrica ya está asignada a otro jurado en este evento.";

/**
 * El modelo de equipo evaluador mantiene `id_foranea_rubrica` en snake_case;
 * el mapper global lo convierte a camelCase, así que lo restauramos aquí.
 */
function mapEquipoEvaluadorRow<T>(row: Record<string, unknown>): T {
  const mapped = fromDb<Record<string, unknown>>(row);
  if ("idForaneaRubrica" in mapped) {
    mapped.id_foranea_rubrica = mapped.idForaneaRubrica ?? null;
    delete mapped.idForaneaRubrica;
  }
  return mapped as T;
}

function mapEquipoEvaluadorMany<T>(rows: Record<string, unknown>[]): T[] {
  return rows.map((row) => mapEquipoEvaluadorRow<T>(row));
}

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
      .eq("id_foranea_evento", idEvento)
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
                    registro_eventos(*),
                    perfiles(*, roles(*))
              
                `,
        )
        .eq("id_foranea_evento", idEvento);

      if (error) {
        console.error("❌ Error obteniendo regiones con equipoEvaluador:", error);
        throw error;
      }

      return mapEquipoEvaluadorMany<registroEquipoEvaluadorDatosAmpleosInterface>(data ?? []);
    } catch (error) {
      console.error("❌ Error general en getDatosAmpleos:", error);
      throw error;
    }
  }

  async get() {
    const { data, error } = await dataBaseSupabase.from(tabla).select("*");
    if (error) throw error;
    return mapEquipoEvaluadorMany<registroEquipoEvaluadorInterface>(data ?? []);
  }

  async getporPerfil(idUsuario: string) {
    const { data, error } = await dataBaseSupabase
      .from(tabla)
      .select(
        `
               *,
                     registro_eventos(*),
                     perfiles(*, roles(*))
            
            `,
      )
      .eq("id_foranea_perfil", idUsuario);
    if (error) throw error;

    return mapEquipoEvaluadorMany<registroEquipoEvaluadorDatosAmpleosInterface>(data ?? []);
  }

  async getOne(id: string) {
    const { data, error } = await dataBaseSupabase.from(tabla).select("*").eq(elId, id).single();

    if (error) throw error;
    return mapEquipoEvaluadorRow<registroEquipoEvaluadorInterface>(data);
  }

  async create(dataCreate: Interface) {
    if (dataCreate.id_foranea_rubrica) {
      await this.assertRubricaDisponibleEnEvento(
        dataCreate.idForaneaEvento,
        dataCreate.id_foranea_rubrica,
      );
    }

    try {
      const parsed = parseCamel(registroEquipoEvaluadorInsertSchema, dataCreate);
      const { data, error } = await dataBaseSupabase
        .from(tabla)
        .insert(toDb(parsed as Record<string, unknown>))
        .select("*")
        .single();

      if (error) this.throwIfRubricaDuplicada(error);
      return mapEquipoEvaluadorRow<registroEquipoEvaluadorInterface>(data);
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
      const parsed = parseCamel(registroEquipoEvaluadorUpdateSchema, dataUpdate);
      const { data, error } = await dataBaseSupabase
        .from(tabla)
        .update(toDb(parsed as Record<string, unknown>))
        .eq(elId, id)
        .select("*")
        .single();

      if (error) this.throwIfRubricaDuplicada(error);
      return mapEquipoEvaluadorRow<registroEquipoEvaluadorInterface>(data);
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
    const { error } = await dataBaseSupabase.from(tabla).delete().eq("id_foranea_evento", idEvento);

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
      return mapEquipoEvaluadorRow<registroEquipoEvaluadorInterface>(data);
    } catch (error) {
      this.throwIfRubricaDuplicada(error);
    }
  }
}
