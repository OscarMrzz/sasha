import type { perfilDatosAmpleosInterface, rolInterface } from "@/interfaces/interfaces";

export const ROLES_PRIVILEGIADOS_USUARIOS = ["admin", "admin temporal", "developer"] as const;

/** Roles que gestionan usuarios de su federación con restricción de roles privilegiados. */
export const ROLES_GESTOR_USUARIOS_FEDERACION = [
  "responsable de usuarios",
  "secretaria",
] as const;

export const esGestorUsuariosFederacion = (nombreRol: string | null | undefined) => {
  const rolNormalizado = normalizarNombreRol(nombreRol);
  return ROLES_GESTOR_USUARIOS_FEDERACION.some(
    (rol) => normalizarNombreRol(rol) === rolNormalizado
  );
};

/** Roles de perfil que deben vincularse a una banda (`idForaneaBanda`). */
export const ROLES_CON_VINCULO_BANDA = [
  "dirigente",
  "lider de banda",
  "liderBanda",
  "director artistico",
  "directorArtistico",
] as const;

export const normalizarNombreRol = (nombreRol: string | null | undefined) =>
  (nombreRol ?? "").trim().toLowerCase();

export const rolRequiereVinculoBanda = (nombreRol: string | null | undefined) => {
  const rolNormalizado = normalizarNombreRol(nombreRol);
  return ROLES_CON_VINCULO_BANDA.some(
    (rol) => normalizarNombreRol(rol) === rolNormalizado
  );
};

export const esRolRestringido = (
  nombreRol: string | null | undefined,
  rolesExcluidos: readonly string[] = ROLES_PRIVILEGIADOS_USUARIOS
) => {
  const rolNormalizado = normalizarNombreRol(nombreRol);
  return rolesExcluidos.some((rol) => normalizarNombreRol(rol) === rolNormalizado);
};

export const filtrarRolesPermitidos = (
  roles: rolInterface[],
  rolesExcluidos: readonly string[] = ROLES_PRIVILEGIADOS_USUARIOS,
  soloActivos = true
) =>
  roles.filter((rol) => {
    if (soloActivos && rol.estadoRol === false) return false;
    return !esRolRestringido(rol.nombreRol, rolesExcluidos);
  });

export const filtrarPerfilesPermitidos = <T extends perfilDatosAmpleosInterface>(
  perfiles: T[],
  rolesExcluidos: readonly string[] = ROLES_PRIVILEGIADOS_USUARIOS
) => perfiles.filter((perfil) => !esRolRestringido(perfil.roles?.nombreRol, rolesExcluidos));
