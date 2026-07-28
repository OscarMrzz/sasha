import { z } from "zod";

export const rubricaSchema = z.object({
  idRubrica: z.string(),
  created_at: z.string(),
  nombreRubrica: z.string().min(1),
  datalleRubrica: z.string(),
  puntosRubrica: z.number(),
  idForaneaCategoria: z.string().min(1),
  idForaneaFederacion: z.string().min(1),
  versionRubrica: z.string(),
});

export const rubricaInsertSchema = rubricaSchema.partial({
  idRubrica: true,
  created_at: true,
});
export const rubricaUpdateSchema = rubricaSchema.partial();

export type Rubrica = z.infer<typeof rubricaSchema>;
