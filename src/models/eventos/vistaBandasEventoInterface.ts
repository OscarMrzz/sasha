export interface vistaBandasEventoInterface {
    id_confirmacion_asistencia: string; // uuid
    estado_asistencia: boolean;          // boolean
    estado_cancha: string;              // text
    idEvento: string;                   // uuid
    LugarEvento: string;                // text
    estado_evento: string;              // text
    idBanda: string;                    // uuid
    nombreBanda: string;                // text
    AliasBanda: string;                 // text
    idCategoria: string;                // uuid
    nombreCategoria: string;
    id_foranea_rubrica : string;
    idForaneaPerfil: string;           // text
  }
