import { regionesInterface } from '@/models';
import { create } from 'zustand';

interface regionStoretInterface{
    listRegionesStore: regionesInterface[];
    setRegionesStore: (regiones: regionesInterface[]) => void;
    recetiarRegionesStore: () => void;
}

export const useRegionesStore = create<
  regionStoretInterface
>((set) => ({
  listRegionesStore: [],
  setRegionesStore: (regiones: regionesInterface[]) => set({ listRegionesStore: regiones }),
  recetiarRegionesStore: () => set({ listRegionesStore: [] }),
}));

