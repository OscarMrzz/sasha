import { z } from "zod";

export const registroEventoSchema = z.object({
  idEvento: z.string(),
  created_at: z.string(),
  LugarEvento: z.string().min(1),
  fechaEvento: z.string().min(1),
  idForaneaRegion: z.string().min(1),
  idForaneaFederacion: z.string().min(1),
  estado_evento: z.enum(["pendiente", "iniciado", "finalizado", "cancelado"]),
  tipo_evento: z.enum(["festival", "regional", "nacional"]),
  dimensiones_cancha: z.string(),
  tipo_lugar: z.enum(["abierto", "semiabierto", "cerrado"]),
});

export const registroEventoInsertSchema = registroEventoSchema.partial({
  idEvento: true,
  created_at: true,
});
export const registroEventoUpdateSchema = registroEventoSchema.partial();

export type RegistroEvento = z.infer<typeof registroEventoSchema>;
