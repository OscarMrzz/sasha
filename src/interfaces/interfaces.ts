//-----------BANDAS------------
export interface bandaInterface{
    idBanda: string;
    created_at: string;
    nombreBanda: string;
    AliasBanda: string; // Corregido: era aliasBanda
    idForaneaCategoria: string;
    idForaneaRegion: string;
    idForaneaFederacion: string;
    ciudadBanda: string;
    urlLogoBanda: string;
    fechaFundacionBanda: string | null;
    fechaInscripcionAFederacion: string | null;
    ubicacionSedeBanda: string;

}
export interface bandaDatosAmpleosInterface extends bandaInterface{
    federaciones: federacionInterface;
    categorias: categoriaInterface;
    regiones: regionesInterface;
}

//-----------CATEGORIAS------------
export interface categoriaInterface{
    idCategoria: string;
    created_at: string;
    nombreCategoria: string;
    detallesCategoria: string;
    idForaneaFederacion: string;
}
export interface categoriaDatosAmpleosInterface extends categoriaInterface {
    federaciones: federacionInterface;
}


//-----------ROLES------------
export interface rolInterface {
    idRol: string; // uuid
    created_at: string; // timestamp with time zone
    idForaneaFederacion: string; // uuid
    nombreRol: string; // text
    estadoRol: boolean;
}
//-----------CRITERIOS------------
export interface criterioEvaluacionInterface{
    idCriterio: string;
    created_at: string;
    nombreCriterio: string;
    detallesCriterio: string;
    puntosCriterio: number;
    idForaneaRubrica: string;
}
export interface vista_criterio_idForaneaCategoriaInterface{
    idCriterio: string;
    created_at: string;
    nombreCriterio: string;
    detallesCriterio: string;
    puntosCriterio: number;
    idForaneaRubrica: string;
    idForaneaCategoria: string;
}
export interface criterioEvaluacionDatosAmpleosInterface extends criterioEvaluacionInterface {
    rubricas: rubricaInterface;
}

//-----------CUMPLIMIENTOS------------
export interface cumplimientosInterface{
    idCumplimiento: string;
    created_at: string;
    detalleCumplimiento: string; // Corregido: era dateCumplimiento
    puntosCumplimiento: number;
    idForaneaCriterio: string;
}
export interface cumplimientosDatosAmpleosInterface extends cumplimientosInterface {
 idCumplimiento: string;
  created_at: string;
  detalleCumplimiento: string;
  puntosCumplimiento: number;
  idForaneaCriterio: string;
  idCriterio: string;
  nombreCriterio: string;
  detallesCriterio: string;
  puntosCriterio: number;
  idForaneaRubrica: string;
  idForaneaFederacion: string;
}

//-----------FEDERACIONES------------
export interface federacionInterface{
    idFederacion: string;
    created_at: string;
    nombreFederacion: string;
}
// No necesita DatosAmpleos

//-----------PENALIZACIONES------------
export interface penalizacionesInterface{
    idPenalizacion: string;
    created_at: string;
    idForaneaFederacion: string;
    idForaneaCategoria: string;
    nombrePenalizacion: string;
    detallesPenalizacion: string;
    puntosPenalizacion: number;
}
export interface penalizacionesDatosAmpleosInterface extends penalizacionesInterface {
    federaciones: federacionInterface;
    categorias: categoriaInterface;
}

//-----------PERFIL------------
export interface perfilInterface{
    idPerfil: string;
    created_at: string;
    nombre: string;
    alias: string;
    fechaNacimiento: string | null;
 
    
    sexo: string;
    idForaneaFederacion: string | null;
    identidad: string;
    numeroTelefono: string;
    direccion: string;
    idForaneaUser: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
    idForaneaBanda: string | null;
    permisos: boolean;
    idForaneaRol: string | null;
    urlFotoPerfil: string;
    codigo: string;
    estado: string;
}
export interface perfilDatosAmpleosInterface extends perfilInterface {
    federaciones: federacionInterface;
    bandas: bandaInterface | null;
    roles: rolInterface | null;
  
}


