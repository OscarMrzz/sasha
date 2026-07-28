import type { perfilDatosAmpleosInterface, perfilInterface } from "@/models";

export const MENSAJE_USUARIO_ELIMINADO =
  "Tu cuenta ha sido eliminada y ya no puedes acceder a la plataforma.";

export type ResultadoValidacionAccesoPerfil =
  | "ok"
  | "usuario_eliminado"
  | "sin_permisos"
  | "rol_inactivo";

type PerfilConRol = Pick<perfilInterface, "estado" | "permisos" | "idForaneaRol"> & {
  roles?: perfilDatosAmpleosInterface["roles"] | null;
};

export function validarAccesoPerfil(perfil: PerfilConRol): ResultadoValidacionAccesoPerfil {
  if (perfil.estado !== "activo") {
    return "usuario_eliminado";
  }

  if (perfil.permisos === false) {
    return "sin_permisos";
  }

  if (!perfil.idForaneaRol || !perfil.roles || perfil.roles.estadoRol === false) {
    return "rol_inactivo";
  }

  return "ok";
}
