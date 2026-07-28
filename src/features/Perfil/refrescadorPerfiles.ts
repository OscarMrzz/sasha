import { createSlice } from "@reduxjs/toolkit";





const refrescadorDataPerfiles = createSlice({
  name: "RefrescadorDataPerfiles",
    initialState: {
     RefrescadorDataPerfiles: false,
     
    },
  reducers: {
     
    activarRefrescarDataPerfiles: (state) => {
      state.RefrescadorDataPerfiles = true;
    }
    ,
    desactivarRefrescarDataPerfiles: (state) => {
      state.RefrescadorDataPerfiles= false;},


  }
});

export const {
    activarRefrescarDataPerfiles, desactivarRefrescarDataPerfiles
    
 } = refrescadorDataPerfiles .actions;
export default refrescadorDataPerfiles.reducer;