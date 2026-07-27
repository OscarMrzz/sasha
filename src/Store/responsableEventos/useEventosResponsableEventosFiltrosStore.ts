import { create } from "zustand";

const anioActual = () => new Date().getFullYear().toString();

interface EventosResponsableEventosFiltrosState {
  regionSelecionada: string;
  anioSeleccionado: string;
  fechaSeleccionada: string;
  searchText: string;
  setRegion: (v: string) => void;
  setAnio: (v: string) => void;
  setMes: (v: string) => void;
  setSearch: (v: string) => void;
  resetFiltros: () => void;
}

export const useEventosResponsableEventosFiltrosStore = create<EventosResponsableEventosFiltrosState>((set) => ({
  regionSelecionada: "",
  anioSeleccionado: anioActual(),
  fechaSeleccionada: "",
  searchText: "",
  setRegion: (v) => set({ regionSelecionada: v }),
  setAnio: (v) => set({ anioSeleccionado: v }),
  setMes: (v) => set({ fechaSeleccionada: v }),
  setSearch: (v) => set({ searchText: v }),
  resetFiltros: () =>
    set({
      regionSelecionada: "",
      anioSeleccionado: anioActual(),
      fechaSeleccionada: "",
      searchText: "",
    }),
}));
