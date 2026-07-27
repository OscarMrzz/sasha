
import { create } from 'zustand';

interface storetInterface {
    haySesionStore: boolean;
    perfilToken: number;
    iniciarSesionStore: () => void;
    cerrarSesionStore: () => void;
    refrescarPerfil: () => void;
}

export const useInicioSesionStore = create<storetInterface>((set) => ({
    haySesionStore: false,
    perfilToken: 0,
    iniciarSesionStore: () => set(() => ({ haySesionStore: true })),
    cerrarSesionStore: () => set(() => ({ haySesionStore: false })),
    refrescarPerfil: () => set((state) => ({ perfilToken: state.perfilToken + 1 })),
}));
