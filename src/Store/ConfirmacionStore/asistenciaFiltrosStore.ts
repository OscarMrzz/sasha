import { create } from "zustand";

interface AsistenciaFiltrosState {
  eventoSeleccionado: string;
  categoriaSeleccionada: string;
  bandaSeleccionada: string;
  setEvento: (v: string) => void;
  setCategoria: (v: string) => void;
  setBanda: (v: string) => void;
  resetFiltros: () => void;
}

export const useAsistenciaFiltrosStore = create<AsistenciaFiltrosState>((set) => ({
  eventoSeleccionado: "",
  categoriaSeleccionada: "",
  bandaSeleccionada: "",
  setEvento: (v) => set({ eventoSeleccionado: v, bandaSeleccionada: "" }),
  setCategoria: (v) => set({ categoriaSeleccionada: v }),
  setBanda: (v) => set({ bandaSeleccionada: v }),
  resetFiltros: () =>
    set({
      eventoSeleccionado: "",
      categoriaSeleccionada: "",
      bandaSeleccionada: "",
    }),
}));
