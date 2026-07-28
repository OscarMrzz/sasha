import { z } from "zod";

export const rolSchema = z.object({
  idRol: z.string(),
  created_at: z.string(),
  idForaneaFederacion: z.string().min(1),
  nombreRol: z.string().min(1),
  estadoRol: z.boolean(),
});

export const rolInsertSchema = rolSchema.partial({ idRol: true, created_at: true });
export const rolUpdateSchema = rolSchema.partial();

export type Rol = z.infer<typeof rolSchema>;
