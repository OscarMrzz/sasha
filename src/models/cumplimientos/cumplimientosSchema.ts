import { z } from "zod";

export const cumplimientosSchema = z.object({
  idCumplimiento: z.string(),
  created_at: z.string(),
  detalleCumplimiento: z.string().min(1),
  puntosCumplimiento: z.number(),
  idForaneaCriterio: z.string().min(1),
});

export const cumplimientosInsertSchema = cumplimientosSchema.partial({
  idCumplimiento: true,
  created_at: true,
});
export const cumplimientosUpdateSchema = cumplimientosSchema.partial();

export type Cumplimiento = z.infer<typeof cumplimientosSchema>;
