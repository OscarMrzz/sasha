import { create } from 'zustand';



export interface baseSolicitudRevicionInterface{
    idRegistroCumplimiento: string;
    nombreBanda: string;
    nombreRubrica: string;
    nombreCriterio: string;
    nombreCumplimiento: string;
    puntosObtenidos: number;
}
export const  useSolicitudRevicionStore = create<{
    solicitudRevicion: baseSolicitudRevicionInterface | null;
    setSolicitudRevicion: (solicitudRevicion: baseSolicitudRevicionInterface | null) => void;
}>((set) => ({
    solicitudRevicion: null,
    setSolicitudRevicion: (solicitudRevicion: baseSolicitudRevicionInterface | null) => set({ solicitudRevicion }),
}));
