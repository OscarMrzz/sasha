import { z } from "zod";

export const criterioEvaluacionSchema = z.object({
  idCriterio: z.string(),
  created_at: z.string(),
  nombreCriterio: z.string().min(1),
  detallesCriterio: z.string(),
  puntosCriterio: z.number(),
  idForaneaRubrica: z.string().min(1),
});

export const criterioEvaluacionInsertSchema = criterioEvaluacionSchema.partial({
  idCriterio: true,
  created_at: true,
});
export const criterioEvaluacionUpdateSchema = criterioEvaluacionSchema.partial();

export type CriterioEvaluacion = z.infer<typeof criterioEvaluacionSchema>;