//-----------REGIONES------------
export interface regionesInterface{
    idRegion: string;
    created_at: string;
    nombreRegion: string;
    idForaneaFederacion: string;
}
export interface regionesDatosAmpleosInterface extends regionesInterface {
    federaciones: federacionInterface;
}

//-----------REGISTRO CUMPLIMIENTO EVALUACION------------
export interface registroCumplimientoEvaluacionInterface{
    idRegistroCumplimientoEvaluacion: string;
    created_at: string;
    idForaneaEvento: string;
    idForaneaBanda: string;
    idForaneaCriterio: string;
    idForaneaCumplimiento: string;
    idForaneaCategoria: string;
    idForaneaRegion: string;
    puntosObtenidos: number;
    idForaneaPerfil: string;
    idForaneaFederacion: string;
    idForaneaRubrica: string;
}
export interface registroCumplimientoEvaluacionDatosAmpleosInterface extends registroCumplimientoEvaluacionInterface {
    registroEventos: RegistroEventoInterface; // Corregido: nombre de tabla
    bandas: bandaInterface;
    criteriosEvalucion: criterioEvaluacionInterface; // Corregido: nombre de tabla
    cumplimientos: cumplimientosInterface;
    categorias: categoriaInterface;
    regiones: regionesInterface;
    perfiles: perfilInterface;
    federaciones: federacionInterface;
    rubricas: rubricaInterface;
}

//-----------REGISTRO EQUIPO EVALUADOR------------
export interface registroEquipoEvaluadorInterface{ // Corregido: nombre de interface
    idRegistroEvaluador: string; // Corregido: nombre de campo
    created_at: string;
    idForaneaEvento: string;
    idForaneaPerfil: string;
    id_foranea_rubrica: string | null;
  
}
export interface registroEquipoEvaluadorDatosAmpleosInterface extends registroEquipoEvaluadorInterface {

    registroEventos: RegistroEventoInterface;
    perfiles: perfilDatosAmpleosInterface;

}
//-----------REGISTRO EVENTO------------
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
export interface registroEventoDatosAmpleosInterface extends RegistroEventoInterface {
    regiones: regionesInterface;
    federaciones: federacionInterface;
}

//-----------REGISTRO PENALIZACION------------
export interface registroPenalizacionInterface{
    idRegistroPenalizacion: string;
    created_at: string;
    idForaneaFederacion: string;
    idForaneaEvento: string;
    idForaneaCategoria: string;
    idForaneaBanda: string;
    idForaneaUser: string;
    idForaneaPenalizacion: string;
    puntosPenalizacion: number;
}
export interface registroPenalizacionDatosAmpleosInterface extends registroPenalizacionInterface {
    federaciones: federacionInterface;
    registroEventos: RegistroEventoInterface; // Corregido: nombre de tabla
    categorias: categoriaInterface;
    bandas: bandaInterface;
    penalizaciones: penalizacionesInterface;
}

//-----------REGISTRO COMENTARIOS------------
export interface registroComentariosInterface{
    idRegistroComentario: string;
    created_at: string;
    idForaneaEvento: string;
    idForaneaBanda: string;
  
    idForaneaCategoria: string;
    idForaneaRegion: string;
    idForaneaPerfil: string;
    comentario: string;
    idForaneaRubrica: string;
    idForaneaFederacion: string;
}
export interface registroComentariosDatosAmpleosInterface extends registroComentariosInterface {
    registroEventos: RegistroEventoInterface; // Corregido: nombre de tabla
    bandas: bandaInterface;
    criteriosEvalucion: criterioEvaluacionInterface; // Corregido: nombre de tabla
    categorias: categoriaInterface;
    regiones: regionesInterface;
    perfiles: perfilInterface;
    rubricas: rubricaInterface;
    federaciones: federacionInterface;
}

//-----------ROL------------


//-----------ROL EQUIPO EVALUADOR------------
export interface rolEquipoEvaluadorInterface{
    idRol: string;
    created_at: string;
    idForaneaFederacion: string;
    nombreRol: string;
    DetallesRol: string; // Mantenido con mayúscula como en DB
}
export interface rolEquipoEvaluadorDatosAmpleosInterface extends rolEquipoEvaluadorInterface {
    federaciones: federacionInterface;
}

