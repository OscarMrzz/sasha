import { createSlice } from "@reduxjs/toolkit";

const overleyEventosSlice = createSlice({
  name: "overleyEventos",
  initialState: {

    activadorOverleyInformacionEventos: false,
    activadorOverleyFormularioAgregarEventos: false,
    activadorOverleyFormularioEditarEventos: false,
  },

  reducers: {
    activarOverleyInformacionEventos: (state) => {state.activadorOverleyInformacionEventos = true;},
    desactivarOverleyInformacionEventos: (state) => {state.activadorOverleyInformacionEventos = false;},

    activarOverleyFormularioAgregarEventos: (state) => {state.activadorOverleyFormularioAgregarEventos = true;},
    desactivarOverleyFormularioAgregarEventos: (state) => {state.activadorOverleyFormularioAgregarEventos = false;},

    activarOverleyFormularioEditarEventos: (state) => {state.activadorOverleyFormularioEditarEventos = true;},
    desactivarOverleyFormularioEditarEventos: (state) => {state.activadorOverleyFormularioEditarEventos = false;},

  }

});

export const {
  activarOverleyInformacionEventos, desactivarOverleyInformacionEventos,

  activarOverleyFormularioAgregarEventos, desactivarOverleyFormularioAgregarEventos,

  activarOverleyFormularioEditarEventos, desactivarOverleyFormularioEditarEventos





} = overleyEventosSlice.actions;

export default overleyEventosSlice.reducer;

