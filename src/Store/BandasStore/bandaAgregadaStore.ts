/* Ultima banda agregada (para E2E) */

import { create } from "zustand";

type UltimaBanda = { codigo: string };

interface StoreInterface {
  ultimaBanda: UltimaBanda | null;
  setUltimaBanda: (banda: UltimaBanda) => void;
  quitarUltimaBanda: () => void;
}

export const useBandaAgregadaStore = create<StoreInterface>((set) => ({
  ultimaBanda: null,
  setUltimaBanda: (banda) => set(() => ({ ultimaBanda: banda })),
  quitarUltimaBanda: () => set(() => ({ ultimaBanda: null })),
}));

if (typeof window !== "undefined") {
  (window as any).useBandaAgregadaStore = useBandaAgregadaStore;
}

