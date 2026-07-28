import { dataBaseSupabase } from "@/lib/supabase";
import { fromDbMany } from "@/services/mappers/caseMapper";

export type TipoAlertaEvaluacion = "cumplimiento_duplicado" | "rubrica_duplicada";

export interface AlertaEvaluacionInterface {
  tipo: TipoAlertaEvaluacion;
  clave_alerta: string;
  idForaneaBanda: string;
  idForaneaEvento: string;
  idForaneaCriterio: string | null;
  idForaneaRubrica: string | null;
  nombreBanda: string;
  nombreRubrica: string | null;
  nombreCriterio: string | null;
  LugarEvento: string | null;
  fechaEvento: string | null;
  cantidad_duplicados: number;
}

export default class AlertasEvaluacionServices {
  async obtenerAlertas(): Promise<AlertaEvaluacionInterface[]> {
    const { data, error } = await dataBaseSupabase.rpc("obtener_alertas_evaluacion_duplicada");

    if (error) throw error;
    return fromDbMany<AlertaEvaluacionInterface>(
      (data ?? []) as Record<string, unknown>[],
    );
  }

  async resolverCumplimientosDuplicados(): Promise<number> {
    const { data, error } = await dataBaseSupabase.rpc("resolver_evaluaciones_cumplimiento_duplicadas");

    if (error) throw error;
    return typeof data === "number" ? data : 0;
  }

  async resolverComentariosRubricaDuplicados(): Promise<number> {
    const { data, error } = await dataBaseSupabase.rpc("resolver_comentarios_rubrica_duplicados");

    if (error) throw error;
    return typeof data === "number" ? data : 0;
  }

  async resolverAlerta(tipo: TipoAlertaEvaluacion): Promise<number> {
    if (tipo === "cumplimiento_duplicado") {
      return this.resolverCumplimientosDuplicados();
    }
    return this.resolverComentariosRubricaDuplicados();
  }
}
