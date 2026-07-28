import { createSlice } from "@reduxjs/toolkit";





const refrescadorData = createSlice({
  name: "RefrescadorData",
    initialState: {
     RefrescadorDataRubricas: false,
     RefrescadorDataCriterios: false,
     RefrescadorDataCumplimiento: false,
    },
  reducers: {
      /* -------------Rubricas ------------------ */
    activarRefrescarDataRubricas: (state) => {
      state.RefrescadorDataRubricas = true;
    }
    ,
    desactivarRefrescarDataRubricas: (state) => {
      state.RefrescadorDataRubricas= false;},

    /* -------------Criterios ------------------ */
    activarRefrescarDataCriterios: (state) => {
      state.RefrescadorDataCriterios = true;
    },
    desactivarRefrescarDataCriterios: (state) => {
      state.RefrescadorDataCriterios= false;},
    
  
    /* -------------Cumplimiento ------------------ */
    activarRefrescarDataCumplimiento: (state) => {
      state.RefrescadorDataCumplimiento = true;
    }
    ,
    desactivarRefrescarDataCumplimiento: (state) => {
      state.RefrescadorDataCumplimiento= false; 
    }

  }
});

export const {
  activarRefrescarDataRubricas, desactivarRefrescarDataRubricas
, activarRefrescarDataCriterios, desactivarRefrescarDataCriterios
, activarRefrescarDataCumplimiento, desactivarRefrescarDataCumplimiento
 } = refrescadorData .actions;
export default refrescadorData .reducer;