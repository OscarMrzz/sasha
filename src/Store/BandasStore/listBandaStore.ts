import {  bandaInterface} from '@/interfaces/interfaces';
import { create } from 'zustand';

interface storetInterface{
    listBandasStore: bandaInterface[];
    setBandasStore: (Bandas: bandaInterface[]) => void;
    recetiarBandasStore: () => void;
}

export const useBandasStore = create<storetInterface>((set) => ({
  listBandasStore: [],
  setBandasStore: (Bandas:bandaInterface[]) => set({ listBandasStore: Bandas }),
  recetiarBandasStore: () => set({ listBandasStore: []}),
}));

