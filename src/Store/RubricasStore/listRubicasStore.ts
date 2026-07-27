import {  rubricaInterface } from '@/interfaces/interfaces';
import { create } from 'zustand';

interface storetInterface{
    listRubicasStore: rubricaInterface[];
    setRubicasStore: (Rubicas: rubricaInterface[]) => void;
    recetiarRubicasStore: () => void;
}

export const useRubicasStore = create<storetInterface>((set) => ({
  listRubicasStore: [],
  setRubicasStore: (Rubicas:rubricaInterface[]) => set({ listRubicasStore: Rubicas }),
  recetiarRubicasStore: () => set({ listRubicasStore: []}),
}));

