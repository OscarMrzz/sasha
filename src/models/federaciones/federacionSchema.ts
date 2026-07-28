import { z } from "zod";

export const federacionSchema = z.object({
  idFederacion: z.string(),
  created_at: z.string(),
  nombreFederacion: z.string().min(1),
});

export const federacionInsertSchema = federacionSchema.partial({
  idFederacion: true,
  created_at: true,
});
export const federacionUpdateSchema = federacionSchema.partial();

export type Federacion = z.infer<typeof federacionSchema>;
