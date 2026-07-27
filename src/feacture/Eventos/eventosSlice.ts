import { createSlice } from "@reduxjs/toolkit";
import {  registroEventoDatosAmpleosInterface} from "../../interfaces/interfaces";

interface EventosState {
  EventoSeleccionado: registroEventoDatosAmpleosInterface;
}

const initialState: EventosState = {
    EventoSeleccionado: {
    idEvento: "",
    created_at: "",
    LugarEvento: "",
    fechaEvento: "",
    idForaneaFederacion: "",
    idForaneaRegion: "",
    estado_evento: "pendiente",
    tipo_evento: "regional",
    dimensiones_cancha: "",
    tipo_lugar: "abierto",
    federaciones: {
        idFederacion: "",
        created_at: "",
        nombreFederacion: ""
    },
    regiones: {
        idRegion: "",
        created_at: "",
        nombreRegion: "",
        idForaneaFederacion: ""
    }
  }
};

const EventoSlice = createSlice({
  name: "EventoSlice",
  initialState,
  reducers: {
    setEventoSelecionado(state, action) {
      state.EventoSeleccionado = action.payload;
    },
    recetiarEventosSeleccionado(state) {
      state.EventoSeleccionado = initialState.EventoSeleccionado;
    }
  }
});

export const { 
    setEventoSelecionado, recetiarEventosSeleccionado

 } = EventoSlice.actions;
export default EventoSlice.reducer;