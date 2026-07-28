import { z } from "zod";

export const perfilSchema = z.object({
  idPerfil: z.string(),
  created_at: z.string(),
  nombre: z.string().min(1),
  alias: z.string(),
  fechaNacimiento: z.string().nullable(),
  sexo: z.string(),
  idForaneaFederacion: z.string().nullable(),
  identidad: z.string(),
  numeroTelefono: z.string(),
  direccion: z.string(),
  idForaneaUser: z.string(),
  segundoNombre: z.string(),
  primerApellido: z.string(),
  segundoApellido: z.string(),
  idForaneaBanda: z.string().nullable(),
  permisos: z.boolean(),
  idForaneaRol: z.string().nullable(),
  urlFotoPerfil: z.string(),
  codigo: z.string(),
  estado: z.string(),
});

export const perfilInsertSchema = perfilSchema.partial({
  idPerfil: true,
  created_at: true,
});
export const perfilUpdateSchema = perfilSchema.partial();

export type Perfil = z.infer<typeof perfilSchema>;
