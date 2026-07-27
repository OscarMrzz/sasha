
import { create } from 'zustand';




interface ModalInformacionSolicitudRevicionesStoreInterface{
    activadorModalInformacionSolicitudReviciones: boolean;
    activarModalInformacionSolicitudRevisar: () => void;
    desactivarModalInformacionSolicitudRevisar: () => void;
}


export const useModalInformacionSolicitudRevicionesStore = create<ModalInformacionSolicitudRevicionesStoreInterface>((set) => ({
    activadorModalInformacionSolicitudReviciones: false,
    activarModalInformacionSolicitudRevisar: () => set({ activadorModalInformacionSolicitudReviciones: true }),
    desactivarModalInformacionSolicitudRevisar: () => set({ activadorModalInformacionSolicitudReviciones: false }),
}));
