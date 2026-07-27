import { createSlice } from "@reduxjs/toolkit";
import { criterioEvaluacionDatosAmpleosInterface, rubricaInterface } from "../../interfaces/interfaces";

interface CriteriosState {
  CriterioSeleccionado: criterioEvaluacionDatosAmpleosInterface;
}

const initialState: CriteriosState = {
  CriterioSeleccionado: {
    idCriterio: "",
    created_at: "",
    nombreCriterio: "",
    detallesCriterio: "",
    puntosCriterio: 0,
    idForaneaRubrica: "",
    rubricas: {
 
      idRubrica: "",
      nombreRubrica: "",
        datalleRubrica: "",
        puntosRubrica: 0,
        created_at: "",
        idForaneaCategoria: "",
        idForaneaFederacion: ""

    } as rubricaInterface
  }
};

const CriterioSlice = createSlice({
  name: "criterioSlice",
  initialState,
  reducers: {
    setCriterioSeleccionado(state, action) {
      state.CriterioSeleccionado = action.payload;
    },
    recetiarCriterioSeleccionado(state) {
      state.CriterioSeleccionado = initialState.CriterioSeleccionado;
    }
  }
});

export const { 
    setCriterioSeleccionado,
    recetiarCriterioSeleccionado
 } = CriterioSlice.actions;
export default CriterioSlice.reducer;