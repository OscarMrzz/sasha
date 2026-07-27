import { createSlice } from "@reduxjs/toolkit";

const overleyPerfileSlice = createSlice({
  name: "overleyPerfiles",
  initialState: {

    activadorOverleyInformacionPerfiles: false,
    activadorOverleyFormularioAgregarPerfiles: false,
    activadorOverleyFormularioEditarPerfiles: false,
    activadorOverleyFormularioCambiarPassword: false,
  },

  reducers: {
    activarOverleyInformacionPerfiles: (state) => {state.activadorOverleyInformacionPerfiles = true;},
    desactivarOverleyInformacionPerfiles: (state) => {state.activadorOverleyInformacionPerfiles = false;},

    activarOverleyFormularioAgregarPerfiles: (state) => {state.activadorOverleyFormularioAgregarPerfiles = true;},
    desactivarOverleyFormularioAgregarPerfiles: (state) => {state.activadorOverleyFormularioAgregarPerfiles = false;},

    activarOverleyFormularioEditarPerfiles: (state) => {state.activadorOverleyFormularioEditarPerfiles = true;},
    desactivarOverleyFormularioEditarPerfiles: (state) => {state.activadorOverleyFormularioEditarPerfiles = false;},

    activarOverleyFormularioCambiarPassword: (state) => {state.activadorOverleyFormularioCambiarPassword = true;},
    desactivarOverleyFormularioCambiarPassword: (state) => {state.activadorOverleyFormularioCambiarPassword = false;},

  }

});

export const {
  activarOverleyInformacionPerfiles, desactivarOverleyInformacionPerfiles,

  activarOverleyFormularioAgregarPerfiles, desactivarOverleyFormularioAgregarPerfiles,

  activarOverleyFormularioEditarPerfiles, desactivarOverleyFormularioEditarPerfiles
  
  , activarOverleyFormularioCambiarPassword, desactivarOverleyFormularioCambiarPassword

} = overleyPerfileSlice.actions;

export default overleyPerfileSlice.reducer;

