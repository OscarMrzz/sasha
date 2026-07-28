import { z } from "zod";

export const bandaSchema = z.object({
  idBanda: z.string(),
  created_at: z.string(),
  nombreBanda: z.string().min(1),
  AliasBanda: z.string(),
  idForaneaCategoria: z.string().min(1),
  idForaneaRegion: z.string().min(1),
  idForaneaFederacion: z.string().min(1),
  ciudadBanda: z.string(),
  urlLogoBanda: z.string(),
  fechaFundacionBanda: z.string().nullable(),
  fechaInscripcionAFederacion: z.string().nullable(),
  ubicacionSedeBanda: z.string(),
});

export const bandaInsertSchema = bandaSchema.partial({ idBanda: true, created_at: true });
export const bandaUpdateSchema = bandaSchema.partial();

export type Banda = z.infer<typeof bandaSchema>;