//-----------RUBRICA------------
export interface rubricaInterface{
    idRubrica: string;
    created_at: string;
    nombreRubrica: string;
    datalleRubrica: string; // Mantenido el typo como en DB (debería ser detalleRubrica)
    puntosRubrica: number;
    idForaneaCategoria: string;
    idForaneaFederacion: string;
    versionRubrica: string;
}
export interface rubricaDatosAmpleosInterface extends rubricaInterface {
    categorias: categoriaInterface;
    federaciones: federacionInterface;
}

export interface criterioEvaluacionConCumplimientosInterface
  extends criterioEvaluacionInterface {
  cumplimientos: cumplimientosInterface[] | null;
}

export interface rubricaConsultaCompletaInterface
  extends rubricaDatosAmpleosInterface {
  criteriosEvalucion: criterioEvaluacionConCumplimientosInterface[] | null;
}

//-----------PAQUETE JENNIE (importación de rúbricas)------------
/** Cumplimiento dentro de un archivo .jennie / .jennie.json */
export interface jennieCumplimientoPaqueteInterface {
  idCumplimiento: string;
  created_at: string;
  detalleCumplimiento: string;
  puntosCumplimiento: number;
  idForaneaCriterio: string;
}

/** Criterio con cumplimientos anidados en un paquete Jennie */
export interface jennieCriterioPaqueteInterface {
  idCriterio: string;
  created_at: string;
  nombreCriterio: string;
  detallesCriterio: string;
  puntosCriterio: number;
  idForaneaRubrica: string;
  cumplimientos: jennieCumplimientoPaqueteInterface[];
}

/** Rúbrica en paquete Jennie; idForaneaCategoria es el nombre de categoría, no UUID */
export interface jennieRubricaPaqueteInterface {
  idRubrica: string;
  created_at: string;
  nombreRubrica: string;
  datalleRubrica: string;
  puntosRubrica: number;
  idForaneaCategoria: string;
  idForaneaFederacion: string;
  versionRubrica: string;
}

/** Raíz de un archivo de paquete Jennie */
export interface jenniePaqueteInterface {
  schemaVersion: number;
  id: string;
  guardadoEn: string;
  rubrica: jennieRubricaPaqueteInterface;
  criterios: jennieCriterioPaqueteInterface[];
}

export interface resultadosGeneralesInterface{
    banda: bandaInterface;
    evento: RegistroEventoInterface;
    categoria: categoriaInterface;
    region: regionesInterface;
    totalPuntos: number;
}


export interface solicitudRevicionInterface {
  idSolicitud: string;
  created_at: string;
  idForaneaRegistroCumplimiento: string;
  idForaneaFederacion: string;
  idForaneaSolicitanteRevicion: string;
  detallesSolicitud: string;
  estado: string;
}

export interface solicitudRevicionDatosAmpleosInterface extends solicitudRevicionInterface {
  registroCumplimientos: registroCumplimientoEvaluacionInterface;
  federaciones: federacionInterface;
  perfiles: perfilInterface;
  
}


export interface respuestaSolicitudRevicionInterface {
  idRespuesta: string;
  created_at: string;
  idForaneaFederacion: string;
  idForaneaSolicitudRevicion: string;
  idForaneaRevisor: string;
  aprobacion: string;
  detallesRespuesta: string;
}

export interface respuestaSolicitudRevicionDatosAmpleosInterface extends respuestaSolicitudRevicionInterface {
  federaciones: federacionInterface;
  solicitudReviciones: solicitudRevicionInterface;
  perfiles: perfilInterface;
}

export interface resultadosEventoInterface {
  rankin: number;
  idForaneaEvento: string;
  idForaneaRegion: string;
  idForaneaBanda: string;
  fechaEvento: string; // formato 'YYYY-MM-DD'
  anioEvento: number;
  total: number;
  promedio: number;
  eventosParticipados: number;
  idForaneaFederacion: string;
  idForaneaCategoria: string;
  nombreRegion: string;
  nombreBanda: string;
  nombreCategoria: string;
  LugarEvento: string;
}

