import { createSlice } from "@reduxjs/toolkit";




const overleySlice = createSlice({
  name: "overley",
  initialState: {
    /* -----------------Rubrica------------------------ */
     activadorOverleyInformacionRubrica: false,
    activarOverleyFormularioAgregarRubrica: false,
    activadorOverleyFormularioEditarRubrica: false,
 
    /*-------------------- Criterio --------------------- */
    activadorOverleyInformacionCriterio: false,
    activadorOverleyFormularioAgregarCriterios: false,
    activadorOverleyFormularioEditarCriterios: false,

    /* -----------------Cumplimiento --------------------- */
    activadorOverleyInformacionCumplimiento: false,
    activadorOverleyFormularioAgregarCumplimiento: false,
    activadorOverleyFormularioEditarCumplimiento: false,
    
   
    
  },
  
    reducers: {
      /* --------------------01 rubrica----------------------------- */
  

    activarOverleyInformacionRubrica: (state) => {
      state.activadorOverleyInformacionRubrica = true;
    },
    desactivarOverleyInformacionRubrica: (state) => {
      state.activadorOverleyInformacionRubrica = false;
    },
    activarOverleyFormularioAgregarRubrica: (state) => {
      state.activarOverleyFormularioAgregarRubrica = true;
    },
    desactivarOverleyFormularioAgregarRubrica: (state) => {
      state.activarOverleyFormularioAgregarRubrica = false;
    },
    activarOverleyFormularioEditarRubrica: (state) => {
      state.activadorOverleyFormularioEditarRubrica = true;
    },
    desactivarOverleyFormularioEditarRubrica: (state) => {
      state.activadorOverleyFormularioEditarRubrica = false;
    },
      /* --------------------02 criterios----------------------------- */
      activarOverleyInformacionCriterio: (state) => {
      state.activadorOverleyInformacionCriterio = true;
    },
    desactivarOverleyInformacionCriterio: (state) => {
      state.activadorOverleyInformacionCriterio = false;  
    },


    activarOverleyCriteriosFormularioAgregar: (state) => {
      state.activadorOverleyFormularioAgregarCriterios = true;
    },
    desactivarOverleyCriteriosFormularioAgregar: (state) => {
      state.activadorOverleyFormularioAgregarCriterios = false;
    },

    activarOverleyFormularioEditarCriterio: (state) => {
      state.activadorOverleyFormularioEditarCriterios = true;
    },
    desactivarOverleyFormularioEditarCriterio: (state) => {
      state.activadorOverleyFormularioEditarCriterios = false;
    },

    /* ------------------- 03 Cumplimientos----------------- */
    activarOverleyInformacionCumplimiento: (state) => {
      state.activadorOverleyInformacionCumplimiento = true;
    },
    desactivarOverleyInformacionCumplimiento: (state) => {
      state.activadorOverleyInformacionCumplimiento = false;  
    },
    activarOverleyCumplimientoFormularioAgregar: (state) => {
      state.activadorOverleyFormularioAgregarCumplimiento = true;
    },
    desactivarOverleyCumplimientoFormularioAgregar: (state) => {
      state.activadorOverleyFormularioAgregarCumplimiento = false;
    },
    activarOverleyFormularioEditarCumplimiento: (state) => {
      state.activadorOverleyFormularioEditarCumplimiento = true;
    },
    desactivarOverleyFormularioEditarCumplimiento: (state) => {
      state.activadorOverleyFormularioEditarCumplimiento = false;
    },

  }

});


export const { 
   activarOverleyCriteriosFormularioAgregar,
    desactivarOverleyCriteriosFormularioAgregar,
    activarOverleyInformacionRubrica,
    desactivarOverleyInformacionRubrica,
    activarOverleyFormularioEditarRubrica,
    desactivarOverleyFormularioEditarRubrica,
    activarOverleyFormularioAgregarRubrica,
    desactivarOverleyFormularioAgregarRubrica,
    activarOverleyInformacionCriterio,
    desactivarOverleyInformacionCriterio,
    activarOverleyFormularioEditarCriterio,
    desactivarOverleyFormularioEditarCriterio,
    activarOverleyInformacionCumplimiento,
    desactivarOverleyInformacionCumplimiento,
    activarOverleyCumplimientoFormularioAgregar,
    desactivarOverleyCumplimientoFormularioAgregar,
    activarOverleyFormularioEditarCumplimiento,
    desactivarOverleyFormularioEditarCumplimiento
    

   } = overleySlice.actions;

export default overleySlice.reducer;
 
