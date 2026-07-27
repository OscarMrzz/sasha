import { createSlice } from "@reduxjs/toolkit";





const refrescadorDataEventos = createSlice({
  name: "RefrescadorDataEventos",
    initialState: {
     RefrescadorDataEventos: false,
     
    },
  reducers: {
     
    activarRefrescarDataEventos: (state) => {
      state.RefrescadorDataEventos = true;
    }
    ,
    desactivarRefrescarDataEventos: (state) => {
      state.RefrescadorDataEventos= false;},


  }
});

export const {
    activarRefrescarDataEventos, desactivarRefrescarDataEventos

 } = refrescadorDataEventos .actions;
export default refrescadorDataEventos.reducer;