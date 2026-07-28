import { z } from "zod";

export const categoriaSchema = z.object({
  idCategoria: z.string(),
  created_at: z.string(),
  nombreCategoria: z.string().min(1),
  detallesCategoria: z.string(),
  idForaneaFederacion: z.string().min(1),
});

export const categoriaInsertSchema = categoriaSchema.partial({
  idCategoria: true,
  created_at: true,
});
export const categoriaUpdateSchema = categoriaSchema.partial();

export type Categoria = z.infer<typeof categoriaSchema>;
