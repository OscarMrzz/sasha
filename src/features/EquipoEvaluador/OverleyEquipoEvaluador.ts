import { createSlice } from "@reduxjs/toolkit";

const overleyRegistroEquipoEvaluadorlice = createSlice({
  name: "overleyRegistroEquipoEvaluador",
  initialState: {

    activadorOverleyInformacionRegistroEquipoEvaluador: false,
    activadorOverleyFormularioAgregarRegistroEquipoEvaluador: false,
    activadorOverleyFormularioEditarRegistroEquipoEvaluador: false,
    
  },

  reducers: {
    activarOverleyInformacionRegistroEquipoEvaluador: (state) => {state.activadorOverleyInformacionRegistroEquipoEvaluador = true;},
    desactivarOverleyInformacionRegistroEquipoEvaluador: (state) => {state.activadorOverleyInformacionRegistroEquipoEvaluador = false;},

    activarOverleyFormularioAgregarRegistroEquipoEvaluador: (state) => {state.activadorOverleyFormularioAgregarRegistroEquipoEvaluador = true;},
    desactivarOverleyFormularioAgregarRegistroEquipoEvaluador: (state) => {state.activadorOverleyFormularioAgregarRegistroEquipoEvaluador = false;},

    activarOverleyFormularioEditarRegistroEquipoEvaluador: (state) => {state.activadorOverleyFormularioEditarRegistroEquipoEvaluador = true;},
    desactivarOverleyFormularioEditarRegistroEquipoEvaluador: (state) => {state.activadorOverleyFormularioEditarRegistroEquipoEvaluador = false;},



  }

});

export const {
  activarOverleyInformacionRegistroEquipoEvaluador, desactivarOverleyInformacionRegistroEquipoEvaluador,

  activarOverleyFormularioAgregarRegistroEquipoEvaluador, desactivarOverleyFormularioAgregarRegistroEquipoEvaluador,

  activarOverleyFormularioEditarRegistroEquipoEvaluador, desactivarOverleyFormularioEditarRegistroEquipoEvaluador
  


} = overleyRegistroEquipoEvaluadorlice.actions;

export default overleyRegistroEquipoEvaluadorlice.reducer;

