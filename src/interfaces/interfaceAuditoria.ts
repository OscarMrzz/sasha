/** Tipos para la bitácora de auditoría (solo lectura, rol developer). */

export type AuditoriaAccion =
  | "insert"
  | "update"
  | "delete"
  | "cancha_entrar"
  | "cancha_finalizar"
  | "cancha_reponer"
  | "cancha_cambio"
  | "acceso_bloquear"
  | "acceso_desbloquear"
  | (string & {});

export type AuditoriaMetadata = Record<string, unknown>;

export interface AuditoriaRow {
  id_auditoria: string;
  fecha: string;
  id_foranea_user: string | null;
  accion: AuditoriaAccion;
  tabla: string;
  id_registro: string | null;
  metadata: AuditoriaMetadata;
}

export interface MetadataCampoVisible {
  label: string;
  valor: string;
}

export interface AuditoriaDetalleEnriquecido {
  row: AuditoriaRow;
  nombreUsuario: string;
  preview: string;
  campos: MetadataCampoVisible[];
}

export interface AuditoriaFiltros {
  idForaneaUser?: string | null;
  textoUsuario?: string;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
  accion?: string | null;
  tabla?: string | null;
}

export interface AuditoriaPaginaResultado {
  rows: AuditoriaDetalleEnriquecido[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EventoEnCursoVista {
  idEvento: string;
  lugarEvento: string;
  fechaEvento: string;
  estadoEvento: string;
  tipoEvento: string | null;
  nombreRegion: string | null;
}

export interface BandaEnCanchaVista {
  idEvento: string;
  lugarEvento: string;
  idBanda: string;
  nombreBanda: string;
  idConfirmacion: string;
  quienPusoNombre: string;
  horaPuesta: string | null;
  accionOrigen: "cancha_entrar" | "cancha_reponer" | null;
}

export type ParticipacionEstado =
  | "en_cancha"
  | "finalizada"
  | "pendiente";

export interface ParticipacionBandaVista {
  idEvento: string;
  lugarEvento: string;
  idBanda: string;
  nombreBanda: string;
  estado: ParticipacionEstado;
  horaInicio: string | null;
  horaFin: string | null;
  /** Duración en milisegundos; null si aún no finalizó. */
  duracionMs: number | null;
  duracionTexto: string | null;
}

export interface HistorialParticipacionEvento {
  idEvento: string;
  lugarEvento: string;
  fechaEvento: string;
  participaciones: ParticipacionBandaVista[];
}

export interface AccesoCategoriaVista {
  idEvento: string;
  lugarEvento: string;
  idCategoria: string;
  nombreCategoria: string;
  horaBloqueo: string | null;
  horaDesbloqueo: string | null;
}

export interface DesbloqueoCategoriaCard {
  idEvento: string;
  lugarEvento: string;
  idCategoria: string;
  nombreCategoria: string;
  idUltimaBanda: string | null;
  nombreUltimaBanda: string | null;
  horaUltimaFinalizacion: string | null;
  horaDesbloqueo: string | null;
  duracionMs: number | null;
  duracionTexto: string | null;
  pendienteDesbloqueo: boolean;
}

export interface PerfilUsuarioFiltro {
  idForaneaUser: string;
  idPerfil: string;
  nombreCompleto: string;
}
