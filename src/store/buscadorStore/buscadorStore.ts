import {  bandaInterface} from '@/models';
import { create } from 'zustand';

interface buscadorInterface{
    buscador: boolean
    abrirBuscador: () => void;
    cerrarBuscador: () => void;
}

export const buscadorStore = create<buscadorInterface>((set) => ({
    buscador: false,
    abrirBuscador: () => set({ buscador: true }),
    cerrarBuscador: () => set({ buscador: false }),
}));

