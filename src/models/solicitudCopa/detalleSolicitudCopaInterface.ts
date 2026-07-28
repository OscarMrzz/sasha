export interface detalleSolicitudCopaInterface {
  
    id_solicitud_copa?: string | null; // uuid
    created_at_solicitud_copa?: Date | string | null; // timestamp with time zone
    justificacion_solicitud_copa?: string | null; // text
    lugar_solicitud_copas?: number | null; // numeric
    tipo_solicitud_copa?: string | null; // text
    estado?: boolean | null; // boolean
    idEvento?: string | null; // uuid
    LugarEvento?: string | null; // text
    estado_evento?: string | null; // text (¡Nuevo campo!)
    fechaEvento?: Date | string | null; // date (¡Nuevo campo!)
    idBanda?: string | null; // uuid
    nombreBanda?: string | null; // text
    idCategoria?: string | null; // uuid
    nombreCategoria?: string | null; // text
    idRegion?: string | null; // uuid
    nombreRegion?: string | null; // text
    id_foranea_solicitante?: string | null; // uuid
    nombre_solicitante?: string | null; // text
    apelli_solicitante?: string | null; // text
  }
