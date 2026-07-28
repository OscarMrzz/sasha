export interface checkoutBandaInterface {
    id_checkout: string;                        // uuid (Required)
    created_at_checkout: string | Date;         // timestamp with time zone (Required)
    id_foranea_banda?: string;                  // uuid
    hora_llegada_banda?: string | Date;         // timestamp without time zone
    confirmacion_horallegada?: boolean;         // boolean
    time_confirmacion_hora_llegada?: string;    // time without time zone (ej. "14:30:00")
    cantidad_integrantes?: number;              // numeric
    cantidad_palillonas?: number;               // numeric
    aportacion?: number;                        // numeric
    hora_ingreso?: string | Date;               // timestamp without time zone
    confirmacion_hora_ingreso?: boolean;        // boolean
    time_confirmacion_hora_ingreso?: string | Date; // timestamp without time zone
    observaciones?: string;                     // text
    time_envio_confirmacion_llegada?: string | Date; // timestamp without time zone
    time_envio_confirmacion_ingreso?: string | Date; // timestamp without time zone
    id_foranea_diciplina?: string;              // uuid
    id_foranea_confirmador?: string;  
    id_foranea_evento: string;         
  }