export interface resultadosEventoDatosAmpleosInterface extends resultadosEventoInterface {
  registroEventos: RegistroEventoInterface;
  regiones: regionesInterface;
  bandas: bandaInterface;
  federaciones: federacionInterface;
  categorias: categoriaInterface;
}



export interface vistaSolicitudRevicionInterface {
  puntosCumplimiento: number;
  created_at: string; // timestamp con zona horaria
  idForaneaFederacion: string;
  idForaneaSolicitanteRevicion: string;
  idForaneaRegistroCumplimiento: string;
  idForaneaRegion: string;
  idForaneaCategoria: string;
  idForaneaBanda: string;
  idForaneaEvento: string;
  idForaneaRubrica: string;
  idForaneaCriterio: string;
  idForaneaCumplimiento: string;
  idforaneaevaluador: string;
  idSolicitud: string;
  nombresolicitante: string;
  nombreevaluador: string;
  nombreRegion: string;
  detallesSolicitud: string;
  nombreCategoria: string;
  nombreBanda: string;
  LugarEvento: string;
  nombreRubrica: string;
  datalleRubrica: string;
  nombreCriterio: string;
  detallesCriterio: string;
  detalleCumplimiento: string;
  estado: string;
}

export interface vistaAsistenBandasModel {
  idForaneaEvento: string;
  created_at: string; // timestamp with time zone
  idForaneaCategoria: string;
  idForaneaRegion: string;
  idForaneaFederacion: string;
    fechaFundacionBanda: string | null; // formato 'YYYY-MM-DD'
    fechaInscripcionAFederacion: string | null; // formato 'YYYY-MM-DD'
  idBanda: string;
  LugarEvento: string;
  urlLogoBanda: string;
  ubicacionSedeBanda: string;
  nombreBanda: string;
  AliasBanda: string;
  ciudadBanda: string;
}


export interface vistaResultadosModel {
  idRegistroCumplimientoEvaluacion: string;
  idForaneaRegion: string;
  idForaneaCategoria: string;
  idForaneaPerfil: string;
  idForaneaFederacion: string;
  idForaneaEvento: string;
  idForaneaBanda: string;
  idForaneaRubrica: string;
  idForaneaCumplimiento: string;
  fechaEvento: string; // formato 'YYYY-MM-DD'
  anioEvento: number;
  puntosObtenidos: number;
  nombreCriterio: string;
  detalleCumplimiento: string;
  LugarEvento: string;
  nombreBanda: string;
  nombreRubrica: string;
  nombreRegion: string;
  nombreCategoria: string;
  nombre: string;
  idForaneaCriterio: string;
}






export interface vistaResultadosTenporadaInterface {
  idBanda: string;
  nombreBanda: string;
  idCategoria: string;
  nombreCategoria: string;
  rankin: number;
  promedio: number;
  /** Suma de puntos en eventos regional/nacional del año (sin sanciones). */
  total_antes_sanciones: number;
  /** Puntos restados por sanciones aplicadas en el año. */
  sanciones: number;
  /** Puntos netos de temporada; el ranking usa este valor. */
  total_despues_sanciones: number;
}

/** Filas de `vista_resultados_temporada` (misma forma que {@link vistaResultadosTenporadaInterface}). */
export type resultadosTemporadaInterface = vistaResultadosTenporadaInterface;

/** Filas de `vista_resultados_preliminares`.
 *  Una fila por banda por evento+categoría, con total acumulado y ranking calculado en la vista. */
export interface vistaResultadosPreliminaresInterface {
  /** UUID de la federación — usar para filtrar en queries. */
  idForaneaFederacion: string;
  /** UUID del evento. */
  idEvento: string;
  LugarEvento: string;
  /** Formato 'YYYY-MM-DD'. */
  fechaEvento: string;
  anioEvento: number;
  /** UUID de la región del evento. */
  idForaneaRegion: string;
  nombreRegion: string;
  /** UUID de la banda. */
  idForaneaBanda: string;
  nombreBanda: string;
  /** UUID de la categoría (proviene de registroCumplimientoEvaluaciones). */
  idForaneaCategoria: string;
  nombreCategoria: string;
  /** Suma de puntosObtenidos de todos los registros de la banda en el evento+categoría. */
  total: number;
  /** Posición dentro del evento+categoría+federación (DENSE_RANK, 1 = mejor). */
  rankin: number;
}


