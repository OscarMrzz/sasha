import { createSlice } from "@reduxjs/toolkit";
import {   registroEquipoEvaluadorDatosAmpleosInterface } from "../../interfaces/interfaces";

interface equipoEvaluadorsState {
  registrosEquipoEvaliadorSeleccionado : registroEquipoEvaluadorDatosAmpleosInterface;
}

const initialState: equipoEvaluadorsState= {
 registrosEquipoEvaliadorSeleccionado : {
    idRegistroEvaluador: "",
    created_at: "",
    idForaneaEvento: "",
    idForaneaPerfil: "",
    id_foranea_rubrica: "",
 
    registroEventos: {
        idEvento: "",
        created_at: "",
        LugarEvento: "",
        fechaEvento: "",
        idForaneaRegion: "",
        idForaneaFederacion: "",
        estado_evento: "pendiente",
        tipo_evento: "regional",
        dimensiones_cancha: "",
        tipo_lugar: "abierto",
  },
    perfiles: {
        idPerfil: "",
        created_at: "",
        nombre: "",
        alias: "",
        fechaNacimiento: "",
        idForaneaRol: "",
        sexo: "",
        idForaneaFederacion: "",
        identidad: "",
        numeroTelefono: "",
        direccion: "",
        idForaneaUser: "",
        segundoNombre: "",
        primerApellido: "",
        segundoApellido: "",
        idForaneaBanda: null,
        permisos: false,
        urlFotoPerfil: "",
        codigo: "",
        estado: "",
        federaciones: {
            idFederacion: "",
            created_at: "",
            nombreFederacion: ""
        },
        bandas: {
            idBanda: "",
            created_at: "",
            nombreBanda: "",
            AliasBanda: "",
            idForaneaCategoria: "",
            idForaneaRegion: "",
            idForaneaFederacion: "",
            ciudadBanda: "",
            urlLogoBanda: "",
            fechaFundacionBanda: null,
            fechaInscripcionAFederacion: null,
            ubicacionSedeBanda: ""
        },
        roles: {
            idRol: "",
            created_at: "",
            nombreRol: "",
            idForaneaFederacion: "",
            estadoRol: false
        }
         
        


    }
    } 
};



const registrosEquipoEvaliadorSlice= createSlice({
  name: "RegistrosEquipoEvaliadorSlice",
  initialState,
  reducers: {
    setregistrosEquipoEvaliadorSeleccionado(state, action) {
      state.registrosEquipoEvaliadorSeleccionado = action.payload;
    },
    recetiarregistrosEquipoEvaliadorSeleccionado(state) {
      state.registrosEquipoEvaliadorSeleccionado = initialState.registrosEquipoEvaliadorSeleccionado;
    }
  }
});

export const { 
    setregistrosEquipoEvaliadorSeleccionado,
    recetiarregistrosEquipoEvaliadorSeleccionado
 } = registrosEquipoEvaliadorSlice.actions;
export default registrosEquipoEvaliadorSlice.reducer;
