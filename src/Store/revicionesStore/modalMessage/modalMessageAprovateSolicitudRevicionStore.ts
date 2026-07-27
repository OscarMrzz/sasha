
import { create } from 'zustand';




interface modalMessageAprovateSolicitudRevicionStoreInterface{
    activadorModalSolicitudRevicionesMessage: boolean;
    activarOverleyCriteriosFormularioSolicitudRevisarMessage: () => void;
    desactivarOverleyCriteriosFormularioSolicitudRevisarMessage: () => void;
}


export const useModalMessageAprovateSolicitudRevicionStore = create<modalMessageAprovateSolicitudRevicionStoreInterface>((set) => ({
    activadorModalSolicitudRevicionesMessage: false,
    activarOverleyCriteriosFormularioSolicitudRevisarMessage: () => set({ activadorModalSolicitudRevicionesMessage: true }),
    desactivarOverleyCriteriosFormularioSolicitudRevisarMessage: () => set({ activadorModalSolicitudRevicionesMessage: false }),
}));