export  interface userInterface {
  instance_id?: string;
  id: string;
  aud?: string;
  role?: string;
  email?: string;
  encrypted_password?: string;
  email_confirmed_at?: string;
  invited_at?: string;
  confirmation_token?: string;
  confirmation_sent_at?: string;
  recovery_token?: string;
  recovery_sent_at?: string;
  email_change_token_new?: string;
  email_change?: string;
  email_change_sent_at?: string;
  last_sign_in_at?: string;
  raw_app_meta_data?: any;
  raw_user_meta_data?: any;
  is_super_admin?: boolean;
  created_at?: string;
  updated_at?: string;
  phone?: string;
  phone_confirmed_at?: string;
  phone_change?: string;
  phone_change_token?: string;
  phone_change_sent_at?: string;
  confirmed_at?: string;
  email_change_token_current?: string;
  email_change_confirm_status?: number;
  banned_until?: string;
  reauthentication_token?: string;
  reauthentication_sent_at?: string;
  is_sso_user: boolean;
  deleted_at?: string;
  is_anonymous: boolean;
}

export interface confirmacionAsistenciaInterface {
  id_confirmacion_asistencia: string;
  created_at: string;
  id_foranea_evento: string;
  id_foranea_banda: string;
  estado_asistencia: boolean;

  estado_cancha: "pendiente" | "ya_en_cancha" | "finalizado";
}

/** Payload para insertar; el resto del registro lo genera la base de datos. */
export type confirmacionAsistenciaInsert = Pick<
  confirmacionAsistenciaInterface,
  "id_foranea_banda" | "id_foranea_evento" | "estado_asistencia"
>;

/** Solo se actualiza el estado de asistencia. */
export type confirmacionAsistenciaEstadoUpdate = Pick<
  confirmacionAsistenciaInterface,
  "estado_asistencia"
>;

/** Fila de lista de asistencia: confirmación + datos de banda para UI de solo lectura */
export interface confirmacionConBandaInterface extends confirmacionAsistenciaInterface {
  nombreBanda: string;
  AliasBanda: string | null;
  urlLogoBanda: string | null;
  idForaneaCategoria: string;
  nombreCategoria: string;
}

export interface vistaBandasConfirmadasParaEventoInterface {
  idBanda:                     string;
  created_at:                  string; // Podrías usar Date si planeas transformarlo
  nombreBanda:                 string;
  AliasBanda:                  string | null;
  idForaneaCategoria:          string;
  idForaneaRegion:             string;
  idForaneaFederacion:         string;
  ciudadBanda:                 string | null;
  urlLogoBanda:                string | null;
  fechaFundacionBanda:         string | null;
  fechaInscripcionAFederacion: string | null;
  ubicacionSedeBanda:          string | null;
  id_foranea_banda:            string;
}


export interface escuadraInterface {
  id_escuadra: string;
  created_at: string;
  nombre_escuadra: string;
}

export interface PremioEscuadraInterface {
  id_premio_escuadra: string;    // uuid, non-nullable
  created_at: string | Date;     // timestamp with time zone
  id_foranea_banda: string ;    // uuid, nullable
  id_foranea_escuadra: string ; // uuid, 
  id_foranea_evento: string ;   // uuid, 
}





export interface vistaRendimientoPorRubricaEventoInterface {
  idEvento: string ;
  LugarEvento: string ;
  idRegion: string ;
  nombreRegion: string ;
  idBanda: string ;
  idForaneaCategoria: string ;
  nombreBanda: string ;
  idRubrica: string ;
  nombreRubrica: string ;
  total: number ;
  rendimiento: number ;
}


export interface vistaRendimientoPorRubricaGlobalInterface {
  idRubrica: string ;
  nombreRubrica: string ;
  idRegion: string ;
  nombreRegion: string ;
  idBanda: string ;
  idForaneaCategoria: string ;
  nombreBanda: string ;
  total: number ;
  rendimiento: number ;
}

