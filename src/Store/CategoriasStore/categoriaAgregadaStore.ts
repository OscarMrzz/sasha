/* Ultima categoria agregada (para E2E) */

import { create } from "zustand";

type UltimaCategoria = { codigo: string };

interface StoreInterface {
  ultimaCategoria: UltimaCategoria | null;
  setUltimaCategoria: (categoria: UltimaCategoria) => void;
  quitarUltimaCategoria: () => void;
}

export const useCategoriaAgregadaStore = create<StoreInterface>((set) => ({
  ultimaCategoria: null,
  setUltimaCategoria: (categoria) => set(() => ({ ultimaCategoria: categoria })),
  quitarUltimaCategoria: () => set(() => ({ ultimaCategoria: null })),
}));

if (typeof window !== "undefined") {
  (window as any).useCategoriaAgregadaStore = useCategoriaAgregadaStore;
}

