import { z } from "zod";

export const registroComentariosSchema = z.object({
  idRegistroComentario: z.string(),
  created_at: z.string(),
  idForaneaEvento: z.string().min(1),
  idForaneaBanda: z.string().min(1),
  idForaneaCategoria: z.string().min(1),
  idForaneaRegion: z.string().min(1),
  idForaneaPerfil: z.string().min(1),
  comentario: z.string(),
  idForaneaRubrica: z.string().min(1),
  idForaneaFederacion: z.string().min(1),
});

export const registroComentariosInsertSchema = registroComentariosSchema.partial({
  idRegistroComentario: true,
  created_at: true,
});
export const registroComentariosUpdateSchema = registroComentariosSchema.partial();

export type RegistroComentarios = z.infer<typeof registroComentariosSchema>;
