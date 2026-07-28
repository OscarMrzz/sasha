import { createSlice } from "@reduxjs/toolkit";

const overleResultadosSlice = createSlice({
  name: "overleResultados",
  initialState: false,

  reducers: {
    activarOverleyInformacionResultados: () => {return true;},
    desactivarOverleyInformacionResultados: () => {return false;},

  }

});

export const {
  activarOverleyInformacionResultados, desactivarOverleyInformacionResultados,



} = overleResultadosSlice.actions;

export default overleResultadosSlice.reducer;

