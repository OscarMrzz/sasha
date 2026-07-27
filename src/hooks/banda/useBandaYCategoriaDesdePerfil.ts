"use client";

import type {
  bandaInterface,
  categoriaInterface,
  perfilDatosAmpleosInterface,
} from "@/interfaces/interfaces";
import BandasServices from "@/lib/services/bandasServices";
import CategoriasServices from "@/lib/services/categoriaServices";
import { useQuery } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { useEffect } from "react";

type SetBanda = Dispatch<SetStateAction<bandaInterface | undefined>>;
type SetCategoria = Dispatch<SetStateAction<categoriaInterface | undefined>>;

/**
 * Carga banda y categoría asociadas al `idForaneaBanda` del perfil y las refleja en el estado local.
 * No está atado a Mi Banda: sirve para cualquier pantalla que reciba ese perfil.
 */
export function useBandaYCategoriaDesdePerfil(
  perfil: perfilDatosAmpleosInterface,
  setBandaSeleccionada: SetBanda,
  setcategoriaSelecionada: SetCategoria,
  isPerfilPending: boolean
) {
  const idBandaPerfil = perfil.idForaneaBanda;

  const { data: bandaPrecarga } = useQuery({
    queryKey: ["banda", "porId", idBandaPerfil],
    queryFn: async () => {
      try {
        return await new BandasServices().getOne(idBandaPerfil!);
      } catch (error) {
        console.error("❌ Error trayendo la banda del perfil:", error);
        return undefined;
      }
    },
    enabled: Boolean(idBandaPerfil) && !isPerfilPending,
    staleTime: 120_000,
    retry: 1,
  });

  const idCategoriaBanda = bandaPrecarga?.idForaneaCategoria;

  const { data: categoriaPrecarga } = useQuery({
    queryKey: ["categoria", "porId", idCategoriaBanda],
    queryFn: async () => {
      try {
        return await new CategoriasServices().getOne(idCategoriaBanda!);
      } catch (error) {
        console.error("❌ Error trayendo la categoría de la banda:", error);
        return undefined;
      }
    },
    enabled: Boolean(idCategoriaBanda),
    staleTime: 120_000,
    retry: 1,
  });

  useEffect(() => {
    if (bandaPrecarga) setBandaSeleccionada(bandaPrecarga);
  }, [bandaPrecarga, setBandaSeleccionada]);

  useEffect(() => {
    if (categoriaPrecarga) setcategoriaSelecionada(categoriaPrecarga);
  }, [categoriaPrecarga, setcategoriaSelecionada]);
}
