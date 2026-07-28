export interface RegistroEventoInterface{
    idEvento: string; // Corregido: nombre de campo
    created_at: string;
    LugarEvento: string; // Mantenido con mayúscula como en DB
    fechaEvento: string;
    idForaneaRegion: string;
    idForaneaFederacion: string; 
    estado_evento: "pendiente" | "iniciado" | "finalizado" | "cancelado";
    tipo_evento: "festival" | "regional" | "nacional";
    dimensiones_cancha: string;
    tipo_lugar: "abierto" | "semiabierto" | "cerrado";
}
