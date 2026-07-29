
import { create } from 'zustand';




interface modalSolicitudRevicionesStoreInterface{
    activadorModalSolicitudReviciones: boolean;
    activarOverleyCriteriosFormularioSolicitudRevisar: () => void;
    desactivarOverleyCriteriosFormularioSolicitudRevisar: () => void;
}


export const useModalSolicitudRevicionesStore = create<modalSolicitudRevicionesStoreInterface>((set) => ({
    activadorModalSolicitudReviciones: false,
    activarOverleyCriteriosFormularioSolicitudRevisar: () => set({ activadorModalSolicitudReviciones: true }),
    desactivarOverleyCriteriosFormularioSolicitudRevisar: () => set({ activadorModalSolicitudReviciones: false }),
}));
