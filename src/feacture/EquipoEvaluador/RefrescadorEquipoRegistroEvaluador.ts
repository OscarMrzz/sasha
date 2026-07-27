import { createSlice } from "@reduxjs/toolkit";





const refrescadorDataRegistroEquipoEvaluador = createSlice({
  name: "RefrescadorDataRegistroEquipoEvaluador",
    initialState: {
     RefrescadorDataRegistroEquipoEvaluador: false,

    },
  reducers: {
      /* -------------DataRegistroEquipoEvaluador ------------------ */
    activarRefrescarDataRegistroEquipoEvaluador: (state) => {
      state.RefrescadorDataRegistroEquipoEvaluador = true;
    }
    ,
    desactivarRefrescarDataRegistroEquipoEvaluador: (state) => {
      state.RefrescadorDataRegistroEquipoEvaluador= false;},



  }
});

export const {

activarRefrescarDataRegistroEquipoEvaluador, desactivarRefrescarDataRegistroEquipoEvaluador

 } = refrescadorDataRegistroEquipoEvaluador.actions;
export default refrescadorDataRegistroEquipoEvaluador .reducer;