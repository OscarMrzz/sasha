/* Ultimo usuario agregado */


import { perfilInterface } from '@/models';
import { create } from 'zustand';

interface storetInterface {
    ultimoUsuario: perfilInterface | null;
    setUltimoUsuario: (usuario: perfilInterface) => void;
    quitarUltimoUsuario: () => void;

}

export const useUsuarioAgregadoStore = create<storetInterface>((set) => ({
    ultimoUsuario: null,
    setUltimoUsuario: (usuario: perfilInterface) => set(() => ({ ultimoUsuario: usuario })),
    quitarUltimoUsuario: () => set(() => ({ ultimoUsuario: null }))
}));

if (typeof window !== 'undefined') {
    (window as any).useUsuarioAgregadoStore = useUsuarioAgregadoStore;
}
