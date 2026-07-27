import { createSlice } from "@reduxjs/toolkit";
import { criterioEvaluacionDatosAmpleosInterface, cumplimientosDatosAmpleosInterface, rubricaInterface } from "../../interfaces/interfaces";

interface filaResultadoItem {
  idBanda: string;
  idEvento: string;
}

const initialState: filaResultadoItem = {

    idBanda: "",
    idEvento: "",
  
};

const resultadosGeneralesSlice = createSlice({
  name: "filaResultado",
  initialState,
  reducers: {
    setfilaResultadoItemSeleccionado(state, action: { payload: { idBanda: string; idEvento: string } }) {
      return action.payload;
    },
    recetiarfilaResultadoItemSeleccionado() {
      return initialState;
    }
  }
});

export const { 
    setfilaResultadoItemSeleccionado,
    recetiarfilaResultadoItemSeleccionado
 } = resultadosGeneralesSlice.actions;
export default resultadosGeneralesSlice.reducer;