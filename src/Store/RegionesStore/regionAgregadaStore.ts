/* Ultima region agregada (para E2E) */

import { create } from "zustand";

type UltimaRegion = { codigo: string };

interface StoreInterface {
  ultimaRegion: UltimaRegion | null;
  setUltimaRegion: (region: UltimaRegion) => void;
  quitarUltimaRegion: () => void;
}

export const useRegionAgregadaStore = create<StoreInterface>((set) => ({
  ultimaRegion: null,
  setUltimaRegion: (region) => set(() => ({ ultimaRegion: region })),
  quitarUltimaRegion: () => set(() => ({ ultimaRegion: null })),
}));

if (typeof window !== "undefined") {
  (window as any).useRegionAgregadaStore = useRegionAgregadaStore;
}

