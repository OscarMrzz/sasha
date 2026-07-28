import { createSlice } from "@reduxjs/toolkit";
import {  perfilDatosAmpleosInterface} from "@/models";

interface PerfilState {
  perfilActivo: perfilDatosAmpleosInterface ;

  perfilSeleccionado: perfilDatosAmpleosInterface ;
}



const initialState: PerfilState = {
    perfilActivo: {
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
    idForaneaBanda: "",
    permisos: false,
    codigo: "",
    urlFotoPerfil: "",
    estado: "",
    roles: {
        idRol: "",
        created_at: "",
        nombreRol: "",
        idForaneaFederacion: "",
        estadoRol: false
    },
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
    }
  },

    perfilSeleccionado: {
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
    idForaneaBanda: "",
    permisos: false,
    codigo: "",
    urlFotoPerfil: "",
    estado: "",
    roles: {
        idRol: "",
        created_at: "",
        nombreRol: "",
        idForaneaFederacion: "",
        estadoRol: false
    },
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
    }
  }
};

const PerfilSlice = createSlice({
  name: "PerfilUsuarioActivo",
  initialState,
  reducers: {
    setPerfilActivo(state, action) {
      state.perfilActivo= action.payload;
    },
    recetiarPerfilActivo(state) {
      state.perfilActivo = initialState.perfilActivo;
    },

    setPerfilSeleccionado(state, action) {
      state.perfilSeleccionado= action.payload;
    }
    , recetiarPerfilSeleccionado(state) {
      state.perfilSeleccionado = initialState.perfilSeleccionado;
    }
  }
});

export const { 
    setPerfilActivo, recetiarPerfilActivo
    , setPerfilSeleccionado, recetiarPerfilSeleccionado

 } =  PerfilSlice.actions;
export default  PerfilSlice.reducer;