export interface vistaAsistenciaEventosInterface  {
  idEvento: string 
  LugarEvento: string 
  idBanda: string 
  nombreBanda: string 
}

export interface vistaAsistenciaEventosGlobalInterface {
  nombreBanda: string ;
  cantidad: number ;
}


export interface rankingGlobalTemporadaActualInterface {
  idBanda: string ;
  nombreBanda: string ;
  idCategoria: string ;
  nombreCategoria: string ;
  rankin: number ;
  promedio: number ;
  total: number ;
}

export interface copaInterface {
  id_copas: string;
  created_at: string;
  id_foranea_evento: string;
  id_foranea_banda: string;
  lugar: number;
  tipo: "directo" | "desempate";
}



export interface vistaCopasEventosInterface {
  id_copas: string;
  id_foranea_evento: string;
  LugarEvento: string;
  tipo_evento: string;
  idForaneaRegion: string;
  nombreBanda: string;
  idForaneaCategoria: string;
  lugar: number;
  tipo: string;
}

export interface vistaCopasGlobalInterface {
  lugar: number ;
  idBanda: string ;
  nombreBanda: string ;
  idForaneaRionBanda: string ;
  idForaneaCategoria: string ;
  cantidad: number 
}

export interface vistaCopasTemporadaInterface {
  idBanda: string;
  nombreBanda: string;
  idForaneaCategoria: string;
  nombreCategoria: string;
  idForaneaRegion: string;
  nombreRegion: string;
  max_lugar: number;
  copas_1: number;
  copas_2: number;
  copas_3: number;
  copas_4: number;
  copas_5: number;
  total_puntos: number;
  rankin_categoria: number;
  rankin_regional: number;
}


export interface vistaResultadosPorEventoInterface {
  // Identificadores base y Evento
  idRegistroCumplimientoEvaluacion?: string | null;
  idEvento?: string | null;
  LugarEvento?: string | null;
  fechaEvento?: string | Date | null; // Mapeado de 'date'
  tipo_evento?: string | null;
  tipo_lugar?: string | null;

  // Banda y Clasificación
  idBanda?: string | null;
  nombreBanda?: string | null;
  idForaneaCategoria?: string | null;
  idForaneaRegion?: string | null;
  nombreCategoria?: string | null;
  nombreRegion?: string | null;

  // Rúbrica
  idRubrica?: string | null;
  nombreRubrica?: string | null;
  datalleRubrica?: string | null; // Ojo: mantiene el typo 'datalle' del JSON
  puntosRubrica?: number | null;

  // Criterio
  idCriterio?: string | null;
  nombreCriterio?: string | null;
  detallesCriterio?: string | null;
  puntosCriterio?: number | null;

  // Cumplimiento y Resultados
  idCumplimiento?: string | null;
  detalleCumplimiento?: string | null;
  puntosCumplimiento?: number | null;
  puntosObtenidos?: number | null;

  // Perfil / Evaluador
  idPerfil?: string | null;
  nombre?: string | null;
  primerApellido?: string | null;
}



export interface sancionInterface {
  id_sancion: string;
  created_at: string | Date;
  detalles_sancion: string;
  puntos_sancion: number;
  fecha_creacion_sancion?: string | Date | null;
  version?: string | null;
}

export interface registroSancionInterface {
  id_registro_sanciones: string;
  created_at: string | Date;
  id_foranea_sancion?: string | null;
  id_foranea_banda?: string | null;
  id_foranea_perfil?: string | null;
  fecha?: string | Date | null;
  justificacion?: string | null;
}


export interface vistaAplicacionSancionInterface {
  // Datos del Registro e Historial
  id_registro_sanciones?: string | null;
  fecha_aplico_sancion?: string | Date | null;
  justificacion?: string | null;

  // Datos de la Sanción aplicada
  id_sancion?: string | null;
  detalles_sancion?: string | null;
  fecha_creacion_sancion?: string | Date | null;
  version?: string | null;
  puntos_sancion?: number | null;

