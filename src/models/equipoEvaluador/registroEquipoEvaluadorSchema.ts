import { z } from "zod";

export const registroEquipoEvaluadorSchema = z.object({
  idRegistroEvaluador: z.string(),
  created_at: z.string(),
  idForaneaEvento: z.string().min(1),
  idForaneaPerfil: z.string().min(1),
  id_foranea_rubrica: z.string().nullable(),
});

export const registroEquipoEvaluadorInsertSchema = registroEquipoEvaluadorSchema.partial({
  idRegistroEvaluador: true,
  created_at: true,
});
export const registroEquipoEvaluadorUpdateSchema = registroEquipoEvaluadorSchema.partial();

export type RegistroEquipoEvaluador = z.infer<typeof registroEquipoEvaluadorSchema>;
