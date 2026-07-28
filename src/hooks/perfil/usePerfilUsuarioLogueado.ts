"use client";

import type { perfilDatosAmpleosInterface } from "@/models";
import PerfilesServices from "@/services/perfilesServices";
import { useQuery } from "@tanstack/react-query";

/** Perfil del usuario autenticado (servicio getUsuarioLogiado). Reutilizable fuera de Mi Banda. */
export function usePerfilUsuarioLogueado() {
  const { data: perfil = {} as perfilDatosAmpleosInterface, isPending } =
    useQuery({
      queryKey: ["perfil", "usuarioLogueado"],
      queryFn: async () => {
        try {
          const perfilesServices = new PerfilesServices();
          return await perfilesServices.getUsuarioLogiado();
        } catch (error) {
          console.error(
            "❌ Error trayendo la informacion del usuario logeado:",
            error
          );
          return {} as perfilDatosAmpleosInterface;
        }
      },
      staleTime: 60_000,
    });

  return { perfil, isPerfilPending: isPending };
}
