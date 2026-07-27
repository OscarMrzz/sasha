import { createSlice } from "@reduxjs/toolkit";
import { rubricaDatosAmpleosInterface, categoriaInterface, federacionInterface } from "../../interfaces/interfaces";

interface RubricaState {
  RubricaSeleccionada: rubricaDatosAmpleosInterface;
}

const initialState: RubricaState = {
  RubricaSeleccionada: {
    idRubrica: "",
    created_at: "",
    nombreRubrica: "",
    datalleRubrica: "",
    puntosRubrica: 0,
    idForaneaCategoria: "",
    idForaneaFederacion: "",
    versionRubrica: "",
    categorias: {
      idCategoria: "",
      created_at: "",
      nombreCategoria: "",
      detallesCategoria: "",
      idForaneaFederacion: ""
    } as categoriaInterface,
    federaciones: {
      idFederacion: "",
      created_at: "",
      nombreFederacion: ""
    } as federacionInterface
  }
};

const rubricaSlice = createSlice({
  name: "rubricaSlice",
  initialState,
  reducers: {
    setRubricaSeleccionada(state, action) {
      state.RubricaSeleccionada = action.payload;
    },
    recetiarRubricaSeleccionada(state) {
      state.RubricaSeleccionada = initialState.RubricaSeleccionada;
    }
  }
});

export const { setRubricaSeleccionada, recetiarRubricaSeleccionada } = rubricaSlice.actions;
export default rubricaSlice.reducer;