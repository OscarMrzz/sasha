import { z } from "zod";

export const regionesSchema = z.object({
  idRegion: z.string(),
  created_at: z.string(),
  nombreRegion: z.string().min(1),
  idForaneaFederacion: z.string().min(1),
});

export const regionesInsertSchema = regionesSchema.partial({
  idRegion: true,
  created_at: true,
});
export const regionesUpdateSchema = regionesSchema.partial();

export type Region = z.infer<typeof regionesSchema>;
