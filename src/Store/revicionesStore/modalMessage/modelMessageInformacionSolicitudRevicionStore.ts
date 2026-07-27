
import { create } from 'zustand';




interface modelMessageInformacionSolicitudRevicionStoreInterface{
    activadorModalInformacionSolicitudRevicionesMessage: boolean;
    activarOverleyCriteriosFormularioSolicitudRevisarMessage: () => void;
    desactivarOverleyCriteriosFormularioSolicitudRevisarMessage: () => void;
}


export const usemodelMessageInformacionSolicitudRevicionStore = create<modelMessageInformacionSolicitudRevicionStoreInterface>((set) => ({
    activadorModalInformacionSolicitudRevicionesMessage: false,
    activarOverleyCriteriosFormularioSolicitudRevisarMessage: () => set({ activadorModalInformacionSolicitudRevicionesMessage: true }),
    desactivarOverleyCriteriosFormularioSolicitudRevisarMessage: () => set({ activadorModalInformacionSolicitudRevicionesMessage: false }),
}));
