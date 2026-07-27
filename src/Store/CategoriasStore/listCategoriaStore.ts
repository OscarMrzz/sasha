import {  categoriaInterface } from '@/interfaces/interfaces';
import { create } from 'zustand';

interface storetInterface{
    listCategoriasStore: categoriaInterface[];
    setCategoriasStore: (Categorias: categoriaInterface[]) => void;
    recetiarCategoriasStore: () => void;
}

export const useCategoriasStore = create<storetInterface>((set) => ({
  listCategoriasStore: [],
  setCategoriasStore: (Categorias:categoriaInterface[]) => set({ listCategoriasStore: Categorias }),
  recetiarCategoriasStore: () => set({ listCategoriasStore: []}),
}));

