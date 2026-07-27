import {  RegistroEventoInterface } from '@/interfaces/interfaces';
import { create } from 'zustand';

interface storetInterface{
    listEventosStore: RegistroEventoInterface[];
    setEventosStore: (Eventos: RegistroEventoInterface[]) => void;
    recetiarEventosStore: () => void;
}

export const useEventosStore = create<storetInterface>((set) => ({
  listEventosStore: [],
  setEventosStore: (Eventos:RegistroEventoInterface[]) => set({ listEventosStore: Eventos }),
  recetiarEventosStore: () => set({ listEventosStore: []}),
}));