  // Datos de la Banda implicada
  idBanda?: string | null;
  nombreBanda?: string | null;
  idCategoria?: string | null;
  nombreCategoria?: string | null;
  idRegion?: string | null;
  nombreRegion?: string | null;

  // Datos de la autoridad / Sancionador
  id_sancionador?: string | null;
  nombre_sancionador?: string | null;
  apellido_sancionador?: string | null;
}


export interface solicitudSancionInterface {
  id_solicitud_sancion: string; // uuid
  created_at_solicitud_sancion: Date | string; // timestamp with time zone
  id_fonranea_sancion: string; // uuid (ojo: notar el pequeño typo 'fonranea' del origen)
  id_foranea_banda: string; // uuid
  id_foranea_solicitante: string; // uuid
  justificacion: string; // text
  estado: boolean | null; // boolean
}

export interface vistaDetalleSolicitudSancionInterface {
  id_solicitud_sancion?: string | null; // uuid
  created_at_solicitud_sancion?: Date | string | null; // timestamp with time zone
  justificacion?: string | null; // text
  estado?: boolean | null; // boolean
  id_sancion?: string | null; // uuid
  detalles_sancion?: string | null; // text
  puntos_sancion?: number | null; // numeric
  version?: string | null; // text
  fecha_creacion_sancion?: Date | string | null; // date
  idBanda?: string | null; // uuid
  nombreBanda?: string | null; // text
  idCategoria?: string | null; // uuid
  nombreCategoria?: string | null; // text
  idRegion?: string | null; // uuid
  nombreRegion?: string | null; // text
}


export interface solicitudCopaInterface {
  id_solicitud_copa: string; // uuid
  created_at_solicitud_copa: Date | string; // timestamp with time zone
  id_foranea_evento: string; // uuid
  id_foranea_banda: string; // uuid
  id_foranea_solicitante: string; // uuid
  tipo_solicitud_copa: string; // text
  justificacion_solicitud_copa: string; // text
  estado?: boolean | null; // boolean (permitido nulo u opcional)
  lugar_solicitud_copas: number; // numeric
}

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


  export interface vistaUsuariosPorBandaEnEventoInterface {
    id_foranea_banda: string;     // uuid
    id_foranea_evento: string;    // uuid
    id_foranea_categoria: string; // uuid
    id_fonranea_perfil: string;   // uuid (mantiene el typo 'id_fonranea' del JSON original)
    nombre: string;               // text
    primerApellido: string;       // text
  }

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


  export interface CheckoutDetalleInterface {
    id_checkout?: string | null;
    created_at_checkout?: string | Date | null;
    id_foranea_banda?: string | null;
    hora_llegada_banda?: string | Date | null;
    confirmacion_horallegada?: boolean | null;
    time_confirmacion_hora_llegada?: string | null; 
    cantidad_integrantes?: number | null; 
    cantidad_palillonas?: number | null;
    aportacion?: number | null;
    hora_ingreso?: string | Date | null;
    confirmacion_hora_ingreso?: boolean | null;
    time_confirmacion_hora_ingreso?: string | Date | null;
    observaciones?: string | null;
    time_envio_confirmacion_llegada?: string | Date | null;
    time_envio_confirmacion_ingreso?: string | Date | null;
    id_foranea_diciplina?: string | null;
    id_foranea_confirmador?: string | null;
    nombreBanda?: string | null;
    id_foranea_categoria?: string | null;
    nombreCategoria?: string | null;
    id_foranea_region?: string | null;
    nombreRegion?: string | null;
    nombre_encargado_diciplina?: string | null;
    apellido_encargado_diciplina?: string | null;
    nombre_confirmador?: string | null;
    apellido_confirmador?: string | null;
    id_foranea_evento: string;
    LugarEvento: string;
  }

  export interface vistaCondensado   {
    idRegion?: string | null;
    nombreRegion?: string | null;
    idCategoria?: string | null;
    nombreCategoria?: string | null;
    idEvento?: string | null;
    LugarEvento?: string | null;
    idBanda?: string | null;
    nombreBanda?: string | null;
    idRubrica?: string | null;
    nombreRubrica?: string | null;
    total?: number | null;
  }