import { z } from "zod";

export const solicitudRevicionSchema = z.object({
  idSolicitud: z.string(),
  created_at: z.string(),
  idForaneaRegistroCumplimiento: z.string().min(1),
  idForaneaFederacion: z.string().min(1),
  idForaneaSolicitanteRevicion: z.string().min(1),
  detallesSolicitud: z.string(),
  estado: z.string(),
});

export const solicitudRevicionInsertSchema = solicitudRevicionSchema.partial({
  idSolicitud: true,
  created_at: true,
});
export const solicitudRevicionUpdateSchema = solicitudRevicionSchema.partial();

export type SolicitudRevicion = z.infer<typeof solicitudRevicionSchema>;
