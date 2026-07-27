import { createSlice } from "@reduxjs/toolkit";
import { criterioEvaluacionDatosAmpleosInterface, cumplimientosDatosAmpleosInterface, rubricaInterface } from "../../interfaces/interfaces";

interface CumplimientoState {
  CumplimientoSeleccionado: cumplimientosDatosAmpleosInterface;
}

const initialState: CumplimientoState = {
  CumplimientoSeleccionado: {
    idCumplimiento: "",
    created_at: "",
    detalleCumplimiento: "",
    puntosCumplimiento: 0,
    idForaneaCriterio: "",
    idCriterio: "",
    nombreCriterio: "",
    detallesCriterio: "",
    puntosCriterio: 0,
    idForaneaRubrica: "",
    idForaneaFederacion: "",
  }
};

const CumplimientoSlice = createSlice({
  name: "CumplimientoSlice",
  initialState,
  reducers: {
    setCumplimientoSeleccionado(state, action) {
      state.CumplimientoSeleccionado = action.payload;
    },
    recetiarCumplimientoSeleccionado(state) {
      state.CumplimientoSeleccionado = initialState.CumplimientoSeleccionado;
    }
  }
});

export const { 
    setCumplimientoSeleccionado,
    recetiarCumplimientoSeleccionado
 } = CumplimientoSlice.actions;
export default CumplimientoSlice.reducer;