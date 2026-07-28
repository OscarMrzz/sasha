import type { perfilDatosAmpleosInterface } from "@/models";

/** Minimal active profile with federation for service initPerfil / guards. */
export const perfilFixture: perfilDatosAmpleosInterface = {
  idPerfil: "perfil-1",
  idForaneaUser: "user-1",
  idForaneaFederacion: "fed-1",
  idForaneaRol: "rol-1",
  idForaneaBanda: null,
  nombre: "Test User",
  correo: "test@example.com",
  estado: true,
  permisos: true,
  foto: null,
  roles: {
    idRol: "rol-1",
    nombreRol: "administrador",
    estadoRol: true,
    DetallesRol: null,
    idForaneaFederacion: "fed-1",
  },
  federaciones: {
    idFederacion: "fed-1",
    nombreFederacion: "Fed Test",
  },
} as perfilDatosAmpleosInterface;

export function assignPerfil<T extends { perfil: unknown }>(
  service: T,
  perfil: perfilDatosAmpleosInterface | null = perfilFixture
): T {
  service.perfil = perfil;
  return service;
}
